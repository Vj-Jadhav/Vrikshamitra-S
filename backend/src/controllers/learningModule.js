/** @format */

import LearningModule from "../models/learningModule.js";

export const getAllModules = async (req, res) => {
  try {
    const modules = await LearningModule.find({});
    res.status(200).json(modules);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to load modules", error: err.message });
  }
};

export const addModule = async (req, res) => {
  try {
    const newModule = new LearningModule(req.body);
    await newModule.save();

    res.status(201).json({ message: "Module added successfully", newModule });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error adding module", error: err.message });
  }
};
