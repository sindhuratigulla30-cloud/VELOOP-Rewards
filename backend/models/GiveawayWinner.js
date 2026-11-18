
import mongoose from "mongoose";

const giveawayWinnerSchema = new mongoose.Schema(
  {
    giveawayId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Giveaway",
      required: true
    },

    prizeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prize",
      required: true
    },

    participationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Participation",
      required: true,
      unique: true
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    rank: {
      type: Number,
      required: true,
      min: 1
    },

    selectedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// A user cannot win twice in the same giveaway.
giveawayWinnerSchema.index(
  { giveawayId: 1, userId: 1 },
  { unique: true }
);

// Prevent duplicate winner positions for a prize.
giveawayWinnerSchema.index(
  { giveawayId: 1, prizeId: 1, rank: 1 },
  { unique: true }
);

const GiveawayWinner =
  mongoose.models.GiveawayWinner ||
  mongoose.model("GiveawayWinner", giveawayWinnerSchema);

export default GiveawayWinner;
