import User from "../models/User.js";
import Giveaway from "../models/Giveaway.js";
import Participation from "../models/Participation.js";
import GiveawayWinner from "../models/GiveawayWinner.js";
import PrizeClaim from "../models/PrizeClaim.js";
import WalletTransaction from "../models/WalletTransaction.js";

// Admin dashboard statistics
export const getAdminDashboard = async (req, res) => {
  try {
    const [
      totalMembers,
      activeMembers,
      totalGiveaways,
      activeGiveaways,
      completedGiveaways,
      totalParticipations,
      totalWinners,
      pendingClaims,
      totalTransactions
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "user", status: "active" }),
      Giveaway.countDocuments(),
      Giveaway.countDocuments({ status: "active" }),
      Giveaway.countDocuments({ status: "completed" }),
      Participation.countDocuments(),
      GiveawayWinner.countDocuments(),
      PrizeClaim.countDocuments({ status: "pending" }),
      WalletTransaction.countDocuments()
    ]);

    return res.status(200).json({
      success: true,
      statistics: {
        totalMembers,
        activeMembers,
        totalGiveaways,
        activeGiveaways,
        completedGiveaways,
        totalParticipations,
        totalWinners,
        pendingClaims,
        totalTransactions
      }
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load admin dashboard."
    });
  }
};


// Admin: View and search members
export const getAllMembers = async (req, res) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number.parseInt(req.query.limit, 10) || 20)
    );

    const search = String(req.query.search || "").trim();
    const status = String(req.query.status || "").trim();

    const filter = { role: "user" };

    if (search) {
      const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      filter.$or = [
        { name: { $regex: safeSearch, $options: "i" } },
        { email: { $regex: safeSearch, $options: "i" } }
      ];
    }

    if (["active", "inactive"].includes(status)) {
      filter.status = status;
    }

    const [members, totalMembers] = await Promise.all([
      User.find(filter)
        .select("name email phone role wallet status createdAt")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),

      User.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      members,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalMembers / limit),
        totalMembers,
        limit
      }
    });
  } catch (error) {
    console.error("Admin members error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load members."
    });
  }
};
