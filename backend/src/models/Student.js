import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  instituteId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Institute", 
    required: true 
  },
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  email: { 
    type: String, 
    unique: true, 
    required: true,
    lowercase: true,
    trim: true 
  },
  password: {
    type: String,
    default: null // Will be set by student during first login
  },
  phone: { 
    type: String,
    trim: true 
  },
  
  // Common fields for all institute types
  rollNumber: String,
  status: {
    type: String,
    enum: ["active", "inactive", "graduated", "transferred"],
    default: "active"
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  ecoPoints: {
    type: Number,
    default: 0
  },

  // School-specific fields
  grade: String,
  batch: String,
  section: String,

  // College-specific fields
  department: String,
  program: String, // e.g., B.Tech, M.Sc
  semester: Number,

  // University-specific fields
  faculty: String,
  enrollmentNumber: String,
  academicYear: String,

  // Optional fields for better tracking
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ["male", "female", "other", ""],
    default: ""
  },
  address: String

}, { 
  timestamps: true 
});

// Compound index to ensure unique roll numbers per institute
studentSchema.index({ instituteId: 1, rollNumber: 1 }, { unique: true });

// Compound index for enrollment number uniqueness (university-wide)
studentSchema.index({ instituteId: 1, enrollmentNumber: 1 }, { unique: true, sparse: true });

export default mongoose.model("Student", studentSchema);