/** @format */

import LearningModule from "../models/learningModule.js";

// GET all modules
export const getAllModules = async (req, res) => {
  try {
    const modules = await LearningModule.find({}).sort({ id: 1 });
    res.status(200).json(modules);
  } catch (err) {
    console.error("Error fetching modules:", err);
    res.status(500).json({
      message: "Failed to load modules",
      error: err.message,
    });
  }
};

// GET single module by ID
export const getModuleById = async (req, res) => {
  try {
    const module = await LearningModule.findOne({ id: req.params.id });
    if (!module) {
      return res.status(404).json({ message: "Module not found" });
    }
    res.status(200).json(module);
  } catch (err) {
    console.error("Error fetching module:", err);
    res.status(500).json({
      message: "Error fetching module",
      error: err.message,
    });
  }
};

// POST add new module
export const addModule = async (req, res) => {
  try {
    // Check if module with same ID already exists
    const existingModule = await LearningModule.findOne({ id: req.body.id });
    if (existingModule) {
      return res.status(400).json({
        message: "Module with this ID already exists",
      });
    }

    // Convert string numbers to actual numbers
    const processedData = {
      ...req.body,
      id: Number(req.body.id),
      points: Number(req.body.points) || 0,
      totalLessons: Number(req.body.totalLessons) || 0,
      // Ensure quiz correctAnswer is number
      quiz:
        req.body.quiz?.map((q) => ({
          ...q,
          correctAnswer: Number(q.correctAnswer) || 0,
        })) || [],
    };

    const newModule = new LearningModule(processedData);
    await newModule.save();

    res.status(201).json({
      message: "Module added successfully",
      module: newModule,
    });
  } catch (err) {
    console.error("Error adding module:", err);

    // Handle duplicate key error (if id is not unique)
    if (err.code === 11000) {
      return res.status(400).json({
        message: "Module with this ID already exists",
      });
    }

    // Handle validation errors
    if (err.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        errors: Object.values(err.errors).map((e) => e.message),
      });
    }

    res.status(500).json({
      message: "Error adding module",
      error: err.message,
    });
  }
};

// PUT update module
export const updateModule = async (req, res) => {
  try {
    const updatedModule = await LearningModule.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedModule) {
      return res.status(404).json({ message: "Module not found" });
    }

    res.status(200).json({
      message: "Module updated successfully",
      module: updatedModule,
    });
  } catch (err) {
    console.error("Error updating module:", err);
    res.status(500).json({
      message: "Error updating module",
      error: err.message,
    });
  }
};

// DELETE module
export const deleteModule = async (req, res) => {
  try {
    const deletedModule = await LearningModule.findOneAndDelete({
      id: req.params.id,
    });

    if (!deletedModule) {
      return res.status(404).json({ message: "Module not found" });
    }

    res.status(200).json({
      message: "Module deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting module:", err);
    res.status(500).json({
      message: "Error deleting module",
      error: err.message,
    });
  }
};
