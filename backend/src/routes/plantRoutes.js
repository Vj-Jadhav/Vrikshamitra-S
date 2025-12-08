import express from "express";
import { addPlant, getStudentPlants, updatePlantStatus, uploadPlantPhoto } from "../controllers/plantController.js";
import upload from "../middleware/uploadMiddleware.js";
// import { protect } from "../middleware/authMiddleware.js"; // If needed

const router = express.Router();

router.post("/add", addPlant);
router.get("/student/:studentId", getStudentPlants);
router.put("/update/:plantId", updatePlantStatus);
router.post("/upload/:plantId", upload.single("file"), uploadPlantPhoto);

export default router;
