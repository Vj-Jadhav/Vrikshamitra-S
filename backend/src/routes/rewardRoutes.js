/** @format */

import express from "express";
import {
  redeemReward,
  getRedemptionHistory,
} from "../controllers/rewardController.js";

const router = express.Router();

router.post("/redeem", redeemReward);
router.get("/history/:studentId", getRedemptionHistory);

export default router;
