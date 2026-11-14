
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import giveawayRoutes from "./routes/giveawayRoutes.js";

const app = express();

// Allowed frontend URLs
const allowedOrigins = [
  "https://veloop-rewards-frontend.vercel.app",
  "http://localhost:5173",
  ...(process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",")
    : [])
]
  .map((origin) => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    if (
      !origin ||
      allowedOrigins.includes(origin.replace(/\/+$/, ""))
    ) {
      return callback(null, true);
    }

    console.log("Blocked CORS origin:", origin);
    return callback(new Error("Not allowed by CORS"));
  },

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS"
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization"
  ],

  credentials: true,
  optionsSuccessStatus: 204
};

// CORS must run first
app.use(cors(corsOptions));

// Security middleware
app.use(helmet());

// Parse JSON
app.use(express.json({ limit: "10kb" }));

// Connect to MongoDB before processing API requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Database connection failed"
    });
  }
});

// Rate limiting
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    skip: (req) => req.method === "OPTIONS"
  })
);

// Backend health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "VELOOP Rewards Backend API is running"
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/giveaways", giveawayRoutes);

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
    path: req.originalUrl
  });
});

export default app;
