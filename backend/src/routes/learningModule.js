/** @format */

import express from "express";
import { getAllModules } from "../controllers/learningModule.js";

const router = express.Router();

router.get("/", getAllModules);

export default router;
