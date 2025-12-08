// routes/reportRoutes.js
import express from "express";
import multer from "multer";
import { createReport, getReports, getReport, getStats, getMyReports, submitCleanup, approveCleanup, rejectCleanup } from "../controllers/reportController.js";
import { protect } from "../middlewares/auth.js";

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
router.post('/', upload.single('image'), createReport);
router.get('/', getReports);
router.get('/stats', getStats);

// Protected routes
router.get('/my-reports', protect, getMyReports); // Must be before /:id
router.post('/:id/cleanup', protect, upload.single('image'), submitCleanup);
router.post('/:id/cleanup/:submissionId/approve', protect, approveCleanup);
router.post('/:id/cleanup/:submissionId/reject', protect, rejectCleanup);

router.get('/:id', getReport);

// Protected routes (add these middleware when you implement auth)
// router.put('/:id/status', protect, authorize('admin', 'collector'), reportController.updateReportStatus);
// router.delete('/:id', protect, authorize('admin'), reportController.deleteReport);

export default router;