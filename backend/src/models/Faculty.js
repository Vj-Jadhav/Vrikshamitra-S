// models/Faculty.js
import mongoose from "mongoose";

const facultySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    default: null
  },
  phone: { 
    type: String,
    trim: true 
  },

  assignedStudents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student"
    }
  ],
  // For University: faculty -> department -> teacher
  // For College: department -> teacher  
  // For School: teacher only
  faculty: { 
    type: String 
  }, // Only for University type
  department: { 
    type: String, 
    required: true 
  },
  subjects: [String],
  joinDate: { 
    type: Date, 
    default: Date.now 
  },
  status: {
    type: String,
    enum: ["active", "inactive", "on leave"],
    default: "active"
  },
  instituteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Institute",
    required: true
  },
  
  // OTP and verification fields
  requiresPasswordSetup: {
    type: Boolean,
    default: false
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

// Index for OTP expiration cleanup
facultySchema.index({ "otp.expiresAt": 1 }, { expireAfterSeconds: 0 });

// Index for token expiration cleanup
facultySchema.index({ "otp.tokenExpires": 1 }, { expireAfterSeconds: 0 });

// Index for account lock cleanup
facultySchema.index({ accountLockedUntil: 1 }, { expireAfterSeconds: 0 });

// Method to check if OTP is valid and not expired
facultySchema.methods.isOTPValid = function() {
  if (!this.otp || !this.otp.code || !this.otp.expiresAt) {
    return false;
  }
  return this.otp.expiresAt > new Date() && this.otp.attempts < this.otp.maxAttempts;
};

// Method to check if temp token is valid
facultySchema.methods.isTempTokenValid = function() {
  if (!this.otp || !this.otp.tempToken || !this.otp.tokenExpires) {
    return false;
  }
  return this.otp.tokenExpires > new Date() && this.otp.verified;
};

// Method to increment OTP attempts
facultySchema.methods.incrementOTPAttempts = function() {
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
facultySchema.methods.resetOTP = function() {
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
facultySchema.methods.clearOTP = function() {
  if (this.otp) {
    this.otp.code = null;
    this.otp.expiresAt = null;
    this.otp.tempToken = null;
    this.otp.tokenExpires = null;
    this.otp.verified = false;
  }
};

// Static method to find by email with case insensitivity
facultySchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase().trim() });
};

// Pre-save middleware to handle password setup completion
facultySchema.pre('save', function(next) {
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
facultySchema.virtual('isAccountLocked').get(function() {
  return this.accountLockedUntil && this.accountLockedUntil > new Date();
});

// Virtual for checking if OTP can be resent
facultySchema.virtual('canResendOTP').get(function() {
  if (!this.otp || !this.otp.lastSentAt) return true;
  
  const timeSinceLastOTP = Date.now() - this.otp.lastSentAt.getTime();
  const resendCooldown = 60 * 1000; // 1 minute cooldown
  
  return timeSinceLastOTP >= resendCooldown && 
         this.otp.resendCount < this.otp.maxResendCount;
});

export default mongoose.model("Faculty", facultySchema);