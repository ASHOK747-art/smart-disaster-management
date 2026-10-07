import User, { ROLES } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// GET /api/users - Admin lists all system users
export const getUsers = asyncHandler(async (_req, res) => {
  const users = await User.find({})
    .select("-passwordHash")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: users.length,
    users,
  });
});

// GET /api/users/:id - Admin fetches a specific user by ID
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-passwordHash");
  if (!user) {
    throw new ApiError(404, "User not found.");
  }
  res.json({
    success: true,
    user,
  });
});

// PUT /api/users/:id - Admin updates user role, contact, or location
export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  const { fullName, phone, location, role } = req.body;

  if (fullName !== undefined) user.fullName = fullName;
  if (phone !== undefined) user.phone = phone;
  if (location !== undefined) user.location = location;

  if (role !== undefined) {
    if (!ROLES.includes(role)) {
      throw new ApiError(400, `Role must be one of: ${ROLES.join(", ")}`);
    }
    user.role = role;
  }

  await user.save();

  const updatedUser = user.toObject();
  delete updatedUser.passwordHash;

  res.json({
    success: true,
    user: updatedUser,
  });
});

// DELETE /api/users/:id - Admin deletes a user
export const deleteUser = asyncHandler(async (req, res) => {
  if (req.user._id.toString() === req.params.id) {
    throw new ApiError(400, "You cannot delete your own admin account.");
  }

  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  res.json({
    success: true,
    message: "User deleted successfully.",
  });
});
