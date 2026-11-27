
import mongoose from "mongoose";
import PrizeClaim from "../models/PrizeClaim.js";
import GiveawayWinner from "../models/GiveawayWinner.js";
import AuditLog from "../models/AuditLog.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// Submit a claim - only the selected winner can claim.
export const submitClaim = async (req, res) => {
  try {
    const { winnerId } = req.params;

    if (!isValidId(winnerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid winner ID."
      });
    }

    const winner = await GiveawayWinner.findById(winnerId)
      .populate("prizeId", "name category")
      .populate("giveawayId", "title status");

    if (!winner) {
      return res.status(404).json({
        success: false,
        message: "Winner not found."
      });
    }

    if (String(winner.userId) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Only the selected winner can claim this prize."
      });
    }

    if (!winner.giveawayId || winner.giveawayId.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Claims are available only after winner announcement."
      });
    }

    if (!winner.prizeId) {
      return res.status(400).json({
        success: false,
        message: "Prize information unavailable."
      });
    }

    const category = String(winner.prizeId.category || "");
    const claimType = /voucher|gift[ _-]?card/i.test(category)
      ? "gift_card"
      : "physical";

    let details = {};

    if (claimType === "physical") {
      const fullName = String(req.body?.fullName || "").trim();
      const phone = String(req.body?.phone || "").trim();
      const addressLine = String(req.body?.addressLine || "").trim();
      const city = String(req.body?.city || "").trim();
      const state = String(req.body?.state || "").trim();
      const pinCode = String(req.body?.pinCode || "").trim();

      if (
        !fullName ||
        !phone ||
        !addressLine ||
        !city ||
        !state ||
        !pinCode
      ) {
        return res.status(400).json({
          success: false,
          message: "All delivery details are required."
        });
      }

      if (
        fullName.length > 100 ||
        phone.length > 20 ||
        addressLine.length > 250 ||
        city.length > 80 ||
        state.length > 80 ||
        pinCode.length > 12
      ) {
        return res.status(400).json({
          success: false,
          message: "One or more delivery fields exceed the allowed length."
        });
      }

      if (!/^[0-9+() -]{7,20}$/.test(phone)) {
        return res.status(400).json({
          success: false,
          message: "Invalid phone number."
        });
      }

      if (!/^[a-zA-Z0-9 -]{4,12}$/.test(pinCode)) {
        return res.status(400).json({
          success: false,
          message: "Invalid PIN code."
        });
      }

      details = {
        fullName,
        phone,
        addressLine,
        city,
        state,
        pinCode
      };
    } else {
      const email = String(req.body?.email || "").trim().toLowerCase();

      if (
        email.length > 254 ||
        !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+[.][A-Z]{2,}$/i.test(email)
      ) {
        return res.status(400).json({
          success: false,
          message: "Valid gift-card email is required."
        });
      }

      details = { email };
    }

    const claim = await PrizeClaim.create({
      winnerId: winner._id,
      userId: req.user._id,
      giveawayId: winner.giveawayId._id,
      prizeId: winner.prizeId._id,
      claimType,
      ...details
    });

    await AuditLog.create({
      userId: req.user._id,
      action: "CLAIM_SUBMITTED",
      giveawayId: winner.giveawayId._id,
      prizeId: winner.prizeId._id,
      result: "success",
      requestId: req.securityContext?.requestId,
      ipHash: req.securityContext?.ipHash,
      deviceHash: req.securityContext?.deviceHash,
      details: { claimType }
    }).catch(() => {});

    return res.status(201).json({
      success: true,
      message: "Prize claim submitted successfully.",
      claim
    });
  } catch (error) {
    await AuditLog.create({
      userId: req.user?._id || null,
      action: "CLAIM_REJECTED",
      result: "rejected",
      requestId: req.securityContext?.requestId,
      ipHash: req.securityContext?.ipHash,
      deviceHash: req.securityContext?.deviceHash,
      details: {
        errorCode: error.code || error.message || "UNKNOWN_ERROR"
      }
    }).catch(() => {});

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A claim already exists for this prize."
      });
    }

    console.error("Submit claim error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to submit claim."
    });
  }
};

// Get claims belonging to the logged-in user.
export const getMyClaims = async (req, res) => {
  try {
    const claims = await PrizeClaim.find({
      userId: req.user._id
    })
      .populate("prizeId", "name image category")
      .populate("giveawayId", "title")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: claims.length,
      claims
    });
  } catch (error) {
    console.error("Get my claims error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve claims."
    });
  }
};

// Admin: list all claims.
export const getAllClaims = async (req, res) => {
  try {
    const allowed = [
      "pending",
      "approved",
      "rejected",
      "shipped",
      "delivered"
    ];

    const filter = {};

    if (req.query.status) {
      if (!allowed.includes(req.query.status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid claim status."
        });
      }

      filter.status = req.query.status;
    }

    const claims = await PrizeClaim.find(filter)
      .populate("userId", "name email")
      .populate("prizeId", "name image category")
      .populate("giveawayId", "title")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: claims.length,
      claims
    });
  } catch (error) {
    console.error("Get all claims error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve claims."
    });
  }
};

// Admin: review and update a claim.
export const updateClaimStatus = async (req, res) => {
  try {
    const { claimId } = req.params;
    const { status, adminNote, trackingNumber } = req.body || {};

    if (!isValidId(claimId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid claim ID."
      });
    }

    const claim = await PrizeClaim.findById(claimId);

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: "Claim not found."
      });
    }

    const transitions = {
      pending: ["approved", "rejected"],
      approved:
        claim.claimType === "gift_card"
          ? ["delivered", "rejected"]
          : ["shipped", "rejected"],
      shipped: ["delivered"],
      rejected: [],
      delivered: []
    };

    if (!transitions[claim.status]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change claim from ${claim.status} to ${status}.`
      });
    }

    if (
      adminNote !== undefined &&
      (typeof adminNote !== "string" || adminNote.length > 1000)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid admin note."
      });
    }

    if (
      trackingNumber !== undefined &&
      (typeof trackingNumber !== "string" || trackingNumber.length > 100)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid tracking number."
      });
    }

    if (
      status === "shipped" &&
      claim.claimType === "physical" &&
      !String(trackingNumber || "").trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Tracking number is required for physical shipment."
      });
    }

    // Update only if the claim still has the status we just checked.
    const update = {
      status,
      reviewedBy: req.user._id,
      reviewedAt: new Date()
    };

    if (adminNote !== undefined) {
      update.adminNote = adminNote.trim();
    }

    if (trackingNumber !== undefined) {
      update.trackingNumber = trackingNumber.trim();
    }

    const updatedClaim = await PrizeClaim.findOneAndUpdate(
      {
        _id: claim._id,
        status: claim.status
      },
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!updatedClaim) {
      return res.status(409).json({
        success: false,
        message: "Claim was updated by another administrator. Refresh and try again."
      });
    }

    await AuditLog.create({
      userId: req.user._id,
      action: "CLAIM_STATUS_UPDATED",
      giveawayId: claim.giveawayId,
      prizeId: claim.prizeId,
      result: "success",
      requestId: req.securityContext?.requestId,
      ipHash: req.securityContext?.ipHash,
      deviceHash: req.securityContext?.deviceHash,
      details: { claimId: claim._id, status }
    }).catch(() => {});

    return res.status(200).json({
      success: true,
      message: "Claim status updated successfully.",
      claim: updatedClaim
    });
  } catch (error) {
    console.error("Update claim error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update claim."
    });
  }
};
