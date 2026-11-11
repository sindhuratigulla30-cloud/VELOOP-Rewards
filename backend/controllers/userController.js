
import Participation from "../models/Participation.js";
import WalletTransaction from "../models/WalletTransaction.js";

export const getMyProfile = async (req, res) => {
  try {
    const user = req.user;

    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        wallet: user.wallet,
        status: user.status,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error("Profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch profile"
    });
  }
};

// Get only the logged-in user's participations
export const getMyParticipations = async (req, res) => {
  try {
    const participations = await Participation.find({
      userId: req.user._id
    })
      .populate("giveawayId", "title startDate endDate status")
      .populate("prizeId", "name image description")
      .sort({ joinedAt: -1 })
      .limit(100)
      .lean();

    const results = participations.map((item) => ({
      id: item._id,
      giveaway: item.giveawayId
        ? {
            title: item.giveawayId.title,
            startDate: item.giveawayId.startDate,
            endDate: item.giveawayId.endDate,
            status: item.giveawayId.status
          }
        : null,
      prize: item.prizeId
        ? {
            name: item.prizeId.name,
            image: item.prizeId.image
          }
        : null,
      entryFee: item.entryFee,
      currency: item.currency,
      status: item.status,
      joinedAt: item.joinedAt
    }));

    return res.status(200).json({
      success: true,
      count: results.length,
      participations: results
    });
  } catch (error) {
    console.error("My participations error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load your participations."
    });
  }
};

// Get only the logged-in user's wallet transactions
export const getMyTransactions = async (req, res) => {
  try {
    const transactions = await WalletTransaction.find({
      userId: req.user._id
    })
      .populate("giveawayId", "title")
      .populate("prizeId", "name")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    const results = transactions.map((item) => ({
      id: item._id,
      type: item.type,
      amount: item.amount,
      currency: item.currency,
      description: item.description,
      status: item.status,
      giveaway: item.giveawayId?.title || null,
      prize: item.prizeId?.name || null,
      createdAt: item.createdAt
    }));

    return res.status(200).json({
      success: true,
      count: results.length,
      transactions: results
    });
  } catch (error) {
    console.error("My wallet transactions error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load wallet transactions."
    });
  }
};
