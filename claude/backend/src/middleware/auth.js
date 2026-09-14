import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/User.js";

/**
 * Verifies the Bearer token on the request, loads the user, and attaches it
 * as req.user. Everything downstream can assume req.user is real and current.
 */
export const authenticate = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    throw new ApiError(401, "Authentication required. No token provided.");
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new ApiError(401, "Invalid or expired token.");
  }

  const user = await User.findById(payload.sub);
  if (!user) {
    throw new ApiError(401, "User for this token no longer exists.");
  }

  req.user = user;
  next();
});

/**
 * Restricts a route to one or more roles. Must run after authenticate().
 * Usage: router.get("/admin-only", authenticate, authorize("admin"), handler)
 */
export function authorize(...allowedRoles) {
  return (req, _res, next) => {
    if (!req.user) {
      throw new ApiError(401, "Authentication required.");
    }
    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(403, `Role '${req.user.role}' is not permitted to access this resource.`);
    }
    next();
  };
}
