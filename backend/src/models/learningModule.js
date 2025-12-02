/** @format */

import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: { type: [String], required: true },
  correctAnswer: { type: Number, required: true },
  explanation: { type: String },
});

const learningModuleSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    subtitle: { type: String },
    category: { type: String },
    duration: { type: String },
    points: { type: Number },
    totalLessons: { type: Number },
    difficulty: { type: String },
    color: { type: String },
    youtubeId: { type: String },
    description: { type: String },
    imageUrl: { type: String },

    // Quiz Array
    quiz: [quizSchema],
  },
  { timestamps: true }
);

const LearningModule = mongoose.model("LearningModule", learningModuleSchema);
export default LearningModule;
