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
  phone: { 
    type: String,
    trim: true 
  },
  // School-specific fields
  grade: String,
  rollNumber: String,
  batch: String,
  section: String,

  // University/college-specific fields
  department: { 
    type: String 
  },
  program: { 
    type: String // e.g., B.Tech, M.Sc
  },
  semester: { 
    type: Number 
  },
  enrollmentNumber: { 
    type: String 
  },
  status: {
    type: String,
    enum: ["active", "inactive", "graduated", "transferred"],
    default: "active"
  },
  
  // Optional fields for better tracking
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ["male", "female", "other"]
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
