/** @format */

import express from "express";
import {
  getAllModules,
  addModule,
  getModuleById,
  updateModule,
  deleteModule,
} from "../controllers/learningModule.js";

const router = express.Router();

router.get("/", getAllModules);
router.post("/add", addModule);
router.get("/:id", getModuleById);
router.put("/:id", updateModule);
router.delete("/:id", deleteModule);

export default router;
