// controllers/reportController.js
import Report from "../models/Report.js";
import cloudinaryUtils from "../utils/cloudinary.js";

const { uploadToCloudinary, deleteFromCloudinary } = cloudinaryUtils;

// @desc    Create a new garbage report
// @route   POST /api/reports
// @access  Public/Private
import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // You need a User model
import Student from "../models/Student.js";

export const createReport = async (req, res) => {
  try {
    const { 
      description, 
      latitude, 
      longitude, 
      address, 
      accuracy, 
      category, 
      severity,
      tags,
      userId // From frontend (optional, for guest users)
    } = req.body;
    console.log("Received userId:", userId);
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image'
      });
    }

    // Validate required fields
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Location coordinates are required'
      });
    }

    // Validate category
    const validCategories = ['plastic', 'organic', 'electronic', 'hazardous', 'construction', 'other'];
    const selectedCategory = category || 'plastic';
    if (!validCategories.includes(selectedCategory)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${validCategories.join(', ')}`
      });
    }

    // Validate severity
    const validSeverities = ['low', 'medium', 'high', 'critical'];
    const selectedSeverity = severity || 'medium';
    if (!validSeverities.includes(selectedSeverity)) {
      return res.status(400).json({
        success: false,
        message: `Invalid severity. Must be one of: ${validSeverities.join(', ')}`
      });
    }

    // Upload image to Cloudinary
    const uploadResult = await uploadToCloudinary(req.file.buffer, {
      transformation: [
        { width: 1200, height: 800, crop: 'limit' },
        { quality: 'auto:good' }
      ]
    });

    // Parse tags from frontend
    let parsedTags = [];
    if (tags) {
      if (Array.isArray(tags)) {
        parsedTags = tags;
      } else if (typeof tags === 'string') {
        try {
          parsedTags = JSON.parse(tags);
        } catch (error) {
          console.log('Error parsing tags:', error);
          // Fallback: extract words from description
          if (description) {
            parsedTags = description.toLowerCase().match(/\b\w+\b/g) || [];
          }
        }
      }
    }

    // If no tags provided, extract from description
    if (parsedTags.length === 0 && description) {
      parsedTags = description.toLowerCase().match(/\b\w+\b/g) || [];
    }

    // Add location-based tags automatically
    if (address) {
      const addressLower = address.toLowerCase();
      if (addressLower.includes('park') || addressLower.includes('garden')) {
        parsedTags.push('public-park');
      }
      if (addressLower.includes('road') || addressLower.includes('street') || addressLower.includes('highway')) {
        parsedTags.push('roadside');
      }
      if (addressLower.includes('river') || addressLower.includes('lake') || addressLower.includes('pond') || addressLower.includes('beach')) {
        parsedTags.push('water-body');
      }
      if (addressLower.includes('residential') || addressLower.includes('colony') || addressLower.includes('society')) {
        parsedTags.push('residential');
      }
    }

    // Add category-based tags
    if (selectedCategory === 'plastic') parsedTags.push('recyclable');
    if (selectedCategory === 'organic') parsedTags.push('odorous', 'animal-attraction');
    if (selectedCategory === 'hazardous') parsedTags.push('dangerous');

    // Remove duplicates and limit to 10 tags
    parsedTags = [...new Set(parsedTags)];
    parsedTags = parsedTags.slice(0, 10);

    // Handle user identification (No JWT - just userId from frontend)
    let reportedBy = {
      userType: 'Guest',
      userId: null
    };

    // If userId is provided and not 'guest', try to find the user
    if (userId && userId !== 'guest') {
      try {
        const user = await Student.findById(userId);
                if (user) {
            reportedBy = {
            userType: "Student",
            userId: user._id
            };
        } else {
            user = await Faculty.findById(userId);

            if (user) {
            reportedBy = {
                userType: "Faculty",
                userId: user._id
            };
            }
        }

      } catch (error) {
        console.log('User lookup error:', error.message);
        // Continue with guest user if lookup fails
      }
    }

    // Create report with schema-compatible data
    const report = await Report.create({
      imageUrl: uploadResult.secure_url,
      cloudinaryId: uploadResult.public_id,
      description: description || 'No description provided',
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      },
      address: address || 'Address not available',
      accuracy: accuracy ? parseFloat(accuracy) : null,
      category: selectedCategory,
      severity: selectedSeverity,
      tags: parsedTags,
      status: 'pending',
      reportedBy: reportedBy,
      // No 'user' field - using reportedBy.userId instead
      assignedTo: null, // Initially not assigned
      resolvedAt: null
    });

    // Create clean response data
    const responseData = {
      _id: report._id,
      imageUrl: report.imageUrl,
      description: report.description,
      location: report.location,
      address: report.address,
      category: report.category,
      severity: report.severity,
      tags: report.tags,
      status: report.status,
      reportedBy: report.reportedBy,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt
    };

    res.status(201).json({
      success: true,
      data: responseData,
      message: 'Report submitted successfully'
    });

  } catch (error) {
    console.error('Error creating report:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate entry detected'
      });
    }

    // Handle Cloudinary errors
    if (error.message && error.message.includes('Cloudinary')) {
      return res.status(500).json({
        success: false,
        message: 'Failed to upload image to storage'
      });
    }

    // Generic server error
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};


// @desc    Get all reports with filtering and pagination
// @route   GET /api/reports
// @access  Public/Private
export const getReports = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      severity,
      userId,
      dateFrom,
      dateTo,
      lat,
      lng,
      radius = 5000 // meters
    } = req.query;

    // Build query
    let query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (severity) query.severity = severity;
    if (userId) query.user = userId;

    // Date range filter
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    // Location-based filtering
    if (lat && lng) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius)
        }
      };
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const reports = await Report.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('user', 'name email')
      .populate('assignedTo', 'name email');

    const total = await Report.countDocuments(query);

    res.json({
      success: true,
      data: reports,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error('Error getting reports:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single report
// @route   GET /api/reports/:id
// @access  Public/Private
export const getReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('user', 'name email')
      .populate('assignedTo', 'name email');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.json({
      success: true,
      data: report
    });

  } catch (error) {
    console.error('Error getting report:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update report status
// @route   PUT /api/reports/:id/status
// @access  Private/Admin
export const updateReportStatus = async (req, res) => {
  try {
    const { status, assignedTo, resolutionNotes } = req.body;

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Update status
    report.status = status || report.status;
    
    // If status is resolved, set resolvedAt
    if (status === 'resolved') {
      report.resolvedAt = new Date();
    }

    if (assignedTo) {
      report.assignedTo = assignedTo;
    }

    if (resolutionNotes) {
      report.resolutionNotes = resolutionNotes;
    }

    report.updatedAt = new Date();
    await report.save();

    res.json({
      success: true,
      data: report,
      message: 'Report status updated successfully'
    });

  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete report
// @route   DELETE /api/reports/:id
// @access  Private/Admin
export const deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Delete image from Cloudinary
    await deleteFromCloudinary(report.cloudinaryId);

    // Delete from database
    await report.deleteOne();

    res.json({
      success: true,
      message: 'Report deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get statistics
// @route   GET /api/reports/stats
// @access  Public/Private
export const getStats = async (req, res) => {
  try {
    const totalReports = await Report.countDocuments();
    const pendingReports = await Report.countDocuments({ status: 'pending' });
    const resolvedReports = await Report.countDocuments({ status: 'resolved' });
    
    const reportsByCategory = await Report.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const reportsBySeverity = await Report.aggregate([
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);

    const recentActivity = await Report.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('description status createdAt');

    res.json({
      success: true,
      data: {
        totalReports,
        pendingReports,
        resolvedReports,
        reportsByCategory,
        reportsBySeverity,
        recentActivity
      }
    });

  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};