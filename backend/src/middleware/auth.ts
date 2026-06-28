import { NextFunction, Response, Request } from "express";
import jwt from "jsonwebtoken";
import { sendError } from "../utils/http";

export interface JwtUser {
  id: string;
  email: string;
  role: string;
  orgId: string | null;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtUser;
}

export function requireAuth(allowedRoles: string[] = []) {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    const header = req.header("Authorization");

    if (!header || !header.startsWith("Bearer ")) {
      return sendError(res, 401, "Unauthorized", "Missing or invalid token");
    }

    const token = header.slice("Bearer ".length).trim();
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      return sendError(res, 500, "Server error", "JWT secret is not configured");
    }

    try {
      const decoded = jwt.verify(token, jwtSecret) as JwtUser;

      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        orgId: decoded.role === "super_admin" ? decoded.orgId ?? null : decoded.orgId
      };

      if (!req.user.role || !req.user.id || !req.user.email) {
        return sendError(res, 401, "Unauthorized", "Invalid token payload");
      }

      if (req.user.role !== "super_admin" && !req.user.orgId) {
        return sendError(res, 401, "Unauthorized", "Invalid token payload");
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
        return sendError(res, 403, "Forbidden", "Access denied");
      }

      next();
    } catch {
      return sendError(res, 401, "Unauthorized", "Invalid or expired token");
    }
  };
}
