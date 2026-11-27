
import express from "express";

import {
  getAdminDashboard,
  getAllMembers,
  getAllGiveaways,
  createGiveaway,
  updateGiveaway,
  updateGiveawayStatus,
  addGiveawayPrize,
  updateGiveawayPrize
} from "../controllers/adminController.js";

import {
  protect,
  adminOnly
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Every admin endpoint requires an active authenticated admin.
router.use(protect, adminOnly);

// Dashboard and members
router.get("/dashboard", getAdminDashboard);
router.get("/members", getAllMembers);

// Giveaway management
router.get("/giveaways", getAllGiveaways);
router.post("/giveaways", createGiveaway);
router.put("/giveaways/:id", updateGiveaway);
router.patch("/giveaways/:id/status", updateGiveawayStatus);

// Prize management
router.post("/giveaways/:id/prizes", addGiveawayPrize);
router.put(
  "/giveaways/:id/prizes/:prizeId",
  updateGiveawayPrize
);

export default router;
