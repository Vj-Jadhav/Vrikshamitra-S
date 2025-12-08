/** @format */

import express from "express";
import {
  getAllModules,
  getModuleById,
  addModule,
  updateModule,
  deleteModule,
  getModulesByCategory,
} from "../controllers/learningModule.js";

const router = express.Router();

// GET all modules with optional query params
router.get("/", getAllModules);

// GET modules by category
router.get("/category/:category", getModulesByCategory);

// GET single module by ID
router.get("/:id", getModuleById);

// POST add new module
router.post("/", addModule);

// PUT update module
router.put("/:id", updateModule);

// DELETE module
router.delete("/:id", deleteModule);

export default router;
