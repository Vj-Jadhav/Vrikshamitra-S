import mongoose from "mongoose";
import {
  Institute,
  School,
  College,
  University,
} from "../models/BaseInstituteSchema.js";
import Challenge from "../models/Challenge.js";
import ChallengeAssignment from "../models/ChallengeAssignment.js";
import Faculty from "../models/Faculty.js";
import Student from "../models/Student.js";
import StudentChallengeProgress from "../models/StudentChallengeProgress.js";
import Event from "../models/Event.js";
import PlantingTarget from "../models/plantingTargets.js";

// Get institute by ID
export const getInstituteById = async (req, res) => {
  try {
    const { instituteId } = req.params;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(instituteId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid institute ID format",
      });
    }

    // Find institute - adjust based on your Institute model structure
    const institute = await Institute.findById(instituteId)
      .select(
        "name email phone address type instituteType establishedYear status faculties departments"
      )
      .lean();

    if (!institute) {
      return res.status(404).json({
        success: false,
        message: "Institute not found",
      });
    }

    // Get counts for dashboard
    const studentCount = await Student.countDocuments({ instituteId });
    const facultyCount = await Faculty.countDocuments({ instituteId });
    const assignmentCount = await ChallengeAssignment.countDocuments({
      instituteId,
    });

    return res.status(200).json({
      success: true,
      data: {
        ...institute,
        studentCount,
        facultyCount,
        assignmentCount,
      },
    });
  } catch (error) {
    console.error("Error fetching institute:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching institute",
      error: error.message,
    });
  }
};

// Add single student
export const addStudent = async (req, res) => {
  try {
    const { instituteId } = req.params;
    const studentData = req.body;

    // Validate required fields
    if (!studentData.name || !studentData.email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required fields",
      });
    }

    // Check if institute exists
    const institute = await Institute.findById(instituteId);
    if (!institute) {
      return res.status(404).json({
        success: false,
        message: "Institute not found",
      });
    }

    // Create student with instituteId
    const student = new Student({
      ...studentData,
      instituteId,
      status: studentData.status || "active",
      joinDate: studentData.joinDate || new Date(),
      ecoPoints: studentData.ecoPoints || 0,
    });

    const savedStudent = await student.save();

    res.status(201).json({
      success: true,
      data: savedStudent,
    });
  } catch (error) {
    console.error("Error adding student:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        error: error.message,
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Student with this email or roll number already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to add student",
      error: error.message,
    });
  }
};

export const getInstituteProfile = async (req, res) => {
  try {
    console.log("🔍 getInstituteProfile - Starting...");

    // The middleware should have attached the institute to req.user
    if (!req.user) {
      console.error("❌ req.user is undefined or null");
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    // Get the institute ID
    let instituteId = req.user._id || req.user.id;

    // Convert to string and clean it
    const instituteIdStr = String(instituteId).trim();

    // Check if it's a valid ObjectId
    const isValidObjectId = mongoose.Types.ObjectId.isValid(instituteIdStr);

    if (!isValidObjectId) {
      console.error("❌ Invalid ObjectId format:", instituteIdStr);
      return res.status(400).json({
        success: false,
        message: 'Invalid institute ID format',
        providedId: instituteIdStr
      });
    }

    // Convert string to ObjectId
    const objectId = new mongoose.Types.ObjectId(instituteIdStr);

    // Try to find the institute
    console.log("Searching for institute with ID:", objectId);
    const institute = await Institute.findById(objectId)
      .select('-password')
      .lean();

    if (!institute) {
      console.error("❌ Institute not found with ID:", objectId);

      // Try alternative query
      const altInstitute = await Institute.findOne({ _id: objectId }).lean();
      console.log("Alternative query result:", altInstitute ? "Found" : "Not found");

      return res.status(404).json({
        success: false,
        message: 'Institute not found'
      });
    }

    // Get counts
    const studentCount = await Student.countDocuments({ instituteId: objectId });
    const facultyCount = await Faculty.countDocuments({ instituteId: objectId });
    const assignmentCount = await ChallengeAssignment.countDocuments({ instituteId: objectId });

    // Return the data
    res.status(200).json({
      success: true,
      data: {
        ...institute,
        studentCount,
        facultyCount,
        assignmentCount
      }
    });

  } catch (err) {
    console.error('❌ Error in getInstituteProfile:', err);

    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Invalid ID format: ${err.value}`,
        error: err.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

// Add faculty
export const addFaculty = async (req, res) => {
  try {
    const { instituteId } = req.params;
    const { name, email, phone, department, subjects, faculty } = req.body;

    // Validate required fields
    if (!name || !email || !department) {
      return res.status(400).json({
        success: false,
        message: "Name, Email, and Department are required.",
      });
    }

    // Check if institute exists
    const institute = await Institute.findById(instituteId);
    if (!institute) {
      return res.status(404).json({
        success: false,
        message: "Institute not found",
      });
    }

    // Create new faculty
    const newFaculty = await Faculty.create({
      name,
      email,
      phone,
      department,
      faculty,
      subjects: subjects || [],
      instituteId,
    });

    res.status(201).json({
      success: true,
      data: newFaculty,
    });
  } catch (err) {
    console.error("Error adding faculty:", err);

    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        error: err.message,
      });
    }

    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Faculty with this email already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to add faculty",
      error: err.message,
    });
  }
};

// Get faculty by institute
export const getFacultyByInstitute = async (req, res) => {
  try {
    const { instituteId } = req.params;

    // Check if institute exists
    const institute = await Institute.findById(instituteId);
    if (!institute) {
      return res.status(404).json({
        success: false,
        message: "Institute not found",
      });
    }

    // Find all faculty belonging to this institute
    const faculty = await Faculty.find({ instituteId });

    return res.status(200).json({
      success: true,
      data: faculty,
    });
  } catch (err) {
    console.error("Error fetching faculty:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch faculty",
      error: err.message,
    });
  }
};

// Add students in bulk
export const addStudentsBulk = async (req, res) => {
  try {
    const { students } = req.body;
    const { instituteId } = req.params;

    if (!students || !Array.isArray(students) || students.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No students provided",
      });
    }

    // Validate all students have required fields
    const invalidStudents = students.filter((s) => !s.name || !s.email);
    if (invalidStudents.length > 0) {
      return res.status(400).json({
        success: false,
        message: "All students must have name and email fields",
      });
    }

    // Add instituteId to each student
    const studentsWithInstitute = students.map((s) => ({
      ...s,
      instituteId,
      status: s.status || "active",
      joinDate: s.joinDate || new Date(),
      ecoPoints: s.ecoPoints || 0,
    }));

    // Save all students at once
    const savedStudents = await Student.insertMany(studentsWithInstitute, {
      ordered: false,
    });

    res.status(201).json({
      success: true,
      data: savedStudents,
      message: `Successfully added ${savedStudents.length} students`,
    });
  } catch (error) {
    console.error("Error adding students in bulk:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error in student data",
        error: error.message,
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Some students with duplicate emails or roll numbers were skipped",
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to save students",
      error: error.message,
    });
  }
};

// Get students by institute ID
export const getStudentsByInstituteId = async (req, res) => {
  const { instituteId } = req.params;

  const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
  if (!isValidObjectId(instituteId))
    return res.status(400).json({ message: "Invalid ID" });

  try {
    const students = await Student.find({ instituteId });

    return res.status(200).json({
      success: true,
      data: students,
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching students",
      error: error.message,
    });
  }
};

// Create challenge assignment
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
      sections = [],
    } = req.body;

    console.log("Received assignment data:", req.body);

    // Validate required fields
    const requiredFields = {
      challengeId,
      instituteId,
      assignedBy,
      assignedByRef,
      assignmentType,
      submissionDeadline,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Check if challenge exists
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: "Challenge not found",
      });
    }

    // Validate assigned students exist
    if (assignedStudents && assignedStudents.length > 0) {
      const existingStudents = await Student.find({
        _id: { $in: assignedStudents },
        instituteId: instituteId,
        status: "active",
      });

      if (existingStudents.length !== assignedStudents.length) {
        return res.status(400).json({
          success: false,
          message: "Some students not found or are inactive",
        });
      }
    }

    // Check for duplicate assignment
    const existingAssignment = await ChallengeAssignment.findOne({
      challengeId,
      instituteId,
      status: { $in: ["assigned", "in-progress"] },
    });

    if (existingAssignment) {
      return res.status(409).json({
        success: false,
        message:
          "This challenge is already assigned to students in your institute",
      });
    }

    // Build assignment data
    const assignmentData = {
      challengeId,
      instituteId,
      assignedBy: assignedBy,
      assignedByRef,
      assignmentType,
      submissionDeadline: new Date(submissionDeadline),
      instructions,
      facultyCoordinator,
      totalAssignedStudents: assignedStudents?.length || 0,
      assignedStudents: assignedStudents || [],
      status: "assigned",
      progress: 0,
      totalSubmissions: 0,
      approvedSubmissions: 0,
      pendingSubmissions: assignedStudents?.length || 0,
    };

    // Add type-specific data
    switch (assignmentType) {
      case "university":
        assignmentData.faculties = faculties;
        assignmentData.programs = programs;
        assignmentData.academicYears = academicYears;
        break;
      case "college":
        assignmentData.departments = departments;
        break;
      case "school":
        assignmentData.grades = grades;
        assignmentData.batches = batches;
        assignmentData.sections = sections;
        break;
    }

    console.log("Final assignment data:", assignmentData);

    // Create the challenge assignment
    const challengeAssignment = new ChallengeAssignment(assignmentData);
    const savedAssignment = await challengeAssignment.save();

    // Create individual student progress records
    if (assignedStudents && assignedStudents.length > 0) {
      const studentProgressRecords = assignedStudents.map((studentId) => ({
        challengeId,
        assignmentId: savedAssignment._id,
        studentId,
        instituteId,
        status: "assigned",
        progress: 0,
        pointsEarned: 0,
        ecoPoints: 0,
        assignedAt: new Date(),
      }));

      await StudentChallengeProgress.insertMany(studentProgressRecords);
    }

    // Populate the response
    const populatedAssignment = await ChallengeAssignment.findById(
      savedAssignment._id
    )
      .populate("challengeId", "title description category priority deadline")
      .populate(
        "assignedStudents",
        "name email rollNumber batch department grade"
      )
      .lean();

    res.status(201).json({
      success: true,
      message: "Challenge assigned successfully",
      data: populatedAssignment,
    });
  } catch (error) {
    console.error("Error creating challenge assignment:", error);

    // Enhanced error logging
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => ({
        field: err.path,
        message: err.message,
        value: err.value,
      }));
      console.log("Validation Errors Details:", errors);

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Assignment already exists for these students",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
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
        message: "Institute ID is required",
      });
    }

    const query = { instituteId };
    if (status && status !== "all") {
      query.status = status;
    }

    const assignments = await ChallengeAssignment.find(query)
      .populate(
        "challengeId",
        "title description category priority deadline requirements"
      )
      .populate("assignedStudents", "name email rollNumber batch")
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
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching institute assignments:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get assignment details with student progress
export const getAssignmentDetails = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const assignment = await ChallengeAssignment.findById(assignmentId)
      .populate(
        "challengeId",
        "title description category priority deadline requirements resources"
      )
      .populate(
        "assignedStudents",
        "name email rollNumber batch department grade section program semester faculty"
      )
      .lean();

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    // Get student progress for this assignment
    const studentProgress = await StudentChallengeProgress.find({
      assignmentId,
      instituteId: assignment.instituteId,
    })
      .populate("studentId", "name email rollNumber batch")
      .select("studentId status progress submittedAt pointsEarned ecoPoints")
      .lean();

    // Calculate progress statistics
    const progressStats = {
      total: assignment.totalAssignedStudents,
      assigned: studentProgress.filter((sp) => sp.status === "assigned").length,
      inProgress: studentProgress.filter((sp) => sp.status === "in-progress")
        .length,
      submitted: studentProgress.filter((sp) => sp.status === "submitted")
        .length,
      approved: studentProgress.filter((sp) => sp.status === "approved").length,
      rejected: studentProgress.filter((sp) => sp.status === "rejected").length,
    };

    // Calculate overall progress percentage
    const overallProgress =
      studentProgress.length > 0
        ? studentProgress.reduce((sum, sp) => sum + sp.progress, 0) /
        studentProgress.length
        : 0;

    res.status(200).json({
      success: true,
      data: {
        ...assignment,
        studentProgress,
        progressStats,
        overallProgress: Math.round(overallProgress),
      },
    });
  } catch (error) {
    console.error("Error fetching assignment details:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update assignment status
export const updateAssignmentStatus = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { status, instructions, facultyCoordinator } = req.body;

    if (
      !status ||
      !["assigned", "in-progress", "completed", "cancelled"].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Valid status is required: assigned, in-progress, completed, cancelled",
      });
    }

    const updateData = { status };
    if (instructions) updateData.instructions = instructions;
    if (facultyCoordinator) updateData.facultyCoordinator = facultyCoordinator;

    if (status === "in-progress") {
      updateData.startedAt = new Date();
    } else if (status === "completed") {
      updateData.completedAt = new Date();
    }

    const assignment = await ChallengeAssignment.findByIdAndUpdate(
      assignmentId,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("challengeId", "title description")
      .populate("assignedStudents", "name email");

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `Assignment ${status} successfully`,
      data: assignment,
    });
  } catch (error) {
    console.error("Error updating assignment status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
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
        message: "Assignment not found",
      });
    }

    // Check if there are any submissions
    const hasSubmissions = await StudentChallengeProgress.findOne({
      assignmentId,
      status: { $in: ["submitted", "approved", "rejected"] },
    });

    if (hasSubmissions) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete assignment that has student submissions",
      });
    }

    // Delete assignment and all student progress records
    await Promise.all([
      ChallengeAssignment.findByIdAndDelete(assignmentId),
      StudentChallengeProgress.deleteMany({ assignmentId }),
    ]);

    res.status(200).json({
      success: true,
      message: "Assignment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get assignment statistics for dashboard
export const getAssignmentStatistics = async (req, res) => {
  try {
    const { instituteId } = req.params;

    // Validate instituteId
    if (!mongoose.Types.ObjectId.isValid(instituteId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid institute ID",
      });
    }

    const stats = await ChallengeAssignment.aggregate([
      { $match: { instituteId: new mongoose.Types.ObjectId(instituteId) } },
      {
        $group: {
          _id: null,
          totalAssignments: { $sum: 1 },
          totalStudentsAssigned: { $sum: "$totalAssignedStudents" },
          assignmentsInProgress: {
            $sum: { $cond: [{ $eq: ["$status", "in-progress"] }, 1, 0] },
          },
          assignmentsCompleted: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          totalSubmissions: { $sum: "$totalSubmissions" },
          approvedSubmissions: { $sum: "$approvedSubmissions" },
          averageProgress: { $avg: "$progress" },
        },
      },
    ]);

    const studentProgressStats = await StudentChallengeProgress.aggregate([
      {
        $lookup: {
          from: "challengeassignments",
          localField: "assignmentId",
          foreignField: "_id",
          as: "assignment",
        },
      },
      { $unwind: "$assignment" },
      {
        $match: {
          "assignment.instituteId": new mongoose.Types.ObjectId(instituteId),
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const defaultStats = {
      totalAssignments: 0,
      totalStudentsAssigned: 0,
      assignmentsInProgress: 0,
      assignmentsCompleted: 0,
      totalSubmissions: 0,
      approvedSubmissions: 0,
      averageProgress: 0,
    };

    res.status(200).json({
      success: true,
      data: {
        assignmentStats: stats[0] || defaultStats,
        studentProgress: studentProgressStats,
      },
    });
  } catch (error) {
    console.error("Error fetching assignment statistics:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update student
export const updateStudent = async (req, res) => {
  try {
    const { instituteId, studentId } = req.params;
    const updateData = req.body;

    // Validate IDs
    if (
      !mongoose.Types.ObjectId.isValid(instituteId) ||
      !mongoose.Types.ObjectId.isValid(studentId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid institute ID or student ID",
      });
    }

    // Check if student exists and belongs to institute
    const student = await Student.findOne({ _id: studentId, instituteId });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found in this institute",
      });
    }

    // Update student
    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Student updated successfully",
      data: updatedStudent,
    });
  } catch (error) {
    console.error("Error updating student:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        error: error.message,
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Student with this email or roll number already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update student",
      error: error.message,
    });
  }
};

// Delete student
export const deleteStudent = async (req, res) => {
  try {
    const { instituteId, studentId } = req.params;

    // Validate IDs
    if (
      !mongoose.Types.ObjectId.isValid(instituteId) ||
      !mongoose.Types.ObjectId.isValid(studentId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid institute ID or student ID",
      });
    }

    // Check if student exists and belongs to institute
    const student = await Student.findOne({ _id: studentId, instituteId });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found in this institute",
      });
    }

    // Check if student has any challenge progress
    const hasProgress = await StudentChallengeProgress.findOne({ studentId });
    if (hasProgress) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete student with existing challenge progress",
      });
    }

    // Delete student
    await Student.findByIdAndDelete(studentId);

    res.status(200).json({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete student",
      error: error.message,
    });
  }
};

// Get institute events (Plant Drives)
export const getInstituteEvents = async (req, res) => {
  try {
    const { instituteId } = req.params;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(instituteId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid institute ID format",
      });
    }

    const events = await Event.find({ instituteId })
      .sort({ date: 1 });

    res.status(200).json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error("Error fetching institute events:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching events",
      error: error.message
    });
  }
};



// Accept a government planting drive
export const acceptPlantingDrive = async (req, res) => {
  try {
    const { targetId, treesAccepted } = req.body;
    const instituteId = req.user._id || req.user.id;

    // Find the target
    const target = await PlantingTarget.findById(targetId);
    if (!target) {
      return res.status(404).json({
        success: false,
        message: "Planting target not found"
      });
    }

    // Check if institute already accepted
    const alreadyAccepted = target.acceptedBy.find(
      entry => entry.instituteId.toString() === instituteId.toString()
    );

    if (alreadyAccepted) {
      return res.status(400).json({
        success: false,
        message: "You have already accepted this drive"
      });
    }

    // Get institute name for the record
    const institute = await Institute.findById(instituteId);

    // Add to acceptedBy
    target.acceptedBy.push({
      instituteId,
      instituteName: institute.name,
      treesAccepted: Number(treesAccepted),
      acceptedAt: new Date()
    });

    await target.save();

    res.status(200).json({
      success: true,
      message: "Drive accepted successfully",
      data: target
    });

  } catch (error) {
    console.error("Error in acceptPlantingDrive:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// Create an event from an accepted drive (or independent)
export const createInstituteEvent = async (req, res) => {
  try {
    const {
      targetId,
      eventTitle,
      description,
      date,
      venue,
      treesAccepted,
      expectedParticipants
    } = req.body;

    const instituteId = req.user._id || req.user.id;
    const institute = await Institute.findById(instituteId);

    if (!institute) {
      return res.status(404).json({ success: false, message: 'Institute not found' });
    }

    // Create the event
    // Note: status is pending until an NGO accepts/is assigned
    const newEvent = new Event({
      title: eventTitle,
      description,
      date,
      venue,
      instituteId,
      instituteName: institute.name,
      createdBy: req.user._id || req.user.id,
      createdByName: req.user.name || institute.name,

      // Link to target if provided
      targetId: targetId || null,
      plannedTrees: treesAccepted ? Number(treesAccepted) : 0,

      // Default type
      eventType: 'tree-planting',
      status: 'pending', // Waiting for NGO

      itemsRequested: "Trees and support for plantation", // Default

      // These are optional now, so we can omit them
      // ngoId: null, 
      // ngoName: null
    });

    const savedEvent = await newEvent.save();

    res.status(201).json({
      success: true,
      message: "Event created successfully. Waiting for NGO assignment.",
      data: savedEvent
    });

  } catch (error) {
    console.error("Error in createInstituteEvent:", error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({
      success: false,
      message: "Server error creating event",
      error: error.message
    });
  }
};

export default {
  getInstituteById,
  addStudent,
  addFaculty,
  getFacultyByInstitute,
  addStudentsBulk,
  getStudentsByInstituteId,
  createChallengeAssignment,
  getInstituteAssignments,
  getAssignmentDetails,
  updateAssignmentStatus,
  deleteAssignment,
  getAssignmentStatistics,
  updateStudent,
  deleteStudent,
  getInstituteEvents,
  acceptPlantingDrive,
  createInstituteEvent,
};
