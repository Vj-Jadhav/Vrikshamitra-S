// plantingTargetsController.js
import PlantingTarget from "../models/plantingTargets.js"; // Note: plantingTargets.js

export const createPlantingTarget = async (req, res) => {
  try {
    const target = await PlantingTarget.create(req.body);
    res.status(201).json({ success: true, data: target });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getPlantingTargets = async (req, res) => {
  try {
    const { pincode } = req.query;
    const query = {};

    if (pincode) {
      query.pincode = pincode;
    }

    const targets = await PlantingTarget.find(query);
    res.status(200).json({ success: true, data: targets });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getPlantingTargetsByPincode = async (req, res) => {
  try {
    const { pincode } = req.params;
    const targets = await PlantingTarget.find({ pincode });
    res.status(200).json({ success: true, data: targets });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};