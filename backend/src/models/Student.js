// models/Student.js
import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  instituteId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Institute", 
    required: true 
  },
  name: { type: String, required: true, trim: true },
  email: { type: String, unique: true, required: true, lowercase: true, trim: true },

  password: { type: String, default: null },
  requiresPasswordSetup: { type: Boolean, default: true },

  otp: {
    code: { type: String, default: null },
    expiresAt: { type: Date, default: null },
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 5 },
    verified: { type: Boolean, default: false },
    tempToken: { type: String, default: null },
    tokenExpires: { type: Date, default: null },
    lastSentAt: { type: Date, default: null },
    resendCount: { type: Number, default: 0 },
    maxResendCount: { type: Number, default: 3 }
  },

  isVerified: { type: Boolean, default: false },
  phone: { type: String, trim: true },

  rollNumber: String,
  status: { type: String, enum: ["active", "inactive", "graduated", "transferred"], default: "active" },
  joinDate: { type: Date, default: Date.now },
  ecoPoints: { type: Number, default: 0 },

  grade: String,
  batch: String,
  section: String,
  department: String,
  program: String,
  semester: Number,
  faculty: String,
  enrollmentNumber: String,
  academicYear: String,

  dateOfBirth: Date,
  gender: { type: String, enum: ["male", "female", "other", ""], default: "" },
  address: String,

  lastLoginAt: Date,
  loginAttempts: { type: Number, default: 0 },
  accountLockedUntil: Date,
  passwordChangedAt: Date,

  // Reset fields
  resetOTP: { type: String, default: null },
  resetOTPExpiry: { type: Date, default: null },
  resetToken: { type: String, default: null },
  resetTokenExpiry: { type: Date, default: null }

}, { timestamps: true });

// Indexes
studentSchema.index({ instituteId: 1, rollNumber: 1 }, { unique: true });
studentSchema.index({ instituteId: 1, enrollmentNumber: 1 }, { unique: true, sparse: true });
studentSchema.index({ "otp.expiresAt": 1 }, { expireAfterSeconds: 0 });
studentSchema.index({ "otp.tokenExpires": 1 }, { expireAfterSeconds: 0 });
studentSchema.index({ accountLockedUntil: 1 }, { expireAfterSeconds: 0 });
studentSchema.index({ resetTokenExpiry: 1 }, { expireAfterSeconds: 0 });
studentSchema.index({ resetOTPExpiry: 1 }, { expireAfterSeconds: 0 });

// ---------------- METHODS ----------------

// OTP Valid
studentSchema.methods.isOTPValid = function() {
  return this.otp?.code && this.otp?.expiresAt > new Date() && this.otp.attempts < this.otp.maxAttempts;
};

// Temp token valid
studentSchema.methods.isTempTokenValid = function() {
  return this.otp?.tempToken && this.otp.tokenExpires > new Date() && this.otp.verified;
};

// Reset OTP valid
studentSchema.methods.isResetOTPValid = function() {
  return this.resetOTP && this.resetOTPExpiry > new Date();
};

// Reset token valid
studentSchema.methods.isResetTokenValid = function() {
  return this.resetToken && this.resetTokenExpiry > new Date();
};

// Increase OTP attempts
studentSchema.methods.incrementOTPAttempts = function() {
  if (this.otp) {
    this.otp.attempts++;
    if (this.otp.attempts >= this.otp.maxAttempts) {
      this.otp.code = null;
      this.otp.expiresAt = new Date();
    }
  }
};

// ⭐ FIXED NAME → resetOTPData()
studentSchema.methods.resetOTPData = function() {
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

// Clear reset data
studentSchema.methods.clearResetData = function() {
  if (this.otp) {
    this.otp.code = null;
    this.otp.expiresAt = null;
    this.otp.tempToken = null;
    this.otp.tokenExpires = null;
    this.otp.verified = false;
  }
  this.resetOTP = null;
  this.resetOTPExpiry = null;
  this.resetToken = null;
  this.resetTokenExpiry = null;
};

// Clear OTP after password setup
studentSchema.methods.clearOTP = function() {
  if (this.otp) {
    this.otp.code = null;
    this.otp.expiresAt = null;
    this.otp.tempToken = null;
    this.otp.tokenExpires = null;
    this.otp.verified = false;
  }
};

// STATICS
studentSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase().trim() });
};

studentSchema.statics.findByResetToken = function(token) {
  return this.findOne({ resetToken: token, resetTokenExpiry: { $gt: new Date() } });
};

studentSchema.statics.findByResetOTP = function(otp, email) {
  return this.findOne({ 
    resetOTP: otp,
    resetOTPExpiry: { $gt: new Date() },
    ...(email && { email: email.toLowerCase().trim() })
  });
};

// Pre-save
studentSchema.pre('save', function(next) {
  if (this.isModified('password') && this.password) {
    this.requiresPasswordSetup = false;
    this.isVerified = true;
    this.passwordChangedAt = new Date();
    this.clearResetData();
  }
  next();
});

// Virtuals
studentSchema.virtual('isAccountLocked').get(function() {
  return this.accountLockedUntil && this.accountLockedUntil > new Date();
});

studentSchema.virtual('canResendOTP').get(function() {
  if (!this.otp?.lastSentAt) return true;
  return Date.now() - this.otp.lastSentAt.getTime() >= 60000 && this.otp.resendCount < this.otp.maxResendCount;
});

studentSchema.virtual('canResendResetOTP').get(function() {
  if (!this.resetOTPLastSent) return true;
  return Date.now() - this.resetOTPLastSent.getTime() >= 60000;
});

export default mongoose.model("Student", studentSchema);
