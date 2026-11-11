
import dotenv from "dotenv";
dotenv.config();

import connectDB from "./config/db.js";
import Giveaway from "./models/Giveaway.js";
import Prize from "./models/Prize.js";
import GiveawayPrize from "./models/GiveawayPrize.js";

const seedGiveaway = async () => {
  try {
    await connectDB();

    // Create or reuse the active giveaway
    const startDate = new Date(Date.now() - 60 * 60 * 1000);
    const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    let giveaway = await Giveaway.findOne({
      title: "VELOOP Mega Rewards Giveaway"
    });

    if (!giveaway) {
      giveaway = await Giveaway.create({
        title: "VELOOP Mega Rewards Giveaway",
        description:
          "Join the VELOOP Mega Rewards Giveaway and get a chance to win exciting prizes!",
        status: "active",
        startDate,
        endDate,
        rules: [
          "You must have an active VELOOP account.",
          "You must have sufficient wallet balance.",
          "Each user can participate only once in this giveaway."
        ],
        termsAndConditions: [
          "All entries are subject to verification.",
          "Winners will be announced after the giveaway ends."
        ]
      });
    } else {
      giveaway.status = "active";
      giveaway.startDate = startDate;
      giveaway.endDate = endDate;
      await giveaway.save();
    }

    const prizes = [
      {
        name: "iPhone",
        description: "Win an exciting Apple iPhone.",
        entryFee: 250,
        currency: "VEs",
        category: "Electronics"
      },
      {
        name: "Apple Watch",
        description: "Win an Apple Watch.",
        entryFee: 200,
        currency: "VEs",
        category: "Electronics"
      },
      {
        name: "AirPods",
        description: "Win Apple AirPods.",
        entryFee: 500,
        currency: "SVEs",
        category: "Electronics"
      },
      {
        name: "Amazon Gift Voucher ₹2,000",
        description: "Win an Amazon gift voucher worth ₹2,000.",
        entryFee: 500,
        currency: "VEs",
        category: "Gift Voucher"
      },
      {
        name: "Gift Voucher ₹500",
        description: "Win a gift voucher worth ₹500.",
        entryFee: 300,
        currency: "VEs",
        category: "Gift Voucher"
      },
      {
        name: "Gift Voucher ₹20",
        description: "Win a gift voucher worth ₹20.",
        entryFee: 2000,
        currency: "Tokens",
        category: "Gift Voucher"
      }
    ];

    for (let i = 0; i < prizes.length; i++) {
      const prizeData = prizes[i];

      let prize = await Prize.findOne({ name: prizeData.name });

      if (!prize) {
        prize = await Prize.create(prizeData);
      } else {
        Object.assign(prize, prizeData);
        await prize.save();
      }

      await GiveawayPrize.findOneAndUpdate(
        {
          giveawayId: giveaway._id,
          prizeId: prize._id
        },
        {
          $set: {
            quantity: 1,
            displayOrder: i + 1,
            isAvailable: true
          }
        },
        { upsert: true, new: true }
      );
    }

    console.log("Giveaway and prizes seeded successfully!");
    console.log("Giveaway ID:", giveaway._id);
    console.log("Total prizes:", prizes.length);
  } catch (error) {
    console.error("Seeding failed:", error.message);
  } finally {
    process.exit();
  }
};

seedGiveaway();
