
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import giveawayRoutes from "./routes/giveawayRoutes.js";

const app = express();

app.use(helmet());

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://veloop-rewards-flame.vercel.app"
  ],
  credentials: true
}));

app.use(express.json({ limit: "10kb" }));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: "draft-8",
  legacyHeaders: false
}));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "VELOOP Rewards Backend API is running"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/giveaways", giveawayRoutes);

export default app;
