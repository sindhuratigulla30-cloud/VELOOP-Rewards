
import mongoose from "mongoose";

const prizeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      default: ""
    },

    image: {
      type: String,
      default: ""
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

    category: {
      type: String,
      default: "General"
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const Prize = mongoose.model("Prize", prizeSchema);

export default Prize;
