import express from "express";
import { getFacultyAnalytics } from "../controllers/facultyController.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

/**
 * @route   GET /api/faculty/:id
 * @desc    Get faculty analytics & profile overview
 * @access  Private
 */
router.get("/:id", protect, getFacultyAnalytics);

export default router;
