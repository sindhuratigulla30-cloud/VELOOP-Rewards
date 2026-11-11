
import mongoose from "mongoose";

const giveawaySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      default: ""
    },

    bannerImage: {
      type: String,
      default: ""
    },

    status: {
      type: String,
      enum: ["draft", "active", "ended", "completed"],
      default: "draft"
    },

    startDate: {
      type: Date,
      required: true
    },

    endDate: {
      type: Date,
      required: true
    },

    winnerSelectionDate: {
      type: Date
    },

    rules: [{
      type: String,
      trim: true
    }],

    termsAndConditions: [{
      type: String,
      trim: true
    }]
  },
  {
    timestamps: true
  }
);

// Prevent invalid giveaway date ranges.
giveawaySchema.pre("validate", function () {
  if (this.startDate && this.endDate && this.endDate <= this.startDate) {
    this.invalidate("endDate", "End date must be after start date");
  }
});

const Giveaway = mongoose.model("Giveaway", giveawaySchema);

export default Giveaway;
