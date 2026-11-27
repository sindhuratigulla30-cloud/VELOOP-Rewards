
import mongoose from "mongoose";
import { randomUUID } from "crypto";

import User from "../models/User.js";
import Giveaway from "../models/Giveaway.js";
import GiveawayPrize from "../models/GiveawayPrize.js";
import Participation from "../models/Participation.js";
import WalletTransaction from "../models/WalletTransaction.js";
import AuditLog from "../models/AuditLog.js";

const writeAuditLog = async (data) => {
  await AuditLog.create(data).catch((error) => {
    console.error("Audit log write failed:", error.message);
  });
};

// Join a giveaway
export const joinGiveaway = async (req, res) => {
  const { giveawayId } = req.params;
  const { prizeId } = req.body || {};

  const idempotencyKey =
    typeof req.headers["idempotency-key"] === "string"
      ? req.headers["idempotency-key"].trim()
      : "";

  if (
    !mongoose.Types.ObjectId.isValid(giveawayId) ||
    !mongoose.Types.ObjectId.isValid(prizeId)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid giveaway or prize ID."
    });
  }

  if (!req.user?._id) {
    return res.status(401).json({
      success: false,
      message: "Please log in to participate."
    });
  }

  // Handle duplicate requests safely using the idempotency key.
  if (idempotencyKey) {
    const replayed = await Participation.findOne({
      userId: req.user._id,
      giveawayId,
      prizeId,
      idempotencyKey
    })
      .populate("prizeId", "name")
      .lean();

    if (replayed) {
      // Use the wallet already loaded by authentication middleware.
      const remainingBalance =
        req.user?.wallet?.[replayed.currency] ?? null;

      return res.status(200).json({
        success: true,
        message: "Giveaway participation already recorded.",
        data: {
          participationId: replayed._id,
          prizeName: replayed.prizeId?.name || "Giveaway prize",
          entryFee: replayed.entryFee,
          currency: replayed.currency,
          remainingBalance,
          replayed: true
        }
      });
    }
  }

  const session = await mongoose.startSession();

  try {
    let result;

    await session.withTransaction(async () => {
      const now = new Date();

      const giveaway = await Giveaway.findById(giveawayId)
        .session(session);

      if (!giveaway) {
        throw new Error("GIVEAWAY_NOT_FOUND");
      }

      if (
        giveaway.status !== "active" ||
        now < new Date(giveaway.startDate) ||
        now > new Date(giveaway.endDate)
      ) {
        throw new Error("GIVEAWAY_NOT_ACTIVE");
      }

      const giveawayPrize = await GiveawayPrize.findOne({
        giveawayId,
        prizeId,
        isAvailable: true
      })
        .populate("prizeId")
        .session(session);

      if (!giveawayPrize || !giveawayPrize.prizeId) {
        throw new Error("PRIZE_NOT_AVAILABLE");
      }

      const prize = giveawayPrize.prizeId;

      if (!prize.isActive) {
        throw new Error("PRIZE_NOT_AVAILABLE");
      }

      const entryFee = Number(prize.entryFee);
      const currency = prize.currency;

      if (
        !Number.isFinite(entryFee) ||
        entryFee <= 0 ||
        !["VEs", "SVEs", "Tokens"].includes(currency)
      ) {
        throw new Error("INVALID_CURRENCY");
      }

      const user = await User.findById(req.user._id)
        .session(session);

      if (!user || user.status !== "active") {
        throw new Error("USER_NOT_ACTIVE");
      }

      const existingParticipation = await Participation.findOne({
        userId: user._id,
        giveawayId
      }).session(session);

      if (existingParticipation) {
        throw new Error("ALREADY_JOINED");
      }

      const currentBalance = Number(user.wallet?.[currency] || 0);

      if (currentBalance < entryFee) {
        throw new Error("INSUFFICIENT_BALANCE");
      }

      // Deduct the entry fee from the correct wallet currency.
      user.wallet[currency] = currentBalance - entryFee;

      await user.save({ session });

      // Create participation record.
      const participation = await Participation.create(
        [
          {
            userId: user._id,
            giveawayId,
            prizeId,
            entryFee,
            currency,
            status: "joined",
            joinedAt: now,
            ...(idempotencyKey ? { idempotencyKey } : {}),
            deviceHash: req.securityContext?.deviceHash || ""
          }
        ],
        { session }
      );

      // Create wallet transaction record.
      await WalletTransaction.create(
        [
          {
            userId: user._id,
            giveawayId,
            prizeId,
            type: "debit",
            amount: entryFee,
            currency,
            description: `Entry fee for ${prize.name}`,
            referenceId: randomUUID(),
            status: "completed"
          }
        ],
        { session }
      );

      result = {
        participationId: participation[0]._id,
        prizeName: prize.name,
        entryFee,
        currency,
        remainingBalance: user.wallet[currency]
      };
    });

    await writeAuditLog({
      userId: req.user._id,
      action: "JOIN_GIVEAWAY",
      giveawayId,
      prizeId,
      amount: result.entryFee,
      currency: result.currency,
      result: "success",
      requestId: req.securityContext?.requestId,
      ipHash: req.securityContext?.ipHash,
      deviceHash: req.securityContext?.deviceHash
    });

    return res.status(201).json({
      success: true,
      message: "Successfully joined the giveaway",
      data: result
    });

  } catch (error) {
    console.error("Join giveaway error:", error);

    await writeAuditLog({
      userId: req.user?._id || null,
      action: "JOIN_REJECTED",
      giveawayId,
      prizeId,
      result: "rejected",
      requestId: req.securityContext?.requestId,
      ipHash: req.securityContext?.ipHash,
      deviceHash: req.securityContext?.deviceHash,
      details: { errorCode: error.message || "UNKNOWN_ERROR" }
    });

    const errors = {
      GIVEAWAY_NOT_FOUND: [
        404,
        "GIVEAWAY_NOT_FOUND",
        "Giveaway not found."
      ],
      GIVEAWAY_NOT_ACTIVE: [
        400,
        "GIVEAWAY_NOT_ACTIVE",
        "This giveaway is not currently active."
      ],
      PRIZE_NOT_AVAILABLE: [
        404,
        "PRIZE_NOT_AVAILABLE",
        "This prize is not available."
      ],
      USER_NOT_ACTIVE: [
        403,
        "USER_NOT_ACTIVE",
        "Your account is not active."
      ],
      ALREADY_JOINED: [
        409,
        "ALREADY_PARTICIPATING",
        "You have already joined this giveaway."
      ],
      INSUFFICIENT_BALANCE: [
        400,
        "INSUFFICIENT_BALANCE",
        "Insufficient wallet balance."
      ],
      INVALID_CURRENCY: [
        400,
        "INVALID_CURRENCY",
        "Invalid prize entry fee or currency."
      ]
    };

    if (errors[error.message]) {
      const [statusCode, code, message] = errors[error.message];

      return res.status(statusCode).json({
        success: false,
        code,
        message
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already joined this giveaway."
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to join giveaway. Please try again."
    });

  } finally {
    await session.endSession();
  }
};

// Get current active giveaway
export const getCurrentGiveaway = async (req, res) => {
  try {
    const now = new Date();

    let giveaway = await Giveaway.findOne({
      status: "active",
      startDate: { $lte: now }
    }).sort({ startDate: -1 });

    if (!giveaway) {
      return res.status(404).json({
        success: false,
        message: "No active giveaway is currently available."
      });
    }

    if (now > new Date(giveaway.endDate)) {
      const updated = await Giveaway.findOneAndUpdate(
        { _id: giveaway._id, status: "active" },
        { $set: { status: "ended" } },
        { new: true }
      );

      if (updated) {
        giveaway = updated;
      }
    }

    const giveawayPrizes = await GiveawayPrize.find({
      giveawayId: giveaway._id,
      isAvailable: true
    })
      .populate("prizeId")
      .sort({ displayOrder: 1 });

    const participantCount = await Participation.countDocuments({
      giveawayId: giveaway._id
    });

    const prizes = giveawayPrizes
      .filter((item) => item.prizeId && item.prizeId.isActive)
      .map((item) => ({
        giveawayPrizeId: item._id,
        prizeId: item.prizeId._id,
        name: item.prizeId.name,
        description: item.prizeId.description,
        image: item.prizeId.image,
        entryFee: item.prizeId.entryFee,
        currency: item.prizeId.currency,
        quantity: item.quantity,
        isAvailable: item.isAvailable
      }));

    return res.status(200).json({
      success: true,
      giveaway,
      participantCount,
      prizes
    });

  } catch (error) {
    console.error("Get current giveaway error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load current giveaway."
    });
  }
};

// Get a giveaway by ID
export const getGiveawayById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid giveaway ID."
      });
    }

    let giveaway = await Giveaway.findOne({
      _id: id,
      status: { $ne: "draft" }
    });

    if (!giveaway) {
      return res.status(404).json({
        success: false,
        message: "Giveaway not found."
      });
    }

    if (
      giveaway.status === "active" &&
      new Date(giveaway.endDate) < new Date()
    ) {
      giveaway = await Giveaway.findOneAndUpdate(
        { _id: giveaway._id, status: "active" },
        { $set: { status: "ended" } },
        { new: true }
      ) || giveaway;
    }

    const giveawayPrizes = await GiveawayPrize.find({
      giveawayId: giveaway._id,
      isAvailable: true
    })
      .populate("prizeId")
      .sort({ displayOrder: 1 });

    const prizes = giveawayPrizes
      .filter((item) => item.prizeId && item.prizeId.isActive)
      .map((item) => ({
        giveawayPrizeId: item._id,
        prizeId: item.prizeId._id,
        name: item.prizeId.name,
        description: item.prizeId.description,
        image: item.prizeId.image,
        entryFee: item.prizeId.entryFee,
        currency: item.prizeId.currency,
        quantity: item.quantity,
        isAvailable: item.isAvailable
      }));

    return res.status(200).json({
      success: true,
      giveaway,
      prizes
    });

  } catch (error) {
    console.error("Get giveaway by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load giveaway."
    });
  }
};

// Get the authenticated user's participation status for a giveaway.
export const getMyGiveawayStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        code: "INVALID_GIVEAWAY",
        message: "Invalid giveaway ID."
      });
    }

    const giveaway = await Giveaway.findById(id)
      .select("title status startDate endDate");

    if (!giveaway) {
      return res.status(404).json({
        success: false,
        code: "GIVEAWAY_NOT_FOUND",
        message: "Giveaway not found."
      });
    }

    const participation = await Participation.findOne({
      userId: req.user._id,
      giveawayId: giveaway._id
    })
      .populate("prizeId", "name")
      .lean();

    return res.status(200).json({
      success: true,
      giveaway: {
        id: giveaway._id,
        title: giveaway.title,
        status: giveaway.status
      },
      participating: Boolean(participation),
      participation: participation
        ? {
            id: participation._id,
            prize: participation.prizeId?.name || "Giveaway prize",
            status: participation.status,
            joinedAt: participation.joinedAt
          }
        : null
    });

  } catch (error) {
    console.error("Get my giveaway status error:", error);

    return res.status(500).json({
      success: false,
      code: "STATUS_LOAD_FAILED",
      message: "Unable to load giveaway status."
    });
  }
};

// Get previous giveaways
export const getPreviousGiveaways = async (req, res) => {
  try {
    const now = new Date();

    const giveaways = await Giveaway.find({
      status: { $in: ["ended", "completed"] },
      endDate: { $lt: now }
    }).sort({ endDate: -1 });

    return res.status(200).json({
      success: true,
      count: giveaways.length,
      giveaways
    });

  } catch (error) {
    console.error("Get previous giveaways error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load previous giveaways."
    });
  }
};
