import mongoose from "mongoose";

const plantSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    species: {
        type: String,
        required: true,
    },
    plantedDate: {
        type: Date,
        default: Date.now,
    },
    health: {
        type: String,
        enum: ["Excellent", "Good", "Needs Care", "Dead"],
        default: "Good",
    },
    photos: [
        {
            url: { type: String, required: true },
            date: { type: Date, default: Date.now },
        },
    ],
    progress: {
        type: Number,
        default: 0, // 0 to 1
    }
}, { timestamps: true });

const Plant = mongoose.model("Plant", plantSchema);
export default Plant;
