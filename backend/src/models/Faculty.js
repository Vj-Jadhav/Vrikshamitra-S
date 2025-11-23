// models/Faculty.js
import mongoose from "mongoose";

const facultySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    subjects: {
      type: [String], // Array of subjects
      default: [],
    },
    joinDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "on leave"],
      default: "active",
    },
    instituteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institute", // Links to the base Institute model
      required: true,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

export default mongoose.model("Faculty", facultySchema);
