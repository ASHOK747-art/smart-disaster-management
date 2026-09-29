import { Router } from "express";
import {
  getRescueTeams,
  getRescueTeamById,
  createRescueTeam,
  updateRescueTeam,
} from "../controllers/rescueTeamController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

// Public read routes
router.get("/", getRescueTeams);
router.get("/:id", getRescueTeamById);

// Protected routes
router.use(authenticate);
router.post("/", authorize("admin"), createRescueTeam);
router.put("/:id", authorize("admin", "rescue"), updateRescueTeam);

export default router;

