import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
<<<<<<< HEAD
<<<<<<< HEAD
import userRoutes from "./routes/user.js";
=======
=======
import governmentRoutes from "./routes/governmentRoutes.js";
import instituteRoutes from "./routes/instituteRoutes.js";
>>>>>>> a008f90ae83cf97d509fcc647e5efba0cee9ec32
import challengeRoutes from "./routes/challengeRoutes.js";
>>>>>>> website

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Database
connectDB();

// Routes
app.use("/api/auth", authRoutes);
<<<<<<< HEAD
<<<<<<< HEAD
app.use("/api/user", userRoutes);

=======
=======
app.use("/api/government", governmentRoutes);
app.use("/api/institute", instituteRoutes);
>>>>>>> a008f90ae83cf97d509fcc647e5efba0cee9ec32
app.use("/api/challenges", challengeRoutes);
>>>>>>> website

export default app;
