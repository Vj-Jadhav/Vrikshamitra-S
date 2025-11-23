// Challenge Submission Schema - UPDATED (Replacing ChallengeCompletion)
import mongoose from "mongoose";

const challengeSubmissionSchema = new mongoose.Schema({
  challengeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Challenge",
    required: true
  },

  instituteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Institute",
    required: true
  },

  // UPDATED: Simplified submission source
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Could be faculty or admin from institute
    required: true
  },

  // NEW: Institute details for easy access
  instituteName: {
    type: String,
    required: true
  },

  // UPDATED: Submission content
  description: {
    type: String,
    required: true
  },
  documents: [{
    filename: String,
    originalName: String,
    filePath: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  photos: [{
    filename: String,
    originalName: String,
    filePath: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // UPDATED: Status flow matching dashboard
  status: {
    type: String,
    enum: ["draft", "submitted", "under-review", "approved", "rejected"],
    default: "submitted"
  },

  // NEW: Government review fields
  governmentRemarks: String,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin"
  },
  reviewedAt: Date,

  // NEW: Submission metrics
  submissionDate: {
    type: Date,
    default: Date.now
  },

  // REMOVED: assignmentId (simplified structure)
  // REMOVED: submittedByRef (simplified to User reference)

}, { 
  timestamps: true 
});

// Indexes for performance
challengeSubmissionSchema.index({ challengeId: 1, instituteId: 1 });
challengeSubmissionSchema.index({ status: 1, submissionDate: -1 });

export default mongoose.model("ChallengeSubmission", challengeSubmissionSchema);