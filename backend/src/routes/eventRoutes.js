import express from "express";
import { bulkRegister } from "../controllers/eventController.js";
import upload from "../middleware/uploadMiddleware.js"; // Reuse existing upload middleware if possible, else create localized multer
// If existing upload middleware is not suitable for CSV, we'll import multer directly here.

// Checking if uploadMiddleware exists or using multer directly
import multer from "multer";


const uploadCsv = multer({ dest: "uploads/" });

const router = express.Router();

router.post("/:eventId/bulk-register", uploadCsv.single("file"), bulkRegister);

export default router;
