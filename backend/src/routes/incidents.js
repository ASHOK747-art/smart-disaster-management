import { Router } from "express";
import {
  createIncident,
  getIncidents,
  getIncidentById,
  updateIncident,
  deleteIncident,
  getPublicVerifiedIncidents,
} from "../controllers/incidentController.js";
import { authenticate } from "../middleware/auth.js";
import { uploadIncidentImage } from "../middleware/upload.js";

const router = Router();

// Public route: GIS map can view active/verified incidents without authentication
router.get("/public", getPublicVerifiedIncidents);

// Protected routes: require authenticated session
router.use(authenticate);

router.post("/", uploadIncidentImage, createIncident);
router.get("/", getIncidents);
router.get("/:id", getIncidentById);
router.put("/:id", uploadIncidentImage, updateIncident);
router.delete("/:id", deleteIncident);

export default router;
