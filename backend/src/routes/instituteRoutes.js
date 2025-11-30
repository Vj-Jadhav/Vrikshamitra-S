import express from "express";
import {
  getInstituteById,
  getStudentsByInstituteId,
  createChallengeAssignment,
  getInstituteAssignments,
  getAssignmentDetails,
  updateAssignmentStatus,
  deleteAssignment,
  getAssignmentStatistics,
  addFaculty,
  getFacultyByInstitute,
  addStudentsBulk,
  addStudent // ADD THIS IMPORT
} from "../controllers/instituteController.js";

const router = express.Router();

// Institute routes
router.get("/:instituteId", getInstituteById); // Get institute details

// Student routes
router.get("/:instituteId/students", getStudentsByInstituteId); // Get institute students
router.post("/:instituteId/students", addStudent); // ADD THIS ROUTE - Add single student
router.post('/:instituteId/students/bulk', addStudentsBulk); // Add students in bulk

// Faculty routes
router.post("/:instituteId/faculty", addFaculty); // Add faculty
router.get("/:instituteId/faculty", getFacultyByInstitute); // Get faculty by institute

// Assignment routes
router.post('/:instituteId/assignments', createChallengeAssignment); // Create assignment
router.get('/:instituteId/assignments', getInstituteAssignments); // Get institute assignments
router.get('/:instituteId/assignment-stats', getAssignmentStatistics); // Get assignment stats

// Specific assignment routes (keep these at bottom to avoid conflict)
router.get('/assignments/:assignmentId', getAssignmentDetails); // Get assignment details
router.put('/assignments/:assignmentId/status', updateAssignmentStatus); // Update assignment status
router.delete('/assignments/:assignmentId', deleteAssignment); // Delete assignment

export default router;