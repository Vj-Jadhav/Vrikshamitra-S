// plantingTargets.js
import mongoose from "mongoose";

const plantingTargetSchema = new mongoose.Schema({
  city: { type: String, required: true },
  location: { type: String, required: true },
  requiredPlants: { type: Number, required: true },
  deadline: { type: String, required: true },
  pincode: { type: String },
  addedBy: { type: String, default: "Government" },
  acceptedBy: [{
    instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute' },
    instituteName: String,
    treesAccepted: Number,
    acceptedAt: { type: Date, default: Date.now }
  }]
});

export default mongoose.model("PlantingTarget", plantingTargetSchema);