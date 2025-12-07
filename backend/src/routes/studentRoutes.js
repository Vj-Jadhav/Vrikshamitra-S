import express from "express";
import { getStudentProfile, updateStudentAvatar } from "../controllers/studentController.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

// Get student profile (with aggregated EcoPoints)
router.get("/:id", protect, getStudentProfile);

// Update student avatar
router.put("/:id/avatar", protect, updateStudentAvatar);

export default router;
