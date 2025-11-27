import express from "express";
import { getStudentsByInstituteId,
        createChallengeAssignment,
        getInstituteAssignments,
        getAssignmentDetails,
        updateAssignmentStatus,
        deleteAssignment,
        getAssignmentStatistics,
        addFaculty,
        getFacultyByInstitute,
        addStudentsBulk 
        } from "../controllers/instituteController.js";

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





router.post("/:instituteId/faculty", addFaculty);
router.get("/:instituteId/faculty", getFacultyByInstitute);
router.post('/bulk/:instituteId', addStudentsBulk);

export default router;

