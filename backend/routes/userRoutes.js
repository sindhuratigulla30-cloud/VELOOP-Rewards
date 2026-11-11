
import express from "express";

import {
  getMyProfile,
  getMyParticipations,
  getMyTransactions
} from "../controllers/userController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require login.
router.get("/me", protect, getMyProfile);
router.get("/me/participations", protect, getMyParticipations);
router.get("/me/transactions", protect, getMyTransactions);

export default router;
