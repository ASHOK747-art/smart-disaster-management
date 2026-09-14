import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// backend/src/uploads — the one directory that already exists in the repo.
export const uploadsDir = path.join(__dirname, "..", "uploads");
