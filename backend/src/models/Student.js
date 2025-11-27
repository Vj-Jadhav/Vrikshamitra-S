// models/Student.js
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
    default: null
  },
  requiresPasswordSetup: {
    type: Boolean,
    default: true
  },
  otp: {
    code: {
      type: String,
      default: null
    },
    expiresAt: {
      type: Date,
      default: null
    },
    attempts: {
      type: Number,
      default: 0
    },
    maxAttempts: {
      type: Number,
      default: 5
    },
    verified: {
      type: Boolean,
      default: false
    },
    tempToken: {
      type: String,
      default: null
    },
    tokenExpires: {
      type: Date,
      default: null
    },
    lastSentAt: {
      type: Date,
      default: null
    },
    resendCount: {
      type: Number,
      default: 0
    },
    maxResendCount: {
      type: Number,
      default: 3
    }
  },
  isVerified: {
    type: Boolean,
    default: false
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
  program: String,
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
  address: String,

  // Security and login tracking
  lastLoginAt: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  accountLockedUntil: Date,
  passwordChangedAt: Date

}, { 
  timestamps: true 
});

// Compound index to ensure unique roll numbers per institute
studentSchema.index({ instituteId: 1, rollNumber: 1 }, { unique: true });

// Compound index for enrollment number uniqueness (university-wide)
studentSchema.index({ instituteId: 1, enrollmentNumber: 1 }, { unique: true, sparse: true });

// Index for OTP expiration cleanup
studentSchema.index({ "otp.expiresAt": 1 }, { expireAfterSeconds: 0 });

// Index for token expiration cleanup
studentSchema.index({ "otp.tokenExpires": 1 }, { expireAfterSeconds: 0 });

// Index for account lock cleanup
studentSchema.index({ accountLockedUntil: 1 }, { expireAfterSeconds: 0 });

// Method to check if OTP is valid and not expired
studentSchema.methods.isOTPValid = function() {
  if (!this.otp || !this.otp.code || !this.otp.expiresAt) {
    return false;
  }
  return this.otp.expiresAt > new Date() && this.otp.attempts < this.otp.maxAttempts;
};

// Method to check if temp token is valid
studentSchema.methods.isTempTokenValid = function() {
  if (!this.otp || !this.otp.tempToken || !this.otp.tokenExpires) {
    return false;
  }
  return this.otp.tokenExpires > new Date() && this.otp.verified;
};

// Method to increment OTP attempts
studentSchema.methods.incrementOTPAttempts = function() {
  if (this.otp) {
    this.otp.attempts += 1;
    
    // Lock OTP if max attempts reached
    if (this.otp.attempts >= this.otp.maxAttempts) {
      this.otp.code = null;
      this.otp.expiresAt = new Date(); // Expire immediately
    }
  }
};

// Method to reset OTP data
studentSchema.methods.resetOTP = function() {
  this.otp = {
    code: null,
    expiresAt: null,
    attempts: 0,
    verified: false,
    tempToken: null,
    tokenExpires: null,
    lastSentAt: null,
    resendCount: 0
  };
};

// Method to clear OTP after successful password setup
studentSchema.methods.clearOTP = function() {
  if (this.otp) {
    this.otp.code = null;
    this.otp.expiresAt = null;
    this.otp.tempToken = null;
    this.otp.tokenExpires = null;
    this.otp.verified = false;
  }
};

// Static method to find by email with case insensitivity
studentSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase().trim() });
};

// Pre-save middleware to handle password setup completion
studentSchema.pre('save', function(next) {
  if (this.isModified('password') && this.password) {
    this.requiresPasswordSetup = false;
    this.isVerified = true;
    this.passwordChangedAt = new Date();
    
    // Clear OTP data when password is set
    if (this.otp) {
      this.clearOTP();
    }
  }
  next();
});

// Virtual for checking if account is locked
studentSchema.virtual('isAccountLocked').get(function() {
  return this.accountLockedUntil && this.accountLockedUntil > new Date();
});

// Virtual for checking if OTP can be resent
studentSchema.virtual('canResendOTP').get(function() {
  if (!this.otp || !this.otp.lastSentAt) return true;
  
  const timeSinceLastOTP = Date.now() - this.otp.lastSentAt.getTime();
  const resendCooldown = 60 * 1000; // 1 minute cooldown
  
  return timeSinceLastOTP >= resendCooldown && 
         this.otp.resendCount < this.otp.maxResendCount;
});

export default mongoose.model("Student", studentSchema);