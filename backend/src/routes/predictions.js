import { Router } from "express";
import { getRiskPrediction } from "../controllers/predictionController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// Protected endpoint: requires authenticated user session
router.get("/risk", authenticate, getRiskPrediction);

export default router;

