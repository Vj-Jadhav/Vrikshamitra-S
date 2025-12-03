

import StudentChallengeProgress from "../models/StudentChallengeProgress.js";
import Challenge from "../models/Challenge.js";

export const getStudentChallengesWithDetails = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({ message: "studentId is required" });
    }

    // STEP 1: Fetch the challenge IDs for this student
    const progressData = await StudentChallengeProgress.find(
      { studentId },
      { challengeId: 1, _id: 0 }
    ).lean();

    if (progressData.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No challenges found for this student",
        challenges: [],
      });
    }

    // Extract only challengeIds from results
    const challengeIds = progressData.map((item) => item.challengeId);

    // STEP 2: Fetch full challenge details using those IDs
    const fullChallenges = await Challenge.find({
      _id: { $in: challengeIds },
    }).lean();

    return res.status(200).json({
      success: true,
      count: fullChallenges.length,
      challenges: fullChallenges,
    });
  } catch (error) {
    console.error("Error fetching student challenge details:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching challenge details",
    });
  }
};
