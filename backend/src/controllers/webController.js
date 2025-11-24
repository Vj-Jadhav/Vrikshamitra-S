import mongoose from "mongoose";

import { Institute, School, College, University } from "../models/BaseInstituteSchema.js";
// import Faculty from "../models/Faculty.js";
// import Student from "../models/Student.js";
import Challenge from "../models/Challenge.js";

//government dashboard
export const getAllInstitutes = async (req, res) => {
  try {
    const institutes = await Institute.find().lean();

    res.status(200).json({
      success: true,
      data: institutes
    });
  } catch (error) {
    console.error("Error fetching institutes:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch institutes"
    });
  }
};

export const approveInstitute = async (req, res) => {
  try {
    // Approve institute by updating approvalStatus
    const institute = await Institute.findByIdAndUpdate(
      req.params.id,
      { approvalStatus: true },
      { new: true }
    );

    if (!institute) {
      return res.status(404).json({ success: false, message: "Institute not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Institute approved",
      data: institute
    });

  } catch (err) {
    console.error("ERROR in approveInstitute:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


export const rejectInstitute = async (req, res) => {
  try {
    const result = await Institute.findByIdAndUpdate(
      req.params.id,
      { approvalStatus: false },
      { new: true }
    );

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

export const getInstituteById = async (req, res) => {
  const { id } = req.params;

  // Validate MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid ID" });
  }

  try {
    const institute = await Institute.findById(id);

    if (!institute) {
      return res.status(404).json({ success: false, message: "Institute not found" });
    }

    res.status(200).json({ success: true, data: institute });
  } catch (error) {
    console.error("Error fetching institute:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};



/**
 * @desc    Get all challenges
 * @route   GET /challenges
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
 * @route   POST /challenges
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
 * @route   PUT /challenges/:id
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
 * @route   DELETE /challenges/:id
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