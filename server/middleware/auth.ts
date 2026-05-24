import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Inject secure fallback for production
const JWT_SECRET = process.env.JWT_SECRET || "mobility_platform_super_secure_secret_2026_l5";

// Extend Express Request type
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: "EMPLOYEE" | "HR_ADMIN";
  };
}

// Generate JWT token
export function generateToken(id: string, email: string, role: string): string {
  return jwt.sign({ id, email, role }, JWT_SECRET, { expiresIn: "7d" });
}

// Verify middleware
export function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ success: false, message: "Access token missing or invalid." });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: "EMPLOYEE" | "HR_ADMIN";
    };
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ success: false, message: "Token verification failed or expired." });
    return;
  }
}

// Authorization check middleware by role
export function requireRole(allowedRoles: ("EMPLOYEE" | "HR_ADMIN")[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required." });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted. Requires roles: [${allowedRoles.join(", ")}]. Current role: ${req.user.role}`,
      });
      return;
    }

    next();
  };
}
