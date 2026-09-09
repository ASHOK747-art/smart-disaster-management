import jwt from "jsonwebtoken";
import User, { ROLES } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { fullName, email, phone, password, role, location, latitude, longitude, ...rest } = req.body;

  if (!fullName || !email || !password) {
    throw new ApiError(400, "Full name, email and password are required.");
  }

  const normalizedRole = ROLES.includes(role) ? role : "citizen";

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    throw new ApiError(409, "An account with that email already exists.");
  }

  const user = new User({
    fullName,
    email,
    phone,
    role: normalizedRole,
    location,
    latitude,
    longitude,
    profile: rest, // catches role-specific extras like skills/availability from the register form
  });
  await user.setPassword(password);
  await user.save();

  const token = signToken(user);
  res.status(201).json({ success: true, user, token });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    throw new ApiError(400, "Email/phone and password are required.");
  }

  const user = await User.findOne({
    $or: [{ email: identifier.toLowerCase().trim() }, { phone: identifier.trim() }],
  }).select("+passwordHash");

  if (!user) {
    throw new ApiError(401, "Invalid credentials.");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid credentials.");
  }

  const token = signToken(user);
  // Re-fetch without the hash for the response (toJSON also strips it, but be explicit).
  const safeUser = await User.findById(user._id);
  res.json({ success: true, user: safeUser, token });
});

// GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});
