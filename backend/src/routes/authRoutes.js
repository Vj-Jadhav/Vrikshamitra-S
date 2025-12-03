// authRoutes.js - Updated with correct paths
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
  resendFacultyOTP,
  forgotPassword, 
  resetPassword,
  verifyOTP
} from "../controllers/authController.js";

import { protect } from "../middlewares/auth.js";

const router = express.Router();

// ================= USER AUTH =================
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getUserDetails);

// ================= STUDENT AUTH FLOW =================
router.post("/student/login-attempt", studentLoginAttempt);  // Changed from /student/login-attempt
router.post("/student/verify-otp", verifyStudentOTP);        // Changed from /student/verify-otp
router.post("/student/set-password", setStudentPassword);    // Changed from /student/set-password
router.post("/student/resend-otp", resendStudentOTP);        // Changed from /student/resend-otp

// ================= FACULTY AUTH FLOW =================
router.post("/faculty/login-attempt", facultyLoginAttempt);
router.post("/faculty/verify-otp", verifyFacultyOTP);
router.post("/faculty/set-password", setFacultyPassword);
router.post("/faculty/resend-otp", resendFacultyOTP);
// ================= PASSWORD RESET =================
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);

// ================= INSTITUTE MANAGEMENT =================
router.post("/institute-register", registerInstitute);
router.get("/institutes", getAllInstitutes);
router.get("/institutes/:id", getInstituteById);
router.put("/institutes/:id/approve", approveInstitute);
router.put("/institutes/:id/reject", rejectInstitute);

// ================= FACULTY MANAGEMENT =================
router.post("/institutes/:instituteId/faculty", addFaculty);
router.get("/institutes/:instituteId/faculty", getFacultyByInstitute);

// ================= BULK STUDENT ADD =================
router.post('/bulk/:instituteId', addStudentsBulk);

export default router;