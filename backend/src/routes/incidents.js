import { Router } from "express";
import {
  createIncident,
  getIncidents,
  getIncidentById,
  updateIncident,
  deleteIncident,
  getPublicVerifiedIncidents,
  getAssignedIncidents,
  assignResponder,
} from "../controllers/incidentController.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { uploadIncidentImage } from "../middleware/upload.js";

const router = Router();

// Public route: GIS map can view active/verified incidents without authentication
router.get("/public", getPublicVerifiedIncidents);

// Protected routes: require authenticated session
router.use(authenticate);

router.post("/", uploadIncidentImage, createIncident);
router.get("/", getIncidents);
// Placed before "/:id" so it isn't swallowed by the id route.
router.get("/assigned", authorize("rescue", "admin"), getAssignedIncidents);
router.get("/:id", getIncidentById);
router.put("/:id/assign", authorize("admin"), assignResponder);
router.put("/:id", uploadIncidentImage, updateIncident);
router.delete("/:id", deleteIncident);

export default router;