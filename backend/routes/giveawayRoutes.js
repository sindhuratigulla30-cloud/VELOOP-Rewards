
import express from "express";

import {
  joinGiveaway,
  getCurrentGiveaway,
  getGiveawayById,
  getPreviousGiveaways,
  getMyGiveawayStatus
} from "../controllers/giveawayController.js";

import { protect } from "../middleware/authMiddleware.js";
import { fraudProtection } from "../middleware/fraudMiddleware.js";
import { joinRateLimit } from "../middleware/sensitiveRateLimit.js";

const router = express.Router();

// Public giveaway APIs
router.get("/current", getCurrentGiveaway);
router.get("/previous", getPreviousGiveaways);
router.get("/:id/my-status", protect, getMyGiveawayStatus);
router.get("/:id", getGiveawayById);

// Protected giveaway API
router.post(
  "/:giveawayId/join",
  protect,
  joinRateLimit,
  fraudProtection,
  joinGiveaway
);

export default router;
