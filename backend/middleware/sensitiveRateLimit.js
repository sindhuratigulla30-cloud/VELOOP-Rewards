import rateLimit from "express-rate-limit";

export const joinRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: (req) => req.method === "OPTIONS",
  message: {
    success: false,
    code: "RATE_LIMITED",
    message: "Too many participation requests. Please try again later."
  }
});

export const claimRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: (req) => req.method === "OPTIONS",
  message: {
    success: false,
    code: "RATE_LIMITED",
    message: "Too many claim requests. Please try again later."
  }
});
