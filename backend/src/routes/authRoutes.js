import express from "express";
import {
  registerUser,
  loginUser, 
  getUserDetails, 
  registerInstitute, 
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

// ===== USER AUTH ROUTES =====
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getUserDetails);

// ===== STUDENT AUTH FLOW =====
router.post("/student/login-attempt", studentLoginAttempt);
router.post("/student/verify-otp", verifyStudentOTP);
router.post("/student/set-password", setStudentPassword);
router.post("/student/resend-otp", resendStudentOTP);

// ===== FACULTY AUTH FLOW =====
router.post("/faculty/login-attempt", facultyLoginAttempt);
router.post("/faculty/verify-otp", verifyFacultyOTP);
router.post("/faculty/set-password", setFacultyPassword);
router.post("/faculty/resend-otp", resendFacultyOTP);

// ===== PASSWORD RESET FLOW (Universal) =====
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);

// ===== INSTITUTE MANAGEMENT =====
router.post("/institute-register", registerInstitute);


export default router;