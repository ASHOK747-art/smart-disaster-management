import { ApiError } from "../utils/ApiError.js";

export function notFoundHandler(req, _res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  // Known/expected errors
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }

  // Mongoose validation errors
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((e) => e.message)
      .join(" ");
    return res.status(400).json({ success: false, message });
  }

  // Mongoose duplicate key (e.g. duplicate email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return res.status(409).json({ success: false, message: `That ${field} is already registered.` });
  }

  // Malformed ObjectId, etc.
  if (err.name === "CastError") {
    return res.status(400).json({ success: false, message: "Invalid identifier supplied." });
  }

  // Unexpected/programming errors — never leak internals to the client.
  console.error(err);
  const isDev = process.env.NODE_ENV !== "production";
  return res.status(500).json({
    success: false,
    message: "Something went wrong on the server.",
    ...(isDev ? { stack: err.stack } : {}),
  });
}
