import express from "express";
import { getStudentsByInstituteId,
    createChallengeAssignment,
  getInstituteAssignments,
  getAssignmentDetails,
  updateAssignmentStatus,
  deleteAssignment,
  getAssignmentStatistics,
      getChallenges,
  createChallenge,
  updateChallenge,
  deleteChallenge
        } from "../controllers/webController.js";

const router = express.Router();


//institute-dashboard
router.get("/:instituteId", getStudentsByInstituteId);
router.post('/assignments', createChallengeAssignment);

// Get assignments for an institute
router.get('/institute/:instituteId/assignments', getInstituteAssignments);

// Get assignment details with student progress
router.get('/assignments/:assignmentId', getAssignmentDetails);

// Update assignment status
router.put('/assignments/:assignmentId/status', updateAssignmentStatus);

// Delete assignment
router.delete('/assignments/:assignmentId', deleteAssignment);

// Get assignment statistics for dashboard
router.get('/institute/:instituteId/assignment-stats', getAssignmentStatistics);

// GET /api/challenges
router.get("/", getChallenges);

// POST /api/challenges
router.post("/", createChallenge);

// PUT /api/challenges/:id
router.put("/:id", updateChallenge);

// DELETE /api/challenges/:id
router.delete("/:id", deleteChallenge);


export default router;

