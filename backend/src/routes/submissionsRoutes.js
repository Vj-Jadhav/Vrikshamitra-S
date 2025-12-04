const express = require("express");
const router = express.Router();
const submissionsController = require("../controllers/submissionsController");
const authMiddleware = require("../middlewares/auth");

// Public routes
router.get("/status", submissionsController.getSubmissionStatus);

// Protected routes (require authentication)
router.use(authMiddleware);

// Student routes
router.post("/submit", submissionsController.submitProof);

// Faculty routes
router.get("/", submissionsController.getAllSubmissions);
router.patch("/:id/approve", submissionsController.approveSubmission);
router.patch("/:id/reject", submissionsController.rejectSubmission);
router.delete("/:id", submissionsController.deleteSubmission);

module.exports = router;