import path from "path";
import crypto from "crypto";
import multer from "multer";
import { uploadsDir } from "../config/paths.js";
import { ApiError } from "../utils/ApiError.js";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    // Never trust the original filename — generate our own so nothing on disk
    // is guessable or reuses a name in a way that could overwrite another file.
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`;
    cb(null, unique);
  },
});

function fileFilter(_req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  // Check both the declared MIME type and the extension — a spoofed
  // Content-Type alone shouldn't be enough to get a file accepted.
  if (!ALLOWED_MIME_TYPES.has(file.mimetype) || !ALLOWED_EXTENSIONS.has(ext)) {
    return cb(new ApiError(400, "Only JPG, PNG, WEBP or GIF images are allowed."));
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_BYTES, files: 1 },
});

/**
 * Wraps multer's single-file middleware so its errors (file too large, wrong
 * type, etc.) come out as the same ApiError shape as the rest of the API,
 * instead of an uncaught MulterError falling through to a generic 500.
 */
export function uploadIncidentImage(req, res, next) {
  upload.single("image")(req, res, (err) => {
    if (!err) return next();
    if (err instanceof ApiError) return next(err);
    if (err.code === "LIMIT_FILE_SIZE") {
      return next(new ApiError(400, "Image must be smaller than 5MB."));
    }
    return next(new ApiError(400, err.message || "Image upload failed."));
  });
}
