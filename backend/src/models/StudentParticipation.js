import mongoose from "mongoose";

const participationSchema = new mongoose.Schema({
  // UPDATED: Reference to challenge instead of assignment
  challengeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Challenge",
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

  // UPDATED: Enhanced submission tracking
  submittedByFaculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Faculty"
  },

  // NEW: Individual student contribution details
  studentRole: {
    type: String,
    enum: ["participant", "team-leader", "coordinator", "volunteer"],
    default: "participant"
  },

  contributionDescription: String,
  hoursContributed: {
    type: Number,
    min: 0
  },

  // UPDATED: Enhanced file handling
  photos: [{
    filename: String,
    originalName: String,
    filePath: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  documents: [{
    filename: String,
    originalName: String,
    filePath: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  remarks: String,

  // UPDATED: Status to match institute workflow
  status: {
    type: String,
    enum: ["registered", "in-progress", "submitted", "verified", "rejected"],
    default: "registered"
  },

  // NEW: Verification tracking
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Faculty"
  },
  verifiedAt: Date,

  // NEW: Submission dates
  registeredAt: {
    type: Date,
    default: Date.now
  },
  submittedAt: Date,

  // NEW: Institute-level approval (before government review)
  instituteApproval: {
    approved: {
      type: Boolean,
      default: false
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty"
    },
    approvedAt: Date,
    remarks: String
  }

}, { 
  timestamps: true 
});

// Index for better query performance
participationSchema.index({ challengeId: 1, studentId: 1 }, { unique: true });
participationSchema.index({ instituteId: 1, status: 1 });
participationSchema.index({ studentId: 1, status: 1 });

export default mongoose.model("StudentParticipation", participationSchema);