import mongoose from "mongoose";

const studentChallengeProgressSchema = new mongoose.Schema({
  challengeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Challenge",
    required: true
  },
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ChallengeAssignment",
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  },
  instituteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Institute",
    required: true
  },
  
  // Progress tracking
  status: {
    type: String,
    enum: ["assigned", "in-progress", "submitted", "approved", "rejected"],
    default: "assigned"
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Submission details
  submission: {
    description: String,
    documents: [String], // File URLs
    photos: [String], // Image URLs
    submittedAt: Date,
    reviewedAt: Date,
    feedback: String,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "submission.reviewedByRef"
    },
    reviewedByRef: {
      type: String,
      enum: ["Faculty", "Admin"]
    }
  },
  
  // Timeline
  assignedAt: {
    type: Date,
    default: Date.now
  },
  startedAt: Date,
  submittedAt: Date,
  completedAt: Date,
  
  // Points and rewards
  pointsEarned: {
    type: Number,
    default: 0
  },
  ecoPoints: {
    type: Number,
    default: 0
  }

}, { timestamps: true });

// Compound indexes for better performance
studentChallengeProgressSchema.index({ challengeId: 1, studentId: 1 }, { unique: true });
studentChallengeProgressSchema.index({ assignmentId: 1, status: 1 });
studentChallengeProgressSchema.index({ instituteId: 1, status: 1 });

export default mongoose.model("StudentChallengeProgress", studentChallengeProgressSchema);