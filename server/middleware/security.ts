import { Request, Response, NextFunction } from "express";

// 1. Audit Logging Middleware
export function auditLogger(req: any, res: Response, next: NextFunction): void {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  
  res.on("finish", () => {
    const duration = Date.now() - start;
    const userContext = req.user ? `[User: ${req.user.email} (${req.user.role})]` : "[Guest Session]";
    console.log(
      `[AUDIT LOG] ${timestamp} - ${req.method} ${req.originalUrl} - Status: ${res.statusCode} ${userContext} - Time: ${duration}ms - IP: ${req.ip}`
    );
  });
  
  next();
}

// 2. Slidining-Window Rate Limiter
const requestTracker = new Map<string, { count: number; resetTime: number }>();

export function rateLimiter(req: Request, res: Response, next: NextFunction): void {
  const clientIp = req.ip || "unknown_client";
  const now = Date.now();
  const WINDOW_MS = 60 * 1000; // 1 minute sliding tracking
  const MAX_CALLS = 150; // Limit to 150 operations per window

  const track = requestTracker.get(clientIp);

  if (!track || now > track.resetTime) {
    requestTracker.set(clientIp, {
      count: 1,
      resetTime: now + WINDOW_MS,
    });
    next();
    return;
  }

  track.count += 1;
  if (track.count > MAX_CALLS) {
    res.status(429).json({
      success: false,
      message: "Too Many Requests. Enterprise security limits triggered. Please try again in 1 minute.",
    });
    return;
  }

  next();
}

// 3. Centralized Exception Handler
export function globalErrorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error("[CRITICAL GATEWAY ERROR]", err);

  const status = err.status || err.statusCode || 500;
  const errMsg = err.message || "An unexpected internal server error occurred.";

  res.status(status).json({
    success: false,
    message: status === 500 ? "Our operations team has been notified of this gateway anomaly. Stack traces locked." : errMsg,
    vulnerability_shield: "ACTIVE",
  });
}
