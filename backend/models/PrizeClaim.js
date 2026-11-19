import mongoose from "mongoose";

const prizeClaimSchema = new mongoose.Schema(
  {
    winnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GiveawayWinner",
      required: true,
      unique: true
    },

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

    claimType: {
      type: String,
      enum: ["physical", "gift_card"],
      required: true
    },

    fullName: {
      type: String,
      trim: true,
      maxlength: 100,
      default: ""
    },

    phone: {
      type: String,
      trim: true,
      maxlength: 20,
      default: ""
    },

    addressLine: {
      type: String,
      trim: true,
      maxlength: 250,
      default: ""
    },

    city: {
      type: String,
      trim: true,
      maxlength: 80,
      default: ""
    },

    state: {
      type: String,
      trim: true,
      maxlength: 80,
      default: ""
    },

    pinCode: {
      type: String,
      trim: true,
      maxlength: 12,
      default: ""
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 254,
      default: ""
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "shipped", "delivered"],
      default: "pending"
    },

    adminNote: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: ""
    },

    trackingNumber: {
      type: String,
      trim: true,
      maxlength: 100,
      default: ""
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    reviewedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

prizeClaimSchema.index({ userId: 1, createdAt: -1 });
prizeClaimSchema.index({ status: 1, createdAt: -1 });

const PrizeClaim =
  mongoose.models.PrizeClaim ||
  mongoose.model("PrizeClaim", prizeClaimSchema);

export default PrizeClaim;
