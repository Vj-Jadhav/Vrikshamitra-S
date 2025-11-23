// Challenge Schema - UPDATED
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

  // UPDATED: Changed from 'type' to more relevant fields
  category: {
    type: String,
    enum: ["environmental", "energy", "green-cover", "waste-management", "water-conservation", "other"],
    required: true
  },

  // NEW: Priority system for mandatory/optional challenges
  priority: {
    type: String,
    enum: ["mandatory", "optional"],
    default: "optional",
    required: true
  },

  // NEW: Status with more options
  status: {
    type: String,
    enum: ["draft", "active", "completed", "cancelled"],
    default: "draft"
  },

  // NEW: Mandatory flag (linked to priority)
  mandatory: {
    type: Boolean,
    default: false
  },

  // UPDATED: Date fields with validation
  startDate: {
    type: Date,
    default: Date.now
  },
  deadline: {
    type: Date,
    required: true
  },

  // NEW: Requirements and resources
  requirements: {
    type: String,
    required: true
  },
  resources: String,

  // NEW: Tracking fields
  totalSubmissions: {
    type: Number,
    default: 0
  },
  approvedSubmissions: {
    type: Number,
    default: 0
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true
  },

  // REMOVED: tags array (not used in current implementation)
  // REMOVED: type field (replaced by category and priority)

}, { 
  timestamps: true 
});

// Index for better query performance
challengeSchema.index({ status: 1, deadline: 1 });
challengeSchema.index({ priority: 1, mandatory: 1 });

export default mongoose.model("Challenge", challengeSchema);