/** @format */

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/user.js";
import governmentRoutes from "./routes/governmentRoutes.js";
import instituteRoutes from "./routes/instituteRoutes.js";
import challengeRoutes from "./routes/challengeRoutes.js";
import learningModuleRoutes from "./routes/learningModule.js";
import reportRoutes from "./routes/reportRoutes.js";
import scheduleRoutes from "./routes/scheduleRoutes.js";
import studentRoutes from "./routes/studentRoutes.js"; // ADDED

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Database
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/student", studentRoutes); // ADDED
app.use("/api/government", governmentRoutes);
app.use("/api/institute", instituteRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/learningmodules", learningModuleRoutes);

app.use("/api/reports", reportRoutes);
app.use("/api/reports/schedule", scheduleRoutes);
import submissionsRoutes from "./routes/submissionsRoutes.js";
app.use("/api/submissions", submissionsRoutes);

import facultyRoutes from "./routes/facultyRoutes.js";
app.use("/api/faculty", facultyRoutes);

// Serve static files
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

export default app;
