// routes/reportRoutes.js
import express from "express";
import multer from "multer";
import { createReport, getReports, getReport, getStats } from "../controllers/reportController.js";

// const { protect, authorize } = require('../middleware/auth'); // If you add auth later

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload only images.'), false);
    }
  }
});

// Public routes
router.post('/', upload.single('image'),createReport);
router.get('/', getReports);
router.get('/:id', getReport);
router.get('/stats', getStats);

// Protected routes (add these middleware when you implement auth)
// router.put('/:id/status', protect, authorize('admin', 'collector'), reportController.updateReportStatus);
// router.delete('/:id', protect, authorize('admin'), reportController.deleteReport);

export default router;