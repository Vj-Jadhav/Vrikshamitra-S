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
  getInstituteProfile,
  addStudentsBulk,
  addStudent,
  updateStudent,
  deleteStudent,
  getInstituteEvents,
  acceptPlantingDrive,
  createInstituteEvent,
  createPlantingRequest,
  assignFacultyToEvent,
  getPlantingTargets,
  getInstituteRequests,
  getInstitutePledges,
  getAvailableNGOs
} from "../controllers/instituteController.js";

import { protect } from "../middlewares/auth.js";

const router = express.Router();

// Add this ABOVE the /profile route in instituteRoutes.js
router.get("/test-route", (req, res) => {
  res.json({
    message: "Institute routes are working!",
    timestamp: new Date().toISOString()
  });
});

// ✅ FIX — Place static routes BEFORE dynamic ones
router.get("/profile", protect, getInstituteProfile);


// --------------------
// Institute routes
// --------------------
router.get("/plant-drives", protect, getPlantingTargets); // specific route FIRST
router.get("/available-ngos", protect, getAvailableNGOs); // specific route BEFORE dynamic
router.get("/:instituteId", getInstituteById); // dynamic route LAST
router.get("/:instituteId/requests", protect, getInstituteRequests);
router.get("/:instituteId/events", getInstituteEvents);
router.get("/:instituteId/pledges", protect, getInstitutePledges);

router.post("/plant-drive/accept", protect, acceptPlantingDrive);
router.post("/events/create", protect, createInstituteEvent);
router.post("/planting-request/create", protect, createPlantingRequest);
router.post("/events/assign-faculty", protect, assignFacultyToEvent);


// --------------------
// Student routes
// --------------------
router.get("/:instituteId/students", getStudentsByInstituteId);
router.post("/:instituteId/students", addStudent);
router.post("/:instituteId/students/bulk", addStudentsBulk);
router.put("/:instituteId/students/:studentId", updateStudent);
router.delete("/:instituteId/students/:studentId", deleteStudent);


// --------------------
// Faculty routes
// --------------------
router.post("/:instituteId/faculty", addFaculty);
router.get("/:instituteId/faculty", getFacultyByInstitute);


// --------------------
// Assignment routes
// --------------------
router.post("/:instituteId/assignments", createChallengeAssignment);
router.get("/:instituteId/assignments", getInstituteAssignments);
router.get("/:instituteId/assignment-stats", getAssignmentStatistics);


// --------------------
// Specific assignment routes
// --------------------
router.get("/assignments/:assignmentId", getAssignmentDetails);
router.put("/assignments/:assignmentId/status", updateAssignmentStatus);
router.delete("/assignments/:assignmentId", deleteAssignment);



export default router;
