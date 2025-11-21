/** @format */

import express from "express";
import User from "../models/User.js";

const router = express.Router();

// GET USER BY ID
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      name: user.fullName,
      rank: 3,
      ecoPoints: 1250,
      avatar: "🌿",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
