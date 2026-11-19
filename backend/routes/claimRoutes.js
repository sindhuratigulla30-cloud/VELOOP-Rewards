import express from "express";

import {
  submitClaim,
  getMyClaims,
  getAllClaims,
  updateClaimStatus
} from "../controllers/claimController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Logged-in user
router.get("/my", protect, getMyClaims);
router.post("/:winnerId", protect, submitClaim);

// Admin only
router.get("/", protect, adminOnly, getAllClaims);
router.patch("/:claimId/status", protect, adminOnly, updateClaimStatus);

export default router;
