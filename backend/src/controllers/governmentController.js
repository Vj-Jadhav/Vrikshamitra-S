import mongoose from "mongoose";

import { Institute, School, College, University } from "../models/BaseInstituteSchema.js";
import NGO from "../models/NGO.js";
import PlantingRequest from "../models/PlantingRequest.js";

export const getAllInstitutes = async (req, res) => {
  try {
    const institutes = await Institute.find().lean();

    res.status(200).json({
      success: true,
      data: institutes
    });
  } catch (error) {
    console.error("Error fetching institutes:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch institutes"
    });
  }
};

export const approveInstitute = async (req, res) => {
  try {
    // Approve institute by updating approvalStatus
    const institute = await Institute.findByIdAndUpdate(
      req.params.id,
      { approvalStatus: true },
      { new: true }
    );

    if (!institute) {
      return res.status(404).json({ success: false, message: "Institute not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Institute approved",
      data: institute
    });

  } catch (err) {
    console.error("ERROR in approveInstitute:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


export const rejectInstitute = async (req, res) => {
  try {
    const result = await Institute.findByIdAndUpdate(
      req.params.id,
      { approvalStatus: false },
      { new: true }
    );

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

export const getInstituteById = async (req, res) => {
  const { id } = req.params;

  // Validate MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid ID" });
  }

  try {
    const institute = await Institute.findById(id);

    if (!institute) {
      return res.status(404).json({ success: false, message: "Institute not found" });
    }

    res.status(200).json({ success: true, data: institute });
  } catch (error) {
    console.error("Error fetching institute:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


// Get Pending NGOs
export const getPendingNGOs = async (req, res) => {
  try {
    const pendingNGOs = await NGO.find({ status: 'pending' }).lean();
    res.status(200).json({ success: true, data: pendingNGOs });
  } catch (error) {
    console.error("Error getting pending NGOs:", error);
    res.status(500).json({ success: false, message: "Failed to fetch pending NGOs" });
  }
};

// Approve NGO
export const approveNGO = async (req, res) => {
  try {
    const { id } = req.params;
    const ngo = await NGO.findByIdAndUpdate(id, { status: 'active' }, { new: true });

    if (!ngo) {
      return res.status(404).json({ success: false, message: "NGO not found" });
    }

    res.status(200).json({ success: true, message: "NGO Approved", data: ngo });
  } catch (error) {
    console.error("Error approving NGO:", error);
    res.status(500).json({ success: false, message: "Failed to approve NGO" });
  }
};

// Reject NGO
export const rejectNGO = async (req, res) => {
  try {
    const { id } = req.params;
    const ngo = await NGO.findByIdAndUpdate(id, { status: 'rejected' }, { new: true });

    if (!ngo) {
      return res.status(404).json({ success: false, message: "NGO not found" });
    }

    res.status(200).json({ success: true, message: "NGO Rejected", data: ngo });
  } catch (error) {
    console.error("Error rejecting NGO:", error);
    res.status(500).json({ success: false, message: "Failed to reject NGO" });
  }
};
// Get all planting requests for government
export const getAllPlantingRequests = async (req, res) => {
  try {
    const requests = await PlantingRequest.find()
      .populate('instituteId', 'name')
      .populate('assignedFaculty', 'name')
      .populate('eventId', 'photos deliveryStatus plannedTrees targetId')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    console.error("Error fetching planting requests:", error);
    res.status(500).json({ success: false, message: "Failed to fetch requests" });
  }
};
