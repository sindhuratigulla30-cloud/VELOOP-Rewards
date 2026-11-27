
import mongoose from "mongoose";

import User from "../models/User.js";
import Giveaway from "../models/Giveaway.js";
import Prize from "../models/Prize.js";
import GiveawayPrize from "../models/GiveawayPrize.js";
import Participation from "../models/Participation.js";
import GiveawayWinner from "../models/GiveawayWinner.js";
import PrizeClaim from "../models/PrizeClaim.js";
import WalletTransaction from "../models/WalletTransaction.js";
import AuditLog from "../models/AuditLog.js";

const currencies = ["VEs", "SVEs", "Tokens"];

const validId = (id) => mongoose.isValidObjectId(id);

const parseDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const auditAdminAction = async (req, action, giveawayId, prizeId = null, details = {}) => {
  try {
    await AuditLog.create({
      userId: req.user._id,
      action,
      giveawayId,
      prizeId,
      result: "success",
      requestId: req.headers["x-request-id"],
      details
    });
  } catch (error) {
    console.error("Admin audit logging failed:", error.message);
  }
};

const hasParticipationHistory = async (giveawayId) => {
  const [participations, winners, claims] = await Promise.all([
    Participation.countDocuments({ giveawayId }),
    GiveawayWinner.countDocuments({ giveawayId }),
    PrizeClaim.countDocuments({ giveawayId })
  ]);

  return participations > 0 || winners > 0 || claims > 0;
};

// Admin dashboard statistics
export const getAdminDashboard = async (req, res) => {
  try {
    const [
      totalMembers,
      activeMembers,
      totalGiveaways,
      activeGiveaways,
      completedGiveaways,
      totalParticipations,
      totalWinners,
      pendingClaims,
      totalTransactions
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "user", status: "active" }),
      Giveaway.countDocuments(),
      Giveaway.countDocuments({ status: "active" }),
      Giveaway.countDocuments({ status: "completed" }),
      Participation.countDocuments(),
      GiveawayWinner.countDocuments(),
      PrizeClaim.countDocuments({ status: "pending" }),
      WalletTransaction.countDocuments()
    ]);

    return res.status(200).json({
      success: true,
      statistics: {
        totalMembers,
        activeMembers,
        totalGiveaways,
        activeGiveaways,
        completedGiveaways,
        totalParticipations,
        totalWinners,
        pendingClaims,
        totalTransactions
      }
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load admin dashboard."
    });
  }
};

// Admin: View and search members
export const getAllMembers = async (req, res) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number.parseInt(req.query.limit, 10) || 20)
    );

    const search = String(req.query.search || "").trim();
    const status = String(req.query.status || "").trim();

    const filter = { role: "user" };

    if (search) {
      const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      filter.$or = [
        { name: { $regex: safeSearch, $options: "i" } },
        { email: { $regex: safeSearch, $options: "i" } }
      ];
    }

    if (["active", "inactive"].includes(status)) {
      filter.status = status;
    }

    const [members, totalMembers] = await Promise.all([
      User.find(filter)
        .select("name email phone role wallet status createdAt")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),

      User.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      members,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalMembers / limit),
        totalMembers,
        limit
      }
    });
  } catch (error) {
    console.error("Admin members error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load members."
    });
  }
};

// Admin: List giveaways and their prizes
export const getAllGiveaways = async (req, res) => {
  try {
    const giveaways = await Giveaway.find()
      .sort({ createdAt: -1 })
      .lean();

    const giveawayIds = giveaways.map((giveaway) => giveaway._id);

    const prizeLinks = await GiveawayPrize.find({
      giveawayId: { $in: giveawayIds }
    })
      .populate("prizeId")
      .sort({ displayOrder: 1 })
      .lean();

    const result = giveaways.map((giveaway) => ({
      ...giveaway,
      prizes: prizeLinks.filter(
        (link) => String(link.giveawayId) === String(giveaway._id)
      )
    }));

    return res.status(200).json({
      success: true,
      giveaways: result
    });
  } catch (error) {
    console.error("Admin giveaways error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load giveaways."
    });
  }
};

// Admin: Create a draft giveaway
export const createGiveaway = async (req, res) => {
  try {
    const {
      title,
      description = "",
      bannerImage = "",
      startDate,
      endDate,
      rules = [],
      termsAndConditions = []
    } = req.body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      title.trim().length > 150
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid giveaway title is required (maximum 150 characters)."
      });
    }

    const start = parseDate(startDate);
    const end = parseDate(endDate);

    if (!start || !end || end <= start) {
      return res.status(400).json({
        success: false,
        message: "Valid start and end dates are required. End date must be after start date."
      });
    }

    if (
      typeof description !== "string" ||
      description.length > 5000 ||
      typeof bannerImage !== "string" ||
      bannerImage.length > 2000 ||
      !Array.isArray(rules) ||
      !Array.isArray(termsAndConditions) ||
      rules.length > 50 ||
      termsAndConditions.length > 50 ||
      [...rules, ...termsAndConditions].some(
        (item) => typeof item !== "string" || item.length > 1000
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid giveaway description, banner, rules or terms."
      });
    }

    const giveaway = await Giveaway.create({
      title: title.trim(),
      description: description.trim(),
      bannerImage: bannerImage.trim(),
      startDate: start,
      endDate: end,
      rules: rules.map((item) => item.trim()),
      termsAndConditions: termsAndConditions.map((item) => item.trim()),
      status: "draft"
    });

    await auditAdminAction(
      req,
      "ADMIN_GIVEAWAY_CREATED",
      giveaway._id,
      null,
      { title: giveaway.title }
    );

    return res.status(201).json({
      success: true,
      message: "Draft giveaway created successfully.",
      giveaway
    });
  } catch (error) {
    console.error("Create giveaway error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create giveaway."
    });
  }
};

// Admin: Update giveaway information
export const updateGiveaway = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid giveaway ID."
      });
    }

    const giveaway = await Giveaway.findById(id);

    if (!giveaway) {
      return res.status(404).json({
        success: false,
        message: "Giveaway not found."
      });
    }

    if (giveaway.status !== "draft") {
      return res.status(409).json({
        success: false,
        message: "Only draft giveaways can be edited."
      });
    }

    if (await hasParticipationHistory(id)) {
      return res.status(409).json({
        success: false,
        message: "Giveaway configuration is locked because participation history exists."
      });
    }

    const allowedFields = [
      "title",
      "description",
      "bannerImage",
      "startDate",
      "endDate",
      "rules",
      "termsAndConditions"
    ];

    for (const field of Object.keys(req.body)) {
      if (!allowedFields.includes(field)) {
        return res.status(400).json({
          success: false,
          message: `Field '${field}' cannot be updated here.`
        });
      }
    }

    if (req.body.title !== undefined) {
      if (
        typeof req.body.title !== "string" ||
        !req.body.title.trim() ||
        req.body.title.trim().length > 150
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid giveaway title."
        });
      }

      giveaway.title = req.body.title.trim();
    }

    for (const field of ["description", "bannerImage"]) {
      if (req.body[field] !== undefined) {
        if (
          typeof req.body[field] !== "string" ||
          req.body[field].length > (field === "description" ? 5000 : 2000)
        ) {
          return res.status(400).json({
            success: false,
            message: `Invalid ${field}.`
          });
        }

        giveaway[field] = req.body[field].trim();
      }
    }

    for (const field of ["startDate", "endDate"]) {
      if (req.body[field] !== undefined) {
        const date = parseDate(req.body[field]);

        if (!date) {
          return res.status(400).json({
            success: false,
            message: `Invalid ${field}.`
          });
        }

        giveaway[field] = date;
      }
    }

    for (const field of ["rules", "termsAndConditions"]) {
      if (req.body[field] !== undefined) {
        const value = req.body[field];

        if (
          !Array.isArray(value) ||
          value.length > 50 ||
          value.some(
            (item) => typeof item !== "string" || item.length > 1000
          )
        ) {
          return res.status(400).json({
            success: false,
            message: `Invalid ${field}.`
          });
        }

        giveaway[field] = value.map((item) => item.trim());
      }
    }

    if (giveaway.endDate <= giveaway.startDate) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date."
      });
    }

    await giveaway.save();

    await auditAdminAction(
      req,
      "ADMIN_GIVEAWAY_UPDATED",
      giveaway._id,
      null,
      { updatedFields: Object.keys(req.body) }
    );

    return res.status(200).json({
      success: true,
      message: "Giveaway updated successfully.",
      giveaway
    });
  } catch (error) {
    console.error("Update giveaway error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update giveaway."
    });
  }
};

// Admin: Change giveaway status
export const updateGiveawayStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!validId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid giveaway ID."
      });
    }

    if (!["active", "ended"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be active or ended."
      });
    }

    const giveaway = await Giveaway.findById(id);

    if (!giveaway) {
      return res.status(404).json({
        success: false,
        message: "Giveaway not found."
      });
    }

    if (status === "active") {
      if (giveaway.status !== "draft") {
        return res.status(409).json({
          success: false,
          message: "Only draft giveaways can be activated."
        });
      }

      if (giveaway.endDate <= new Date()) {
        return res.status(400).json({
          success: false,
          message: "The giveaway end date must be in the future."
        });
      }

      const availablePrizes = await GiveawayPrize.countDocuments({
        giveawayId: giveaway._id,
        isAvailable: true
      });

      if (availablePrizes === 0) {
        return res.status(400).json({
          success: false,
          message: "Add at least one available prize before activating the giveaway."
        });
      }
    } else if (giveaway.status !== "active") {
      return res.status(409).json({
        success: false,
        message: "Only active giveaways can be ended manually."
      });
    }

    giveaway.status = status;
    await giveaway.save();

    await auditAdminAction(
      req,
      "ADMIN_GIVEAWAY_STATUS_CHANGED",
      giveaway._id,
      null,
      { status }
    );

    return res.status(200).json({
      success: true,
      message: `Giveaway status changed to ${status}.`,
      giveaway
    });
  } catch (error) {
    console.error("Giveaway status update error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update giveaway status."
    });
  }
};

// Admin: Add a new prize to a giveaway
export const addGiveawayPrize = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description = "",
      image = "",
      entryFee,
      currency,
      category = "General",
      quantity = 1,
      displayOrder = 0
    } = req.body;

    if (!validId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid giveaway ID."
      });
    }

    const giveaway = await Giveaway.findById(id);

    if (!giveaway) {
      return res.status(404).json({
        success: false,
        message: "Giveaway not found."
      });
    }

    if (!["draft", "active"].includes(giveaway.status)) {
      return res.status(409).json({
        success: false,
        message: "Prizes cannot be added to ended or completed giveaways."
      });
    }

    if (await hasParticipationHistory(id)) {
      return res.status(409).json({
        success: false,
        message: "Prizes cannot be changed after participation history exists."
      });
    }

    if (
      typeof name !== "string" ||
      !name.trim() ||
      name.trim().length > 150 ||
      typeof description !== "string" ||
      description.length > 2000 ||
      typeof image !== "string" ||
      image.length > 2000 ||
      typeof category !== "string" ||
      category.trim().length > 100 ||
      !Number.isSafeInteger(entryFee) ||
      entryFee < 1 ||
      !currencies.includes(currency) ||
      !Number.isSafeInteger(quantity) ||
      quantity < 1 ||
      quantity > 10000 ||
      !Number.isSafeInteger(displayOrder) ||
      displayOrder < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid prize details, entry fee, currency, quantity or display order."
      });
    }

    const prize = await Prize.create({
      name: name.trim(),
      description: description.trim(),
      image: image.trim(),
      entryFee,
      currency,
      category: category.trim() || "General",
      isActive: true
    });

    let giveawayPrize;

    try {
      giveawayPrize = await GiveawayPrize.create({
        giveawayId: giveaway._id,
        prizeId: prize._id,
        quantity,
        displayOrder,
        isAvailable: true
      });
    } catch (error) {
      await Prize.findByIdAndDelete(prize._id);
      throw error;
    }

    await auditAdminAction(
      req,
      "ADMIN_GIVEAWAY_PRIZE_ADDED",
      giveaway._id,
      prize._id,
      { name: prize.name, entryFee, currency, quantity }
    );

    return res.status(201).json({
      success: true,
      message: "Prize added successfully.",
      prize: giveawayPrize
    });
  } catch (error) {
    console.error("Add giveaway prize error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to add prize."
    });
  }
};

// Admin: Update prize configuration safely
export const updateGiveawayPrize = async (req, res) => {
  try {
    const { id, prizeId } = req.params;

    if (!validId(id) || !validId(prizeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid giveaway or prize ID."
      });
    }

    const giveaway = await Giveaway.findById(id);

    if (!giveaway) {
      return res.status(404).json({
        success: false,
        message: "Giveaway not found."
      });
    }

    if (!["draft", "active"].includes(giveaway.status)) {
      return res.status(409).json({
        success: false,
        message: "This giveaway's prizes can no longer be edited."
      });
    }

    if (await hasParticipationHistory(id)) {
      return res.status(409).json({
        success: false,
        message: "Prize configuration is locked because participation history exists."
      });
    }

    const link = await GiveawayPrize.findOne({
      giveawayId: id,
      prizeId
    });

    if (!link) {
      return res.status(404).json({
        success: false,
        message: "Prize is not attached to this giveaway."
      });
    }

    const allowedFields = [
      "name",
      "description",
      "image",
      "entryFee",
      "currency",
      "category",
      "quantity",
      "displayOrder",
      "isAvailable"
    ];

    for (const field of Object.keys(req.body)) {
      if (!allowedFields.includes(field)) {
        return res.status(400).json({
          success: false,
          message: `Field '${field}' cannot be updated.`
        });
      }
    }

    const prize = await Prize.findById(prizeId);

    if (!prize) {
      return res.status(404).json({
        success: false,
        message: "Prize record not found."
      });
    }

    const otherLinks = await GiveawayPrize.countDocuments({
      prizeId,
      giveawayId: { $ne: id }
    });

    // Clone shared prize records instead of changing other giveaways.
    let targetPrize = prize;

    if (otherLinks > 0) {
      targetPrize = await Prize.create({
        name: prize.name,
        description: prize.description,
        image: prize.image,
        entryFee: prize.entryFee,
        currency: prize.currency,
        category: prize.category,
        isActive: prize.isActive
      });

      link.prizeId = targetPrize._id;
    }

    for (const field of ["name", "description", "image", "category"]) {
      if (req.body[field] !== undefined) {
        if (
          typeof req.body[field] !== "string" ||
          req.body[field].length >
            (field === "description" || field === "image" ? 2000 : 150)
        ) {
          return res.status(400).json({
            success: false,
            message: `Invalid ${field}.`
          });
        }

        targetPrize[field] = req.body[field].trim();
      }
    }

    if (req.body.entryFee !== undefined) {
      if (!Number.isSafeInteger(req.body.entryFee) || req.body.entryFee < 1) {
        return res.status(400).json({
          success: false,
          message: "Entry fee must be a positive whole number."
        });
      }

      targetPrize.entryFee = req.body.entryFee;
    }

    if (req.body.currency !== undefined) {
      if (!currencies.includes(req.body.currency)) {
        return res.status(400).json({
          success: false,
          message: "Invalid prize currency."
        });
      }

      targetPrize.currency = req.body.currency;
    }

    if (req.body.quantity !== undefined) {
      if (
        !Number.isSafeInteger(req.body.quantity) ||
        req.body.quantity < 1 ||
        req.body.quantity > 10000
      ) {
        return res.status(400).json({
          success: false,
          message: "Quantity must be between 1 and 10000."
        });
      }

      link.quantity = req.body.quantity;
    }

    if (req.body.displayOrder !== undefined) {
      if (
        !Number.isSafeInteger(req.body.displayOrder) ||
        req.body.displayOrder < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Display order must be a non-negative whole number."
        });
      }

      link.displayOrder = req.body.displayOrder;
    }

    if (req.body.isAvailable !== undefined) {
      if (typeof req.body.isAvailable !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "isAvailable must be true or false."
        });
      }

      link.isAvailable = req.body.isAvailable;
    }

    await targetPrize.save();
    await link.save();

    await auditAdminAction(
      req,
      "ADMIN_GIVEAWAY_PRIZE_UPDATED",
      giveaway._id,
      targetPrize._id,
      { updatedFields: Object.keys(req.body) }
    );

    return res.status(200).json({
      success: true,
      message: "Prize configuration updated successfully.",
      prize: {
        ...link.toObject(),
        prizeId: targetPrize
      }
    });
  } catch (error) {
    console.error("Update giveaway prize error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update prize configuration."
    });
  }
};
