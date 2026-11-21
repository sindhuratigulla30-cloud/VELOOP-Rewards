import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    action: {
      type: String,
      required: true
    },
    giveawayId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Giveaway",
      default: null
    },
    prizeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prize",
      default: null
    },
    amount: Number,
    currency: String,
    result: {
      type: String,
      enum: ["success", "rejected", "failed"],
      required: true
    },
    requestId: String,
    ipHash: String,
    deviceHash: String,
    details: mongoose.Schema.Types.Mixed
  },
  { timestamps: true }
);

auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ giveawayId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

export default mongoose.models.AuditLog ||
  mongoose.model("AuditLog", auditLogSchema);
