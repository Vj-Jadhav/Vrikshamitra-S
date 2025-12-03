// routes/schedule.routes.js
import express from 'express';
import {
  scheduleCleanup,
  getScheduleCounts,
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

// Public routes (no authentication required)
router.post('/', scheduleCleanup); // Schedule cleanup
router.get('/counts', getScheduleCounts); // Get counts by date
// router.get('/', getSchedules); // Get all schedules
// router.get('/today', getTodaySchedules); // Get today's schedules
// router.get('/upcoming', getUpcomingSchedules); // Get upcoming schedules
// router.get('/report/:reportId', getSchedulesByReport); // Get schedules for specific report
// router.get('/:id', getScheduleById); // Get schedule by ID
// router.put('/:id/status', updateScheduleStatus); // Update schedule status

export default router;