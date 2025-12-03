// models/Challenge.js
import mongoose from "mongoose";

const challengeSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ["environmental", "energy", "green-cover", "waste-management", "water-conservation", "other"],
    required: true
  },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    default: "Medium"
  },
  ecoPoints: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  deadline: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ["draft", "active", "completed", "cancelled"],
    default: "draft"
  },
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ["in-progress", "completed", "abandoned"],
      default: "in-progress"
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    completedAt: Date
  }],
  requirements: {
    type: String,
    required: true
  },
  resources: [String],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true
  }
}, { 
  timestamps: true 
});

// Indexes for better query performance
challengeSchema.index({ status: 1, deadline: 1 });
challengeSchema.index({ "participants.userId": 1, "participants.status": 1 });

// Export as default
const Challenge = mongoose.model("Challenge", challengeSchema);
export default Challenge;