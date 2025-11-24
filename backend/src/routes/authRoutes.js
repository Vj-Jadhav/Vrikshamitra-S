import express from "express";
import { registerUser,
         loginUser, 
         getUserDetails, 
         registerInstitute, 
         addFaculty,
         getFacultyByInstitute,
         addStudentsBulk
        } from "../controllers/authController.js";


import { protect } from "../middlewares/auth.js";

const router = express.Router();

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Get Logged-in User
router.get("/me", protect, getUserDetails);



router.post("/institute-register", registerInstitute);


router.post("/:instituteId/faculty", addFaculty);
router.get("/:instituteId/faculty", getFacultyByInstitute);
router.post('/bulk/:instituteId', addStudentsBulk);


// // GET all challenges
// router.get("/", getChallenges);

// // CREATE a new challenge
// router.post("/", createChallenge);

// // UPDATE a challenge
// router.put("/:id", updateChallenge);

// // DELETE a challenge
// router.delete("/:id", deleteChallenge);


export default router;
