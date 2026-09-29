import { Router } from "express";
import {
  getShelters,
  getShelterById,
  updateShelter,
} from "../controllers/shelterController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

// Public read routes
router.get("/", getShelters);
router.get("/:id", getShelterById);

// Protected update routes
router.use(authenticate);
router.put("/:id", authorize("admin", "rescue", "volunteer"), updateShelter);

export default router;

