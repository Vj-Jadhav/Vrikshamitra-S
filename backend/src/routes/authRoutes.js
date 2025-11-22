import express from "express";
import { registerUser, loginUser, getUserDetails, registerInstitute, getAllInstitutes, approveInstitute, rejectInstitute,getInstituteById } from "../controllers/authController.js";


import { protect } from "../middlewares/auth.js";

const router = express.Router();

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Get Logged-in User
router.get("/me", protect, getUserDetails);


//not to touch
router.post("/institute-register", registerInstitute);

//gov-dashboard
router.get("/", getAllInstitutes);
router.put("/:id/approve", approveInstitute);
router.put("/:id/reject", rejectInstitute);
router.get("/:id", getInstituteById);


export default router;
