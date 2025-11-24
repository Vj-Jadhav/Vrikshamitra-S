// NEW: Institute Challenge Progress Schema
const instituteChallengeProgressSchema = new mongoose.Schema({
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
  
  // Progress tracking
  totalStudents: {
    type: Number,
    default: 0
  },
  participatingStudents: {
    type: Number,
    default: 0
  },
  completedStudents: {
    type: Number,
    default: 0
  },
  
  // Submission status
  submissionStatus: {
    type: String,
    enum: ["not-started", "in-progress", "submitted", "approved", "rejected"],
    default: "not-started"
  },
  
  lastActivity: Date,
  completionPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  }

}, { 
  timestamps: true 
});

instituteChallengeProgressSchema.index({ challengeId: 1, instituteId: 1 }, { unique: true });