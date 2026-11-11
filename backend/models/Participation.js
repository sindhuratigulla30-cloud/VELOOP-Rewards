
import mongoose from "mongoose";

const participationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

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

    entryFee: {
      type: Number,
      required: true,
      min: 1
    },

    currency: {
      type: String,
      required: true,
      enum: ["VEs", "SVEs", "Tokens"]
    },

    status: {
      type: String,
      enum: ["joined", "winner", "not_selected", "cancelled"],
      default: "joined"
    },

    joinedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// One user can participate only once per giveaway.
participationSchema.index(
  { userId: 1, giveawayId: 1 },
  { unique: true }
);

const Participation = mongoose.model(
  "Participation",
  participationSchema
);

export default Participation;
