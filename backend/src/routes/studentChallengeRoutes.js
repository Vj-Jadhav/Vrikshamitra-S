// routes/studentChallenges.js
import express from "express";
import StudentChallengeProgress from "../models/StudentChallengeProgress.js";
import Challenge from "../models/Challenge.js";
import Faculty from "../models/Faculty.js";
import ChallengeAssignment from "../models/ChallengeAssignment.js";

const router = express.Router();

// Get challenges for a specific student
router.get("/:studentId/challenges", async (req, res) => {
  try {
    const { studentId } = req.params;
    const instituteId = req.user.instituteId; // From auth middleware

    // Fetch all challenge progress records for the student
    const challengeProgress = await StudentChallengeProgress.find({
      studentId,
      instituteId
    })
    .populate({
      path: "challengeId",
      select: "title description points category difficulty"
    })
    .populate({
      path: "assignmentId",
      select: "assignedBy dueDate",
      populate: {
        path: "assignedBy",
        select: "name email"
      }
    })
    .sort({ updatedAt: -1 });

    // Also get available challenges that are assigned but not started
    const availableAssignments = await ChallengeAssignment.find({
      assignedTo: studentId,
      instituteId
    })
    .populate("challengeId")
    .populate("assignedBy", "name email");

    // Create a map of challenges that already have progress
    const existingProgressMap = new Map();
    challengeProgress.forEach(progress => {
      if (progress.challengeId) {
        existingProgressMap.set(progress.challengeId._id.toString(), progress);
      }
    });

    // Categorize challenges
    const availableChallenges = [];
    const activeChallenges = [];
    const completedChallenges = [];

    // Process assignments that don't have progress yet (available challenges)
    for (const assignment of availableAssignments) {
      const challengeIdStr = assignment.challengeId._id.toString();
      
      if (!existingProgressMap.has(challengeIdStr)) {
        // This is an available challenge (assigned but not started)
        availableChallenges.push({
          _id: assignment.challengeId._id,
          title: assignment.challengeId.title,
          description: assignment.challengeId.description,
          points: assignment.challengeId.points,
          category: assignment.challengeId.category,
          difficulty: assignment.challengeId.difficulty,
          assignedBy: assignment.assignedBy?.name || "Faculty",
          dueDate: assignment.dueDate ? formatDate(assignment.dueDate) : null,
          timeLeft: calculateTimeLeft(assignment.dueDate),
          isOverdue: isOverdue(assignment.dueDate),
          assignmentId: assignment._id
        });
      }
    }

    // Process existing progress records
    for (const progress of challengeProgress) {
      if (!progress.challengeId) continue;

      const challenge = progress.challengeId;
      const assignment = progress.assignmentId;
      
      // Get faculty name
      let facultyName = "System";
      if (assignment && assignment.assignedBy) {
        facultyName = assignment.assignedBy.name;
      }

      const challengeData = {
        _id: challenge._id,
        progressId: progress._id,
        title: challenge.title,
        description: challenge.description,
        points: challenge.points,
        category: challenge.category,
        difficulty: challenge.difficulty,
        assignedBy: facultyName,
        dueDate: assignment?.dueDate ? formatDate(assignment.dueDate) : null,
        timeLeft: calculateTimeLeft(assignment?.dueDate),
        isOverdue: isOverdue(assignment?.dueDate),
        progress: progress.progress,
        status: progress.status,
        pointsEarned: progress.pointsEarned,
        completedDate: progress.completedAt ? formatDate(progress.completedAt) : null,
        participants: await getParticipantsCount(challenge._id, instituteId)
      };

      // Categorize based on status
      switch (progress.status) {
        case "assigned":
          availableChallenges.push(challengeData);
          break;
        case "in-progress":
        case "submitted":
          activeChallenges.push(challengeData);
          break;
        case "approved":
        case "rejected":
          completedChallenges.push(challengeData);
          break;
      }
    }

    res.json({
      success: true,
      availableChallenges,
      activeChallenges,
      completedChallenges
    });

  } catch (error) {
    console.error("Error fetching student challenges:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch challenges" 
    });
  }
});

// Join/Start a challenge
router.post("/:studentId/challenges/:challengeId/join", async (req, res) => {
  try {
    const { studentId, challengeId } = req.params;
    const instituteId = req.user.instituteId;

    // Find the assignment for this student and challenge
    const assignment = await ChallengeAssignment.findOne({
      challengeId,
      assignedTo: studentId,
      instituteId
    });

    if (!assignment) {
      return res.status(404).json({ 
        success: false,
        error: "Challenge assignment not found" 
      });
    }

    // Check if progress already exists
    const existingProgress = await StudentChallengeProgress.findOne({
      challengeId,
      studentId,
      instituteId
    });

    if (existingProgress) {
      return res.status(400).json({
        success: false,
        error: "Challenge already in progress"
      });
    }

    // Create new progress record
    const progress = new StudentChallengeProgress({
      challengeId,
      assignmentId: assignment._id,
      studentId,
      instituteId,
      status: "in-progress",
      progress: 0,
      startedAt: new Date()
    });

    await progress.save();

    res.json({ 
      success: true, 
      message: "Challenge started successfully",
      progress 
    });

  } catch (error) {
    console.error("Error joining challenge:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to start challenge" 
    });
  }
});

// Submit challenge for review
router.post("/:studentId/challenges/:challengeId/submit", async (req, res) => {
  try {
    const { studentId, challengeId } = req.params;
    const { description, documents, photos } = req.body;
    const instituteId = req.user.instituteId;

    const progress = await StudentChallengeProgress.findOneAndUpdate(
      { 
        challengeId, 
        studentId, 
        instituteId,
        status: "in-progress" 
      },
      {
        status: "submitted",
        progress: 100,
        submittedAt: new Date(),
        submission: {
          description,
          documents,
          photos,
          submittedAt: new Date()
        }
      },
      { new: true }
    );

    if (!progress) {
      return res.status(404).json({
        success: false,
        error: "Challenge progress not found or already submitted"
      });
    }

    res.json({
      success: true,
      message: "Challenge submitted for review",
      progress
    });

  } catch (error) {
    console.error("Error submitting challenge:", error);
    res.status(500).json({
      success: false,
      error: "Failed to submit challenge"
    });
  }
});

// Helper functions
function calculateTimeLeft(dueDate) {
  if (!dueDate) return null;
  
  const now = new Date();
  const due = new Date(dueDate);
  const diffTime = due - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return "Overdue";
  if (diffDays === 0) return "Due today";
  if (diffDays === 1) return "1 day left";
  return `${diffDays} days left`;
}

function isOverdue(dueDate) {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

async function getParticipantsCount(challengeId, instituteId) {
  const count = await StudentChallengeProgress.countDocuments({
    challengeId,
    instituteId,
    status: { $in: ["in-progress", "submitted", "approved"] }
  });
  return count;
}

export default router;