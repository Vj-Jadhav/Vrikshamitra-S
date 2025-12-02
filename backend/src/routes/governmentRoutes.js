import express from "express";
import { getAllInstitutes, 
         approveInstitute, 
         rejectInstitute,
         getInstituteById, 
        } from "../controllers/governmentController.js";

const router = express.Router();


//gov-dashboard
router.get("/", getAllInstitutes);
router.put("/:id/approve", approveInstitute);
router.put("/:id/reject", rejectInstitute);
router.get("/:id", getInstituteById);


export default router;

