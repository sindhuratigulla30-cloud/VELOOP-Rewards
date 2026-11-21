import express from "express";

import {
  selectGiveawayWinners,
  getGiveawayWinners,
  getMyWinners
} from "../controllers/winnerController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { fraudProtection } from "../middleware/fraudMiddleware.js";

const router = express.Router();

// Logged-in member: view only their own winning prizes.
router.get("/my", protect, getMyWinners);

// Public winner announcement.
router.get("/:giveawayId", getGiveawayWinners);

// Admin-only winner selection.
router.post(
  "/:giveawayId/select",
  protect,
  adminOnly,
  fraudProtection,
  selectGiveawayWinners
);

export default router;
