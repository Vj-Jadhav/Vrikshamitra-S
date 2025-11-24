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
  addStudentsBulk
} from "../controllers/authController.js";

import { protect } from "../middlewares/auth.js";

const router = express.Router();

// User Auth
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getUserDetails);

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
