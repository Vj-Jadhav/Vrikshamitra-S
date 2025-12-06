// routes/schedule.routes.js
import express from 'express';
import {
  scheduleCleanup,
  getScheduleCounts,
  getMySchedules,
  cancelSchedule
} from '../controllers/scheduleController.js';

// import {
//     getSchedules,
//   getScheduleById,
//  getSchedulesByReport,
//  getUpcomingSchedules,
// getTodaySchedules
//updateScheduleStatus 
// } from '../controllers/scheduleController.js';


const router = express.Router();

// Public routes 
// Note: scheduleCleanup and getMySchedules handle token verification internally
router.post('/', scheduleCleanup); // Schedule cleanup
router.get('/counts', getScheduleCounts); // Get counts by date
// router.get('/', getSchedules); // Get all schedules
// router.get('/today', getTodaySchedules); // Get today's schedules
// router.get('/upcoming', getUpcomingSchedules); // Get upcoming schedules
// router.get('/report/:reportId', getSchedulesByReport); // Get schedules for specific report
// router.get('/:id', getScheduleById); // Get schedule by ID
// router.put('/:id/status', updateScheduleStatus); // Update schedule status
router.get('/user-schedules', getMySchedules); // Get user schedules
router.put('/:id/cancel', cancelSchedule); // Cancel schedule

export default router;