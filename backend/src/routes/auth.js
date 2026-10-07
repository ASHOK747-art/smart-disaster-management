import { Router } from "express";
import { register, login, getMe, listUsersByRole, changePassword } from "../controllers/authController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, getMe);
router.put("/change-password", authenticate, changePassword);
router.get("/users", authenticate, authorize("admin"), listUsersByRole);

export default router;