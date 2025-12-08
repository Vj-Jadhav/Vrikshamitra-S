import mongoose from "mongoose";

const rewardRedemptionSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true,
        },
        rewardId: {
            type: Number,
            required: true,
        },
        rewardName: {
            type: String,
            required: true,
        },
        pointsUsed: {
            type: Number,
            required: true,
        },
        couponCode: {
            type: String,
            required: true,
        },
        product: {
            type: String,
            required: true,
        },
        originalPrice: {
            type: Number,
            required: true,
        },
        discountedPrice: {
            type: Number,
            required: true,
        },
        redeemedAt: {
            type: Date,
            default: Date.now,
        },
        status: {
            type: String,
            enum: ["pending", "completed", "expired", "cancelled"],
            default: "pending",
        },
    },
    { timestamps: true }
);

const RewardRedemption = mongoose.model(
    "RewardRedemption",
    rewardRedemptionSchema
);

export default RewardRedemption;
