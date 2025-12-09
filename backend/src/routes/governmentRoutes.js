import express from "express";
import {
    getAllInstitutes,
    approveInstitute,
    rejectInstitute,
    getInstituteById,
    getPendingNGOs,
    approveNGO,
    rejectNGO,
    getAllPlantingRequests
} from "../controllers/governmentController.js";

const router = express.Router();

//gov-dashboard
router.get("/", getAllInstitutes);
router.get("/requests", getAllPlantingRequests); // New route
router.put("/:id/approve", approveInstitute);
router.put("/:id/reject", rejectInstitute);

// NGO Management
router.get("/ngos/pending", getPendingNGOs);
router.put("/ngos/:id/approve", approveNGO);
router.put("/ngos/:id/reject", rejectNGO);

router.get("/:id", getInstituteById);

export default router;
