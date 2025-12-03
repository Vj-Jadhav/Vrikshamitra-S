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

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Database
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/government", governmentRoutes);
app.use("/api/institute", instituteRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/learningmodules", learningModuleRoutes);

app.use("/api/reports", reportRoutes);
app.use("/api/reports/schedule", scheduleRoutes);

export default app;
