import { createHash, randomUUID } from "crypto";
import FraudEvent from "../models/FraudEvent.js";

export const hashIdentifier = (value) => {
  if (!value) return "";
  return createHash("sha256").update(String(value)).digest("hex");
};

export const fraudProtection = async (req, res, next) => {
  req.requestId =
    req.headers["x-request-id"] ||
    req.headers["idempotency-key"] ||
    randomUUID();

  req.securityContext = {
    requestId: req.requestId,
    ipHash: hashIdentifier(
      req.ip ||
      req.headers["x-forwarded-for"] ||
      req.socket?.remoteAddress
    ),
    deviceHash: hashIdentifier(req.headers["x-device-id"] || "")
  };

  const signals = [];
  let riskScore = 0;

  if (!req.securityContext.deviceHash) {
    signals.push("device_identifier_missing");
    riskScore += 10;
  }

  if (req.method === "POST" && req.headers["idempotency-key"]) {
    if (String(req.headers["idempotency-key"]).length > 128) {
      return res.status(400).json({
        success: false,
        code: "INVALID_REQUEST_KEY",
        message: "The request key is invalid."
      });
    }
  }

  req.securityContext.riskScore = riskScore;
  req.securityContext.signals = signals;

  if (riskScore >= 80) {
    await FraudEvent.create({
      userId: req.user?._id || null,
      giveawayId: req.params.giveawayId || null,
      deviceHash: req.securityContext.deviceHash,
      ipHash: req.securityContext.ipHash,
      riskScore,
      reason: "High-risk request signals",
      signals,
      action: "BLOCKED"
    }).catch(() => {});

    return res.status(403).json({
      success: false,
      code: "PARTICIPATION_BLOCKED",
      message: "We couldn't verify this participation request."
    });
  }

  next();
};
