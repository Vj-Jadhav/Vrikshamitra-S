import mongoose from "mongoose";

const facultySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true },
    password: {
    type: String,
    default: null // Will be set by student during first login
  },
  phone: { type: String },
  // For University: faculty -> department -> teacher
  // For College: department -> teacher  
  // For School: teacher only
  faculty: { type: String }, // Only for University type
  department: { type: String, required: true },
  subjects: [String],
  joinDate: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["active", "inactive", "on leave"],
    default: "active"
  },
  instituteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Institute",
    required: true
  }
}, { timestamps: true });

export default mongoose.model("Faculty", facultySchema);