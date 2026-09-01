import { Router } from "express";
import { signup, login, getMe } from "../controllers/auth.controller.js";
import { authenticateToken } from "../middleware/auth.js";
import { signupValidation, loginValidation } from "../utils/validators.js";

const router = Router();

router.post("/signup", signupValidation, signup);
router.post("/login", loginValidation, login);
router.get("/me", authenticateToken, getMe);

export default router;
