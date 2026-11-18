
import express from "express";

import {
  selectGiveawayWinners,
  getGiveawayWinners
} from "../controllers/winnerController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public winner announcement.
router.get("/:giveawayId", getGiveawayWinners);

// Admin-only winner selection.
router.post(
  "/:giveawayId/select",
  protect,
  adminOnly,
  selectGiveawayWinners
);

export default router;
