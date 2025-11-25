import mongoose from "mongoose";

const challengeAssignmentSchema = new mongoose.Schema({
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
  assignedBy: {
    type: mongoose.Schema.Types.Mixed, // Changed from ObjectId to Mixed
    required: true
  },
  assignedByRef: {
    type: String,
    enum: ["Admin", "Faculty", "Institute"],
    required: true
  },
  
  // Assignment Details
  assignmentType: {
    type: String,
    enum: ["university", "college", "school"],
    required: true
  },
  
  // University-specific assignment
  faculties: [{
    faculty: String,
    departments: [String],
    batches: [String]
  }],
  
  // College-specific assignment
  departments: [{
    name: String,
    programs: [String],
    batches: [String],
    semesters: [Number]
  }],
  
  // School-specific assignment
  schoolAssignment: {
    grades: [String],
    batches: [String],
    sections: [String]
  },
  
  // Student tracking
  assignedStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student"
  }],
  totalAssignedStudents: {
    type: Number,
    default: 0
  },
  
  // Progress tracking
  submissionDeadline: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ["assigned", "in-progress", "completed", "cancelled"],
    default: "assigned"
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Submission tracking
  totalSubmissions: {
    type: Number,
    default: 0
  },
  approvedSubmissions: {
    type: Number,
    default: 0
  },
  pendingSubmissions: {
    type: Number,
    default: 0
  },
  
  // Timeline
  assignedAt: {
    type: Date,
    default: Date.now
  },
  startedAt: Date,
  completedAt: Date,
  
  // Additional details
  instructions: String,
  resources: [String],
  facultyCoordinator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Faculty", // or "User" depending on your faculty model
    required: true
  },

}, { timestamps: true });

export default mongoose.model("ChallengeAssignment", challengeAssignmentSchema);