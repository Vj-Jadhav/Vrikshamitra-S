/** @format */

import mongoose from "mongoose";
import StudentChallengeProgress from "../models/StudentChallengeProgress.js";
import RewardRedemption from "../models/RewardRedemption.js"; // You'll need to create this model



// Redeem reward endpoint
export const redeemReward = async (req, res) => {
  try {
    const {
      studentId,
      rewardId,
      rewardName,
      pointsUsed,
      couponCode,
      product,
      originalPrice,
      discountedPrice,
    } = req.body;

    // Check if student has enough eco-points
    const progressRecords = await StudentChallengeProgress.find({
      studentId: mongoose.Types.ObjectId(studentId),
      status: "approved",
    });

    const totalEcoPoints = progressRecords.reduce(
      (sum, record) => sum + (record.ecoPoints || 0),
      0
    );

    if (totalEcoPoints < pointsUsed) {
      return res.status(400).json({
        success: false,
        message: "Insufficient eco-points",
      });
    }

    // Create a redemption record
    const redemption = new RewardRedemption({
      studentId: mongoose.Types.ObjectId(studentId),
      rewardId,
      rewardName,
      pointsUsed,
      couponCode,
      product,
      originalPrice,
      discountedPrice,
    });

    await redemption.save();

    // Deduct points by creating a negative entry in StudentChallengeProgress
    const deductionRecord = new StudentChallengeProgress({
      studentId: mongoose.Types.ObjectId(studentId),
      challengeId: new mongoose.Types.ObjectId(), // Special ID for redemptions
      assignmentId: new mongoose.Types.ObjectId(), // Generate a new ID
      instituteId: req.user.instituteId, // From auth middleware
      status: "approved",
      progress: 100,
      pointsEarned: 0,
      ecoPoints: -pointsUsed, // Negative points for redemption
      submission: {
        description: `Redeemed ${rewardName} - ${product} with coupon ${couponCode}`,
        submittedAt: new Date(),
      },
      completedAt: new Date(),
    });

    await deductionRecord.save();

    res.json({
      success: true,
      message: "Reward redeemed successfully",
      couponCode,
      remainingPoints: totalEcoPoints - pointsUsed,
    });
  } catch (error) {
    console.error("Error redeeming reward:", error);
    res.status(500).json({
      success: false,
      message: "Server error while redeeming reward",
    });
  }
};

// Get redemption history
export const getRedemptionHistory = async (req, res) => {
  try {
    const { studentId } = req.params;

    const redemptions = await RewardRedemption.find({
      studentId: mongoose.Types.ObjectId(studentId),
    }).sort({ redeemedAt: -1 });

    res.json({
      success: true,
      redemptions,
    });
  } catch (error) {
    console.error("Error fetching redemption history:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching redemption history",
    });
  }
};
