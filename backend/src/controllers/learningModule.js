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
