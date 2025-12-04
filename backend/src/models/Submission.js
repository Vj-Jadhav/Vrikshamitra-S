const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  challengeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Challenge",
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "student",
    required: true,
  },
  studentName: {
    type: String,
    required: true,
  },
  studentEmail: {
    type: String,
    required: true,
  },
  challengeTitle: {
    type: String,
    required: true,
  },
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "faculty",
    required: true,
  },
  facultyName: {
    type: String,
    required: true,
  },
  points: {
    type: Number,
    required: true,
  },
  
  // Cloudinary fields
  cloudinaryUrl: {
    type: String,
    required: true,
  },
  cloudinaryPublicId: {
    type: String,
    required: true,
  },
  thumbnailUrl: {
    type: String,
  },
  imageFormat: {
    type: String,
  },
  imageSize: {
    type: Number,
  },
  imageDimensions: {
    width: Number,
    height: Number,
  },
  
  // Status and tracking
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  feedback: {
    type: String,
  },
  pointsAwarded: {
    type: Number,
  },
  
  // Timestamps
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  reviewedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Indexes for faster queries
submissionSchema.index({ studentId: 1, challengeId: 1 });
submissionSchema.index({ status: 1 });
submissionSchema.index({ facultyId: 1 });
submissionSchema.index({ uploadedAt: -1 });

module.exports = mongoose.model("Submission", submissionSchema);