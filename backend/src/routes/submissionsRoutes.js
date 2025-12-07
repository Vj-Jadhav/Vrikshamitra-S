import express from "express";
const router = express.Router();
import * as submissionsController from "../controllers/submissionsController.js";
import { protect as authMiddleware } from "../middlewares/auth.js";
import upload from "../middleware/uploadMiddleware.js";
import { facultyOnly } from "../middlewares/roleAuth.js"; // <-- ADD THIS

// Public route - no auth
router.get("/status", submissionsController.getSubmissionStatus);

// Protected routes
router.use(authMiddleware);

// Student route
router.post(
  "/submit",
  upload.single("file"),
  submissionsController.submitProof
);

// Faculty-only routes
router.get("/", facultyOnly, submissionsController.getAllSubmissions);

router.patch("/:id/approve", facultyOnly, submissionsController.approveSubmission);

router.patch("/:id/reject", facultyOnly, submissionsController.rejectSubmission);

router.delete("/:id", facultyOnly, submissionsController.deleteSubmission);

export default router;
