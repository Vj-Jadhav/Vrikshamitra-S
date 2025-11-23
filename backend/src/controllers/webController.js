import mongoose from "mongoose";

// import { Institute, School, College, University } from "../models/BaseInstituteSchema.js";
// import Faculty from "../models/Faculty.js";
// import Student from "../models/Student.js";
import Challenge from "../models/Challenge.js";




/**
 * @desc    Get all challenges
 * @route   GET /government/challenges
 */
export const getChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.find().sort({ createdAt: -1 });
    res.status(200).json(challenges);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch challenges", error });
  }
};

/**
 * @desc    Create new challenge
 * @route   POST /government/challenges
 */
export const createChallenge = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      priority,
      status,
      mandatory,
      startDate,
      deadline,
      requirements,
      resources,
      createdBy
    } = req.body;

    // Auto-sync mandatory with priority
    const isMandatory = priority === "mandatory";

    const challenge = await Challenge.create({
      title,
      description,
      category,
      priority,
      status,
      mandatory: isMandatory,
      startDate,
      deadline,
      requirements,
      resources,
      createdBy
    });

    res.status(201).json(challenge);
  } catch (error) {
    res.status(400).json({ message: "Failed to create challenge", error });
  }
};

/**
 * @desc    Update a challenge
 * @route   PUT /government/challenges/:id
 */
export const updateChallenge = async (req, res) => {
  try {
    const updates = { ...req.body };

    // Keep mandatory consistent with priority if changed
    if (updates.priority) {
      updates.mandatory = updates.priority === "mandatory";
    }

    const updatedChallenge = await Challenge.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    if (!updatedChallenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }

    res.status(200).json(updatedChallenge);
  } catch (error) {
    res.status(500).json({ message: "Failed to update challenge", error });
  }
};

/**
 * @desc    Delete a challenge
 * @route   DELETE /government/challenges/:id
 */
export const deleteChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findByIdAndDelete(req.params.id);

    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }

    res.status(200).json({ message: "Challenge deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete challenge", error });
  }
};