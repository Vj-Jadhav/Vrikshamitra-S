import express from "express";
import { getFacultyAnalytics, getFacultyEvents, acceptPlantingRequest, getFacultyRequests } from "../controllers/facultyController.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

/**
 * @route   GET /api/faculty/:id
 * @desc    Get faculty analytics & profile overview
 * @access  Private
 */
router.get("/:id", protect, getFacultyAnalytics);
router.get("/:id/events", protect, getFacultyEvents);
router.get("/:id/requests", protect, getFacultyRequests);
router.post("/request/:requestId/accept", protect, acceptPlantingRequest);

export default router;
