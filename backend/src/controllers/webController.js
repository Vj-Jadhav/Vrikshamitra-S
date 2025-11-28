// import mongoose from "mongoose";

import { Institute, School, College, University } from "../models/BaseInstituteSchema.js";
// import Faculty from "../models/Faculty.js";
import Student from "../models/Student.js";
import Challenge from "../models/Challenge.js";
import ChallengeAssignment from '../models/ChallengeAssignment.js';
import StudentChallengeProgress from '../models/StudentChallengeProgress.js';

//government dashboard
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


export const getStudentsByInstituteId = async (req, res) => {
  const { instituteId } = req.params;

  // Validate ID
  if (!mongoose.Types.ObjectId.isValid(instituteId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid institute ID",
    });
  }

  try {
    const students = await Student.find({ instituteId });

    if (!students.length) {
      return res.status(404).json({
        success: false,
        message: "No students found for this institute",
      });
    }

    return res.status(200).json({
      success: true,
      data: students,
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching students",
    });
  }
};


export const createChallengeAssignment = async (req, res) => {
  try {
    const {
      challengeId,
      instituteId,
      assignedBy,
      assignedByRef,
      assignmentType,
      submissionDeadline,
      instructions,
      facultyCoordinator,
      totalAssignedStudents,
      assignedStudents,
      
      // University-specific fields
      faculties = [],
      programs = [],
      academicYears = [],
      
      // College-specific fields
      departments = [],
      
      // School-specific fields
      grades = [],
      batches = [],
      sections = []
    } = req.body;

    console.log('Received assignment data:', req.body);

    // Validate required fields
    const requiredFields = {
      challengeId,
      instituteId, 
      assignedBy,
      assignedByRef,
      assignmentType,
      submissionDeadline
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Check if challenge exists
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    // Validate assigned students exist
    if (assignedStudents && assignedStudents.length > 0) {
      const existingStudents = await Student.find({
        _id: { $in: assignedStudents },
        instituteId: instituteId,
        status: 'active'
      });
      
      if (existingStudents.length !== assignedStudents.length) {
        return res.status(400).json({
          success: false,
          message: 'Some students not found or are inactive'
        });
      }
    }

    // Check for duplicate assignment
    const existingAssignment = await ChallengeAssignment.findOne({
      challengeId,
      instituteId,
      status: { $in: ['assigned', 'in-progress'] }
    });

    if (existingAssignment) {
      return res.status(409).json({
        success: false,
        message: 'This challenge is already assigned to students in your institute'
      });
    }

    // Build assignment data
    const assignmentData = {
      challengeId,
      instituteId,
      assignedBy: assignedBy, // Can be string or ObjectId
      assignedByRef,
      assignmentType,
      submissionDeadline: new Date(submissionDeadline),
      instructions,
      facultyCoordinator,
      totalAssignedStudents: assignedStudents?.length || 0,
      assignedStudents: assignedStudents || [],
      status: 'assigned',
      progress: 0,
      totalSubmissions: 0,
      approvedSubmissions: 0,
      pendingSubmissions: assignedStudents?.length || 0
    };

    // Add type-specific data
    switch (assignmentType) {
      case 'university':
        assignmentData.faculties = faculties;
        assignmentData.programs = programs;
        assignmentData.academicYears = academicYears;
        break;
      case 'college':
        assignmentData.departments = departments;
        break;
      case 'school':
        assignmentData.grades = grades;
        assignmentData.batches = batches;
        assignmentData.sections = sections;
        break;
    }

    console.log('Final assignment data:', assignmentData);

    // Create the challenge assignment
    const challengeAssignment = new ChallengeAssignment(assignmentData);
    const savedAssignment = await challengeAssignment.save();

    // Create individual student progress records
    if (assignedStudents && assignedStudents.length > 0) {
      const studentProgressRecords = assignedStudents.map(studentId => ({
        challengeId,
        assignmentId: savedAssignment._id,
        studentId,
        instituteId,
        status: 'assigned',
        progress: 0,
        pointsEarned: 0,
        ecoPoints: 0,
        assignedAt: new Date()
      }));

      await StudentChallengeProgress.insertMany(studentProgressRecords);
    }

    // Populate the response
    const populatedAssignment = await ChallengeAssignment.findById(savedAssignment._id)
      .populate('challengeId', 'title description category priority deadline')
      .populate('assignedStudents', 'name email rollNumber batch department grade')
      .lean();

    res.status(201).json({
      success: true,
      message: 'Challenge assigned successfully',
      data: populatedAssignment
    });

  } catch (error) {
    console.error('Error creating challenge assignment:', error);
    
    // Enhanced error logging
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      }));
      console.log('Validation Errors Details:', errors);
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Assignment already exists for these students'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get assignments for an institute
export const getInstituteAssignments = async (req, res) => {
  try {
    const { instituteId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    if (!instituteId) {
      return res.status(400).json({
        success: false,
        message: 'Institute ID is required'
      });
    }

    const query = { instituteId };
    if (status && status !== 'all') {
      query.status = status;
    }

    const assignments = await ChallengeAssignment.find(query)
      .populate('challengeId', 'title description category priority deadline requirements')
      .populate('assignedStudents', 'name email rollNumber batch')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await ChallengeAssignment.countDocuments(query);

    res.status(200).json({
      success: true,
      data: assignments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalAssignments: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching institute assignments:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get assignment details with student progress
export const getAssignmentDetails = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const assignment = await ChallengeAssignment.findById(assignmentId)
      .populate('challengeId', 'title description category priority deadline requirements resources')
      .populate('assignedStudents', 'name email rollNumber batch department grade section program semester faculty')
      .lean();

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Get student progress for this assignment
    const studentProgress = await StudentChallengeProgress.find({
      assignmentId,
      instituteId: assignment.instituteId
    })
    .populate('studentId', 'name email rollNumber batch')
    .select('studentId status progress submittedAt pointsEarned ecoPoints')
    .lean();

    // Calculate progress statistics
    const progressStats = {
      total: assignment.totalAssignedStudents,
      assigned: studentProgress.filter(sp => sp.status === 'assigned').length,
      inProgress: studentProgress.filter(sp => sp.status === 'in-progress').length,
      submitted: studentProgress.filter(sp => sp.status === 'submitted').length,
      approved: studentProgress.filter(sp => sp.status === 'approved').length,
      rejected: studentProgress.filter(sp => sp.status === 'rejected').length
    };

    // Calculate overall progress percentage
    const overallProgress = studentProgress.length > 0 
      ? studentProgress.reduce((sum, sp) => sum + sp.progress, 0) / studentProgress.length
      : 0;

    res.status(200).json({
      success: true,
      data: {
        ...assignment,
        studentProgress,
        progressStats,
        overallProgress: Math.round(overallProgress)
      }
    });

  } catch (error) {
    console.error('Error fetching assignment details:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update assignment status
export const updateAssignmentStatus = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { status, instructions, facultyCoordinator } = req.body;

    if (!status || !['assigned', 'in-progress', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required: assigned, in-progress, completed, cancelled'
      });
    }

    const updateData = { status };
    if (instructions) updateData.instructions = instructions;
    if (facultyCoordinator) updateData.facultyCoordinator = facultyCoordinator;

    if (status === 'in-progress') {
      updateData.startedAt = new Date();
    } else if (status === 'completed') {
      updateData.completedAt = new Date();
    }

    const assignment = await ChallengeAssignment.findByIdAndUpdate(
      assignmentId,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('challengeId', 'title description')
    .populate('assignedStudents', 'name email');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Assignment ${status} successfully`,
      data: assignment
    });

  } catch (error) {
    console.error('Error updating assignment status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete assignment
export const deleteAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const assignment = await ChallengeAssignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Check if there are any submissions
    const hasSubmissions = await StudentChallengeProgress.findOne({
      assignmentId,
      status: { $in: ['submitted', 'approved', 'rejected'] }
    });

    if (hasSubmissions) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete assignment that has student submissions'
      });
    }

    // Delete assignment and all student progress records
    await Promise.all([
      ChallengeAssignment.findByIdAndDelete(assignmentId),
      StudentChallengeProgress.deleteMany({ assignmentId })
    ]);

    res.status(200).json({
      success: true,
      message: 'Assignment deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get assignment statistics for dashboard
export const getAssignmentStatistics = async (req, res) => {
  try {
    const { instituteId } = req.params;

    const stats = await ChallengeAssignment.aggregate([
      { $match: { instituteId: mongoose.Types.ObjectId(instituteId) } },
      {
        $group: {
          _id: null,
          totalAssignments: { $sum: 1 },
          totalStudentsAssigned: { $sum: '$totalAssignedStudents' },
          assignmentsInProgress: {
            $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] }
          },
          assignmentsCompleted: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          totalSubmissions: { $sum: '$totalSubmissions' },
          approvedSubmissions: { $sum: '$approvedSubmissions' },
          averageProgress: { $avg: '$progress' }
        }
      }
    ]);

    const studentProgressStats = await StudentChallengeProgress.aggregate([
      {
        $lookup: {
          from: 'challengeassignments',
          localField: 'assignmentId',
          foreignField: '_id',
          as: 'assignment'
        }
      },
      { $unwind: '$assignment' },
      { $match: { 'assignment.instituteId': mongoose.Types.ObjectId(instituteId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const defaultStats = {
      totalAssignments: 0,
      totalStudentsAssigned: 0,
      assignmentsInProgress: 0,
      assignmentsCompleted: 0,
      totalSubmissions: 0,
      approvedSubmissions: 0,
      averageProgress: 0
    };

    res.status(200).json({
      success: true,
      data: {
        assignmentStats: stats[0] || defaultStats,
        studentProgress: studentProgressStats
      }
    });

  } catch (error) {
    console.error('Error fetching assignment statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};



/**
 * @desc    Get all challenges
 * @route   GET /challenges
 */
export const getChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.find().sort({ createdAt: -1 });
    res.status(200).json(challenges);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch challenges", error });
  }
};

/**
 * @desc    Create new challenge
 * @route   POST /challenges
 */
export const createChallenge = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      priority,
      status,
      mandatory,
      startDate,
      deadline,
      requirements,
      resources,
      createdBy
    } = req.body;

    // Auto-sync mandatory with priority
    const isMandatory = priority === "mandatory";

    const challenge = await Challenge.create({
      title,
      description,
      category,
      priority,
      status,
      mandatory: isMandatory,
      startDate,
      deadline,
      requirements,
      resources,
      createdBy
    });

    res.status(201).json(challenge);
  } catch (error) {
    res.status(400).json({ message: "Failed to create challenge", error });
  }
};

/**
 * @desc    Update a challenge
 * @route   PUT /challenges/:id
 */
export const updateChallenge = async (req, res) => {
  try {
    const updates = { ...req.body };

    // Keep mandatory consistent with priority if changed
    if (updates.priority) {
      updates.mandatory = updates.priority === "mandatory";
    }

    const updatedChallenge = await Challenge.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    if (!updatedChallenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }

    res.status(200).json(updatedChallenge);
  } catch (error) {
    res.status(500).json({ message: "Failed to update challenge", error });
  }
};

/**
 * @desc    Delete a challenge
 * @route   DELETE /challenges/:id
 */
export const deleteChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findByIdAndDelete(req.params.id);

    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }

    res.status(200).json({ message: "Challenge deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete challenge", error });
  }
};