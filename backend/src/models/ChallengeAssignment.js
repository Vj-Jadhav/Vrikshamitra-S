import mongoose from "mongoose";

const challengeAssignmentSchema = new mongoose.Schema({
  challengeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Challenge",
    required: true
  },

  instituteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Institute",
    required: true
  },

  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "assignedByRef"
  },
  assignedByRef: {
    type: String,
    enum: ["Admin", "Faculty", "Institute"]
  },

  launchStatus: {
    type: String,
    enum: ["draft", "launched", "closed"],
    default: "launched"
  },

  instructions: String,
  targetStudents: [String], // class, batch, dept
}, { timestamps: true });

export default mongoose.model("ChallengeAssignment", challengeAssignmentSchema);
