/** @format */

import express from "express";
import {
  getChallenges,
  createChallenge,
  updateChallenge,
  deleteChallenge,
} from "../controllers/challengeController.js";

import { getStudentChallengesWithDetails } from "../controllers/challengeProgressController.js";

// ← ADD THIS

const router = express.Router();

// GET all challenges
router.get("/", getChallenges);

// GET challenges for a specific student
router.get("/student/:studentId", getStudentChallengesWithDetails);

// ← NEW ROUTE ADDED HERE

// Create new challenge
router.post("/", createChallenge);

// Update challenge
router.put("/:id", updateChallenge);

// Delete challenge
router.delete("/:id", deleteChallenge);

export default router;
