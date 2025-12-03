/** @format */

import express from "express";
import { getAllModules, addModule } from "../controllers/learningModule.js";

const router = express.Router();

router.get("/", getAllModules);
router.post("/add", addModule);

export default router;
