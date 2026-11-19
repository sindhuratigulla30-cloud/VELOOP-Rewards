
import mongoose from "mongoose";
import { randomInt } from "crypto";

import Giveaway from "../models/Giveaway.js";
import GiveawayPrize from "../models/GiveawayPrize.js";
import Participation from "../models/Participation.js";
import GiveawayWinner from "../models/GiveawayWinner.js";

// Securely shuffle participants using Node.js crypto.
const secureShuffle = (items) => {
  const shuffled = [...items];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
};

// Admin selects winners after the giveaway ends.
export const selectGiveawayWinners = async (req, res) => {
  const { giveawayId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(giveawayId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid giveaway ID."
    });
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

      if (giveaway.status === "completed") {
        throw new Error("WINNERS_ALREADY_SELECTED");
      }

      if (!["active", "ended"].includes(giveaway.status)) {
        throw new Error("INVALID_GIVEAWAY_STATUS");
      }

      if (now <= new Date(giveaway.endDate)) {
        throw new Error("GIVEAWAY_NOT_ENDED");
      }

      const giveawayPrizes = await GiveawayPrize.find({
        giveawayId: giveaway._id,
        isAvailable: true
      })
        .sort({ displayOrder: 1 })
        .session(session);

      const selectedWinners = [];

      for (const giveawayPrize of giveawayPrizes) {
        const quantity = Math.floor(giveawayPrize.quantity);

        if (!Number.isSafeInteger(quantity) || quantity < 1) {
          continue;
        }

        const participants = await Participation.find({
          giveawayId: giveaway._id,
          prizeId: giveawayPrize.prizeId,
          status: "joined"
        }).session(session);

        const shuffled = secureShuffle(participants);
        const winners = shuffled.slice(0, quantity);

        for (let i = 0; i < winners.length; i++) {
          const participant = winners[i];

          await GiveawayWinner.create(
            [
              {
                giveawayId: giveaway._id,
                prizeId: giveawayPrize.prizeId,
                participationId: participant._id,
                userId: participant.userId,
                rank: i + 1,
                selectedAt: now
              }
            ],
            { session }
          );

          const update = await Participation.updateOne(
            {
              _id: participant._id,
              status: "joined"
            },
            {
              $set: { status: "winner" }
            },
            { session }
          );

          if (update.modifiedCount !== 1) {
            throw new Error("PARTICIPATION_UPDATE_FAILED");
          }

          selectedWinners.push({
            userId: participant.userId,
            prizeId: giveawayPrize.prizeId,
            participationId: participant._id,
            rank: i + 1
          });
        }

        // Mark remaining participants for this prize as not selected.
        await Participation.updateMany(
          {
            giveawayId: giveaway._id,
            prizeId: giveawayPrize.prizeId,
            status: "joined"
          },
          {
            $set: { status: "not_selected" }
          },
          { session }
        );
      }

      // Complete the giveaway only if it has not already been processed.
      const completion = await Giveaway.updateOne(
        {
          _id: giveaway._id,
          status: giveaway.status,
          endDate: { $lt: now }
        },
        {
          $set: {
            status: "completed",
            winnerSelectionDate: now
          }
        },
        { session }
      );

      if (completion.modifiedCount !== 1) {
        throw new Error("WINNERS_ALREADY_SELECTED");
      }

      result = {
        giveawayId: giveaway._id,
        giveawayTitle: giveaway.title,
        totalWinners: selectedWinners.length,
        winners: selectedWinners
      };
    });

    return res.status(200).json({
      success: true,
      message: "Giveaway winners selected successfully.",
      data: result
    });

  } catch (error) {
    console.error("Winner selection error:", error);

    const errors = {
      GIVEAWAY_NOT_FOUND: [404, "Giveaway not found."],
      WINNERS_ALREADY_SELECTED: [409, "Winners have already been selected."],
      INVALID_GIVEAWAY_STATUS: [400, "Giveaway is not eligible for winner selection."],
      GIVEAWAY_NOT_ENDED: [400, "Winner selection is allowed only after the giveaway ends."],
      PARTICIPATION_UPDATE_FAILED: [409, "A participation record could not be updated."]
    };

    if (errors[error.message]) {
      const [statusCode, message] = errors[error.message];

      return res.status(statusCode).json({
        success: false,
        message
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to select giveaway winners."
    });

  } finally {
    await session.endSession();
  }
};

// Get publicly announced winners for a completed giveaway.
export const getGiveawayWinners = async (req, res) => {
  try {
    const { giveawayId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(giveawayId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid giveaway ID."
      });
    }

    const giveaway = await Giveaway.findOne({
      _id: giveawayId,
      status: "completed"
    }).select("title winnerSelectionDate");

    if (!giveaway) {
      return res.status(404).json({
        success: false,
        message: "Completed giveaway or winner announcement not found."
      });
    }

    const winners = await GiveawayWinner.find({
      giveawayId: giveaway._id
    })
      .populate("userId", "name")
      .populate("prizeId", "name image")
      .sort({ prizeId: 1, rank: 1 })
      .lean();

    const results = winners.map((winner) => ({
      winnerId: winner._id,
      name: winner.userId?.name || "VELOOP Winner",
      prize: winner.prizeId?.name || "Prize",
      prizeImage: winner.prizeId?.image || "",
      rank: winner.rank,
      selectedAt: winner.selectedAt
    }));

    return res.status(200).json({
      success: true,
      giveaway: {
        id: giveaway._id,
        title: giveaway.title,
        winnerSelectionDate: giveaway.winnerSelectionDate
      },
      count: results.length,
      winners: results
    });

  } catch (error) {
    console.error("Get giveaway winners error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load giveaway winners."
    });
  }
};

// Get only the logged-in user's winning prizes.
export const getMyWinners = async (req, res) => {
  try {
    const winners = await GiveawayWinner.find({
      userId: req.user._id
    })
      .populate("giveawayId", "title")
      .populate("prizeId", "name image category")
      .sort({ selectedAt: -1 })
      .lean();

    const results = winners.map((item) => ({
      winnerId: item._id,
      giveaway: item.giveawayId
        ? {
            id: item.giveawayId._id,
            title: item.giveawayId.title
          }
        : null,
      prize: item.prizeId
        ? {
            id: item.prizeId._id,
            name: item.prizeId.name,
            image: item.prizeId.image,
            category: item.prizeId.category
          }
        : null,
      rank: item.rank,
      selectedAt: item.selectedAt
    }));

    return res.status(200).json({
      success: true,
      count: results.length,
      winners: results
    });
  } catch (error) {
    console.error("My winners error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load your winning prizes."
    });
  }
};
