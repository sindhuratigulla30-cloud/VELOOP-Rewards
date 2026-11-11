
import mongoose from "mongoose";
import Prize from "./Prize.js";

const giveawayPrizeSchema = new mongoose.Schema(
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
    quantity: {
      type: Number,
      default: 1,
      min: 1
    },
    displayOrder: {
      type: Number,
      default: 0
    },
    isAvailable: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

giveawayPrizeSchema.index(
  { giveawayId: 1, prizeId: 1 },
  { unique: true }
);

const GiveawayPrize =
  mongoose.models.GiveawayPrize ||
  mongoose.model("GiveawayPrize", giveawayPrizeSchema);

export default GiveawayPrize;
