import mongoose from "mongoose";

const fraudEventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    giveawayId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Giveaway",
      default: null
    },
    deviceHash: String,
    ipHash: String,
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    reason: {
      type: String,
      required: true
    },
    signals: [String],
    action: {
      type: String,
      enum: ["ALLOWED", "FLAGGED", "BLOCKED"],
      default: "ALLOWED"
    }
  },
  { timestamps: true }
);

fraudEventSchema.index({ userId: 1, createdAt: -1 });
fraudEventSchema.index({ giveawayId: 1, createdAt: -1 });
fraudEventSchema.index({ deviceHash: 1, createdAt: -1 });

export default mongoose.models.FraudEvent ||
  mongoose.model("FraudEvent", fraudEventSchema);
