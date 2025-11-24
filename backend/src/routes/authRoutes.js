import express from "express";
import { registerUser, loginUser, getUserDetails } from "../controllers/authController.js";


import { protect } from "../middlewares/auth.js";

const router = express.Router();

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

router.get("/me", protect, getUserDetails);


export default router;
