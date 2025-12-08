/** @format */

import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: {
    type: [String],
    required: true,
    validate: [arrayLimit, "Options must be exactly 4 items"],
  },
  correctAnswer: { type: Number, required: true, min: 0, max: 3 },
  explanation: { type: String, default: "" },
  points: { type: Number, default: 1 },
});

function arrayLimit(val) {
  return val.length === 4;
}

const learningModuleSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, trim: true },
    category: {
      type: String,
      required: true,
      enum: [
        "climate",
        "biodiversity",
        "pollution",
        "conservation",
        "sustainability",
        "water",
        "forest",
        "wildlife",
      ],
    },
    duration: { type: String, default: "10 min" },
    points: { type: Number, default: 10, min: 0 },
    totalLessons: { type: Number, default: 1, min: 1 },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    color: { type: String, default: "#34eb5b" },
    youtubeId: { type: String, trim: true },
    description: { type: String, required: true },
    imageUrl: { type: String, trim: true },
    tags: [{ type: String }],
    prerequisites: [{ type: Number, ref: "LearningModule" }],
    isActive: { type: Boolean, default: true },

    // Quiz Array
    quiz: [quizSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for better query performance
learningModuleSchema.index({ category: 1, difficulty: 1 });
learningModuleSchema.index({
  title: "text",
  subtitle: "text",
  description: "text",
});

const LearningModule = mongoose.model("LearningModule", learningModuleSchema);

export default LearningModule;
