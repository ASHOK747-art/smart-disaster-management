import { Router } from "express";
import { getAnalyticsOverview } from "../controllers/analyticsController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

// Protect all analytics endpoints: authenticated admin only
router.use(authenticate);
router.use(authorize("admin"));

router.get("/overview", getAnalyticsOverview);

export default router;
