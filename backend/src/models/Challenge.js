// Challenge Schema - UPDATED with ecoPoints
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
  priority: {
    type: String,
    enum: ["mandatory", "optional"],
    default: "optional",
    required: true
  },
  status: {
    type: String,
    enum: ["draft", "active", "completed", "cancelled"],
    default: "draft"
  },
  mandatory: {
    type: Boolean,
    default: false
  },
  
  // NEW: Eco Points field
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
  requirements: {
    type: String,
    required: true
  },
  resources: String,
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
  }
}, { 
  timestamps: true 
});

challengeSchema.index({ status: 1, deadline: 1 });
challengeSchema.index({ priority: 1, mandatory: 1 });

export default mongoose.model("Challenge", challengeSchema);