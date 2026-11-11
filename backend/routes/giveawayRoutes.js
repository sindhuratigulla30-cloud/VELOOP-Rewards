
import express from "express";

import {
  joinGiveaway,
  getCurrentGiveaway,
  getGiveawayById,
  getPreviousGiveaways
} from "../controllers/giveawayController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public giveaway APIs
router.get("/current", getCurrentGiveaway);
router.get("/previous", getPreviousGiveaways);
router.get("/:id", getGiveawayById);

// Protected giveaway API
router.post("/:giveawayId/join", protect, joinGiveaway);

export default router;
