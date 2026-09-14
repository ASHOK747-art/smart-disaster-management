import { Router } from "express";
import {
  createIncident,
  getIncidents,
  getIncidentById,
  updateIncident,
  deleteIncident,
} from "../controllers/incidentController.js";
import { authenticate } from "../middleware/auth.js";
import { uploadIncidentImage } from "../middleware/upload.js";

const router = Router();

// Every incident route requires a logged-in user; role-specific rules are
// enforced inside the controller since they depend on more than just role
// (e.g. "citizen, but only if they own this incident").
router.use(authenticate);

router.post("/", uploadIncidentImage, createIncident);
router.get("/", getIncidents);
router.get("/:id", getIncidentById);
router.put("/:id", uploadIncidentImage, updateIncident);
router.delete("/:id", deleteIncident);

export default router;
