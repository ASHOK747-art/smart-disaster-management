import { Router } from "express";
import {
  getHospitals,
  getHospitalById,
  getMyHospitalProfile,
  updateHospital,
} from "../controllers/hospitalController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

// Public read routes
router.get("/", getHospitals);
router.get("/:id", getHospitalById);

// Protected routes
router.use(authenticate);
router.get("/my/profile", authorize("hospital", "admin"), getMyHospitalProfile);
router.put("/:id", authorize("hospital", "admin"), updateHospital);

export default router;

