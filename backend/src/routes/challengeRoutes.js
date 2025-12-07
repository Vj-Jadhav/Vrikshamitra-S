/** @format */

import express from "express";
import {
  getChallenges,
  createChallenge,
  updateChallenge,
  deleteChallenge,
} from "../controllers/challengeController.js";

import { getStudentChallengesWithDetails } from "../controllers/challengeProgressController.js";

import { protect } from "../middlewares/auth.js";

const router = express.Router();

/**
 * STUDENT ROUTES (No Auth Required)
 */
router.get("/student/:studentId", getStudentChallengesWithDetails);

/**
 * FACULTY & ADMIN ROUTES (Protected)
 */

// Get all challenges — faculty/admin only
router.get("/", protect, getChallenges);

// Create new challenge — faculty/admin only
router.post("/", protect, createChallenge);

// Update challenge — faculty/admin only
router.put("/:id", protect, updateChallenge);

// Delete challenge — faculty/admin only
router.delete("/:id", protect, deleteChallenge);

export default router;
