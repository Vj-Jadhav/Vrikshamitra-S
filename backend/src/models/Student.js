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
  grade: { 
    type: String,
    required: true 
  },
  rollNumber: { 
    type: String,
    required: true 
  },
  batch: { 
    type: String 
  },
  section: { 
    type: String 
  },
  status: {
    type: String,
    enum: ["active", "inactive", "graduated", "transferred"],
    default: "active"
  },
  
  // NEW: Optional fields for better tracking
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

export default mongoose.model("Student", studentSchema);