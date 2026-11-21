import express from "express";

import {
  getAdminDashboard,
  getAllMembers
} from "../controllers/adminController.js";

import {
  protect,
  adminOnly
} from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes in this file require Admin authentication.
router.use(protect, adminOnly);

// Admin dashboard statistics
router.get("/dashboard", getAdminDashboard);

// View and search members
router.get("/members", getAllMembers);

export default router;
