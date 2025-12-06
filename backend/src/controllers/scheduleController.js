// controllers/schedule.controller.js
import CleanupSchedule from '../models/CleanupSchedule.js';
import Report from '../models/Report.js';
import jwt from 'jsonwebtoken';

// @desc    Schedule a cleanup
// @route   POST /api/schedules
// @access  Private (requires token)
export const scheduleCleanup = async (req, res) => {
  try {
    const { reportId, scheduledDate, scheduledTime, notes, participantCount = 1 } = req.body;

    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token required'
      });
    }

    let decoded;
    try {
      // Verify token
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Get user info from token
    // Get user info from token

    const userId = decoded.id;
    let userType = decoded.role || 'Guest';

// Format role to match Schema enum exactly
userType = userType.charAt(0).toUpperCase() + userType.slice(1).toLowerCase();
    // Validate required fields
    if (!reportId || !scheduledDate || !scheduledTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide reportId, scheduledDate, and scheduledTime'
      });
    }

    // Check if report exists
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // // Check if report is already resolved
    if (report.status === 'resolved') {
      return res.status(400).json({
        success: false,
        message: 'This report has already been resolved'
      });
    }

    // Validate date
    const scheduleDate = new Date(scheduledDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Set to start of today

    // Check if date is in the past
    if (scheduleDate < now) {
      return res.status(400).json({
        success: false,
        message: 'Cannot schedule cleanup in the past'
      });
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(scheduledTime)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid time format. Use HH:MM format (24-hour)'
      });
    }

    // Validate participant count
    const count = parseInt(participantCount) || 1;
    if (count < 1 || count > 50) {
      return res.status(400).json({
        success: false,
        message: 'Participant count must be between 1 and 50'
      });
    }

    // Create cleanup schedule
    const schedule = new CleanupSchedule({
      report: reportId,
      scheduledBy: {
        userType: userType,
        userId: userId
      },
      scheduledDate: scheduleDate,
      scheduledTime,
      participantCount: count,
      notes: notes?.trim() || '',
      status: 'scheduled'
    });

    await schedule.save();

    // Populate response
    const populatedSchedule = await CleanupSchedule.findById(schedule._id)
      .populate('report', 'description location address category severity status')
      .populate('scheduledBy.userId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Cleanup scheduled successfully',
      data: populatedSchedule
    });
  } catch (error) {
    console.error('Error scheduling cleanup:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error scheduling cleanup',
      error: error.message
    });
  }
};

// @desc    Get cleanup schedule counts by date
// @route   GET /api/schedules/counts
// @access  Public
export const getScheduleCounts = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Set default date range (next 7 days)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const defaultEndDate = new Date(today);
    defaultEndDate.setDate(defaultEndDate.getDate() + 7);

    const start = startDate ? new Date(startDate) : today;
    start.setHours(0, 0, 0, 0);

    const end = endDate ? new Date(endDate) : defaultEndDate;
    end.setHours(23, 59, 59, 999);

    // Aggregate schedule counts by date
    const counts = await CleanupSchedule.aggregate([
      {
        $match: {
          scheduledDate: {
            $gte: start,
            $lte: end
          },
          status: { $in: ['scheduled', 'in_progress'] }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$scheduledDate"
            }
          },
          totalParticipants: { $sum: "$participantCount" },
          scheduleCount: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Convert array to object format
    const countsMap = {};
    counts.forEach(item => {
      countsMap[item._id] = item.totalParticipants;
    });

    // Add missing dates with 0 counts
    const currentDate = new Date(start);
    while (currentDate <= end) {
      const dateStr = currentDate.toISOString().split('T')[0];
      if (!countsMap[dateStr]) {
        countsMap[dateStr] = 0;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.json({
      success: true,
      data: countsMap
    });
  } catch (error) {
    console.error('Error fetching schedule counts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching schedule counts',
      error: error.message
    });
  }
};

// @desc    Get user's schedules
// @route   GET /api/schedules/my-schedules
// @access  Private
export const getMySchedules = async (req, res) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token required'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    const userId = decoded.id;

    const schedules = await CleanupSchedule.find({
      'scheduledBy.userId': userId
    })
      .populate('report', 'description location address category severity imageUrl')
      .sort({ scheduledDate: -1, createdAt: -1 });

    res.json({
      success: true,
      data: schedules
    });
  } catch (error) {
    console.error('Error fetching user schedules:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching schedules',
      error: error.message
    });
  }
};

// @desc    Get all cleanup schedules (admin only)
// @route   GET /api/schedules
// @access  Private (Admin only)
export const getAllSchedules = async (req, res) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token required'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Check if user is admin
    if (decoded.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const {
      date,
      status,
      page = 1,
      limit = 20
    } = req.query;

    const query = {};

    if (date) {
      const searchDate = new Date(date);
      searchDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);

      query.scheduledDate = {
        $gte: searchDate,
        $lt: nextDay
      };
    }

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const schedules = await CleanupSchedule.find(query)
      .populate('report', 'description location address category severity imageUrl')
      .populate('scheduledBy.userId', 'name email')
      .sort({ scheduledDate: 1, scheduledTime: 1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await CleanupSchedule.countDocuments(query);

    res.json({
      success: true,
      data: schedules,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching schedules',
      error: error.message
    });
  }
};

// @desc    Cancel a schedule
// @route   PUT /api/schedules/:id/cancel
// @access  Private
export const cancelSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token required'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    const userId = decoded.id;

    const schedule = await CleanupSchedule.findById(id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    // Check if user owns the schedule or is admin
    if (schedule.scheduledBy.userId.toString() !== userId && decoded.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this schedule'
      });
    }

    // Check if schedule can be cancelled
    if (schedule.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a completed schedule'
      });
    }

    schedule.status = 'cancelled';
    await schedule.save();

    // Update report status back to pending
    await Report.findByIdAndUpdate(schedule.report, {
      status: 'pending',
      updatedAt: new Date()
    });

    res.json({
      success: true,
      message: 'Schedule cancelled successfully',
      data: schedule
    });
  } catch (error) {
    console.error('Error cancelling schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling schedule',
      error: error.message
    });
  }
};