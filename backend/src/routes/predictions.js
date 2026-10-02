import { Router } from "express";
import {
  getRiskPrediction,
  predictDistrictRisk,
} from "../controllers/predictionController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// Existing rule-based risk dashboard endpoint
router.get(
  "/risk",
  authenticate,
  getRiskPrediction
);

// Actual trained ML model prediction
router.post(
  "/district",
  authenticate,
  predictDistrictRisk
);

export default router;