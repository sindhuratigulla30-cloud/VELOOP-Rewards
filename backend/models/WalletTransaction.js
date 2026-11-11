
import mongoose from "mongoose";

const walletTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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

    type: {
      type: String,
      enum: ["credit", "debit", "refund"],
      required: true
    },

    amount: {
      type: Number,
      required: true,
      min: 1
    },

    currency: {
      type: String,
      enum: ["VEs", "SVEs", "Tokens"],
      required: true
    },

    description: {
      type: String,
      default: ""
    },

    referenceId: {
      type: String,
      required: true,
      unique: true
    },

    status: {
      type: String,
      enum: ["completed", "pending", "failed"],
      default: "completed"
    }
  },
  {
    timestamps: true
  }
);

const WalletTransaction = mongoose.model(
  "WalletTransaction",
  walletTransactionSchema
);

export default WalletTransaction;
