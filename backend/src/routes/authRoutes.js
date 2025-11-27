import express from "express";
import {
  registerUser,
  loginUser, 
  getUserDetails, 
  registerInstitute, 
  getAllInstitutes, 
  approveInstitute, 
  rejectInstitute,
  getInstituteById, 
  addFaculty,
  getFacultyByInstitute,
  addStudentsBulk,
  studentLoginAttempt,
  verifyStudentOTP,
  setStudentPassword,
  facultyLoginAttempt,
  verifyFacultyOTP,
  setFacultyPassword,
  resendStudentOTP,
  resendFacultyOTP
} from "../controllers/authController.js";

import { protect } from "../middlewares/auth.js";

const router = express.Router();

// User Auth
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getUserDetails);

// Student OTP routes
router.post("/student/login-attempt", studentLoginAttempt);
router.post("/student/verify-otp", verifyStudentOTP);
router.post("/student/set-password", setStudentPassword);
router.post("/student/resend-otp", resendStudentOTP);

// Faculty OTP routes
router.post("/faculty/login-attempt", facultyLoginAttempt);
router.post("/faculty/verify-otp", verifyFacultyOTP);
router.post("/faculty/set-password", setFacultyPassword);
router.post("/faculty/resend-otp", resendFacultyOTP);

// Institute Routes
router.post("/institute-register", registerInstitute);
router.get("/", getAllInstitutes);
router.put("/:id/approve", approveInstitute);
router.put("/:id/reject", rejectInstitute);
router.get("/:id", getInstituteById);

// Faculty Routes
router.post("/:instituteId/faculty", addFaculty);
router.get("/:instituteId/faculty", getFacultyByInstitute);

// Bulk Student Upload
router.post('/bulk/:instituteId', addStudentsBulk);

export default router;
