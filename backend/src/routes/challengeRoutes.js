import express from "express";
import {
  getChallenges,
  createChallenge,
  updateChallenge,
  deleteChallenge
} from "../controllers/challengeController.js";   // ← FIXED (.js added)

const router = express.Router();

// GET /api/challenges
router.get("/", getChallenges);

// POST /api/challenges
router.post("/", createChallenge);

// PUT /api/challenges/:id
router.put("/:id", updateChallenge);

// DELETE /api/challenges/:id
router.delete("/:id", deleteChallenge);

export default router;
