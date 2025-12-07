import Submission from "../models/Submission.js";
import Faculty from "../models/Faculty.js";
import ChallengeAssignment from "../models/ChallengeAssignment.js";
import Student from "../models/Student.js";
import StudentChallengeProgress from "../models/StudentChallengeProgress.js";

export const submitProof = async (req, res) => {
  try {
    const {
      challengeId,
      studentId,
      studentName,
      studentEmail,
      challengeTitle,
      points,
      imageDimensions,
    } = req.body;

    // Validate input
    if (!challengeId || !studentId || !req.file) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields or file",
      });
    }

    console.log(`[DEBUG] Submission Received:`);

    // Check duplicate submission
    const existingSubmission = await Submission.findOne({
      challengeId,
      studentId,
      status: { $in: ["pending", "approved"] }
    });

    if (existingSubmission) {
      return res.status(409).json({
        success: false,
        message: "You have already submitted proof for this challenge.",
      });
    }

    // Prepare file paths
    const localFilePath = req.file.path;
    const imageUrl = `/uploads/submissions/${req.file.filename}`;

    console.log(`[DEBUG] Checking faculty mapping for student & challenge`);

    /**
     * STEP 1: Verify assignment → find assigned faculty
     */
    const assignment = await ChallengeAssignment.findOne({
      challengeId,
      assignedStudents: { $in: [studentId] }
    });

    let finalFacultyId = null;
    let finalFacultyName = null;

    /**
     * Step 2: If assignment exists → fetch faculty info
     */
    if (assignment && assignment.facultyCoordinator) {
      console.log("[DEBUG] Assignment found. Fetching faculty coordinator...");

      const facultyDoc = await Faculty.findById(assignment.facultyCoordinator);

      if (facultyDoc) {
        finalFacultyId = facultyDoc._id;
        finalFacultyName = facultyDoc.name;
      }
    }

    /**
     * Step 3: If faculty STILL not found → abort
     */
    if (!finalFacultyId) {
      console.log("[ERROR] No valid faculty found while submitting proof.");
      return res.status(400).json({
        success: false,
        message: "No faculty assigned for this student and challenge!",
      });
    }

    console.log(`[DEBUG] Final Faculty => ${finalFacultyName} (${finalFacultyId})`);

    /**
     * Save submission
     */
    const submission = new Submission({
      challengeId,
      studentId,
      studentName,
      studentEmail,
      challengeTitle,
      facultyId: finalFacultyId,
      facultyName: finalFacultyName,
      points,
      localFilePath,
      imageUrl,
      imageSize: req.file.size,
      imageFormat: req.file.mimetype,
      imageDimensions: imageDimensions ? JSON.parse(imageDimensions) : {},
      status: "pending",
      uploadedAt: new Date(),
    });

    await submission.save();

    // UPDATE PROGRESS IF EXISTS
    await StudentChallengeProgress.findOneAndUpdate(
      { challengeId, studentId },
      {
        status: 'submitted',
        submittedAt: new Date(),
        'submission.description': 'Proof submitted via mobile app', // Placeholder
        'submission.submittedAt': new Date()
      }
    );

    return res.status(201).json({
      success: true,
      message: "Proof submitted successfully for review.",
      submission,
    });

  } catch (error) {
    console.error("[Submit Proof Error]:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit proof.",
      error: error.message,
    });
  }
};

// Check status of a specific submission (Public/Student)
export const getSubmissionStatus = async (req, res) => {
  try {
    const { studentId, challengeId } = req.query;

    if (!studentId || !challengeId) {
      return res.status(400).json({ success: false, message: "Missing studentId or challengeId" });
    }

    const submission = await Submission.findOne({ studentId, challengeId });

    if (!submission) {
      return res.json({ success: true, status: "not_submitted", message: "No submission found" });
    }

    return res.json({
      success: true,
      status: submission.status,
      submission,
    });

  } catch (error) {
    console.error("Error getting submission status:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get all submissions for a faculty member
export const getAllSubmissions = async (req, res) => {
  try {
    console.log("📥 [getAllSubmissions] Request received");

    // req.user is set by auth middleware, verify it exists
    if (!req.user || !req.user._id) {
      console.warn("⚠️ [getAllSubmissions] User not authenticated or missing ID");
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const facultyId = req.user._id;
    console.log(`🔎 [getAllSubmissions] Fetching submissions for faculty: ${facultyId}`);

    const submissions = await Submission.find({ facultyId }).sort({ uploadedAt: -1 });

    console.log(`✅ [getAllSubmissions] Found ${submissions.length} submissions`);

    return res.json({ success: true, count: submissions.length, submissions });
  } catch (error) {
    console.error("❌ [getAllSubmissions] Error fetching submissions:", error);
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// Approve a submission
export const approveSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;

    console.log(`[approveSubmission] Processing approval for submission: ${id}`);

    const submission = await Submission.findById(id);

    if (!submission) {
      return res.status(404).json({ success: false, message: "Submission not found" });
    }

    // Authorization check
    if (submission.facultyId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to approve this submission" });
    }

    if (submission.status === 'approved') {
      return res.json({ success: true, message: "Submission is already approved", submission });
    }

    const pointsToAward = submission.points || 0;

    // 1. Update Submission
    submission.status = "approved";
    submission.reviewedAt = new Date();
    submission.feedback = feedback || submission.feedback;
    submission.pointsAwarded = pointsToAward;
    await submission.save();

    // 2. Award Points to Student
    console.log(`[approveSubmission] Awarding ${pointsToAward} points to student ${submission.studentId}`);
    await Student.findByIdAndUpdate(submission.studentId, {
      $inc: { ecoPoints: pointsToAward }
    });

    // 3. Update Challenge Progress
    await StudentChallengeProgress.findOneAndUpdate(
      { challengeId: submission.challengeId, studentId: submission.studentId },
      {
        status: 'approved',
        pointsEarned: pointsToAward,
        ecoPoints: pointsToAward,
        completedAt: new Date(),
        'submission.feedback': feedback || '',
        'submission.reviewedAt': new Date(),
        'submission.reviewedBy': req.user._id,
        'submission.reviewedByRef': 'Faculty'
      }
    );

    return res.json({
      success: true,
      message: `Submission approved and ${pointsToAward} points awarded!`,
      submission
    });

  } catch (error) {
    console.error("Error approving submission:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Reject a submission
export const rejectSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;

    const submission = await Submission.findById(id);

    if (!submission) {
      return res.status(404).json({ success: false, message: "Submission not found" });
    }

    // Authorization check
    if (submission.facultyId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to reject this submission" });
    }

    submission.status = "rejected";
    submission.reviewedAt = new Date();
    submission.feedback = feedback || submission.feedback;

    await submission.save();

    // Update Challenge Progress
    await StudentChallengeProgress.findOneAndUpdate(
      { challengeId: submission.challengeId, studentId: submission.studentId },
      {
        status: 'rejected',
        'submission.feedback': feedback || '',
        'submission.reviewedAt': new Date(),
        'submission.reviewedBy': req.user._id,
        'submission.reviewedByRef': 'Faculty'
      }
    );

    return res.json({ success: true, message: "Submission rejected", submission });
  } catch (error) {
    console.error("Error rejecting submission:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Delete a submission
export const deleteSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const submission = await Submission.findById(id);

    if (!submission) {
      return res.status(404).json({ success: false, message: "Submission not found" });
    }

    // Authorization check
    if (submission.facultyId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this submission" });
    }

    await submission.deleteOne();

    return res.json({ success: true, message: "Submission deleted" });
  } catch (error) {
    console.error("Error deleting submission:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
