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
  resendFacultyOTP
} from "../controllers/authController.js";

import { protect } from "../middlewares/auth.js";

const router = express.Router();

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Get Logged-in User
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

router.post("/institute-register", registerInstitute);


export default router;