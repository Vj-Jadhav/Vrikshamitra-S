const Submission = require("../models/Submission");

// Submit proof with Cloudinary
exports.submitProof = async (req, res) => {
  try {
    const {
      challengeId,
      studentId,
      studentName,
      studentEmail,
      challengeTitle,
      facultyId,
      facultyName,
      points,
      cloudinaryUrl,
      cloudinaryPublicId,
      thumbnailUrl,
      imageFormat,
      imageSize,
      imageDimensions,
    } = req.body;

    // Validate required fields
    if (!challengeId || !studentId || !cloudinaryUrl) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Check for existing pending/approved submission
    const existingSubmission = await Submission.findOne({
      challengeId,
      studentId,
      status: { $in: ["pending", "approved"] },
    });

    if (existingSubmission) {
      return res.status(409).json({
        success: false,
        message: "You have already submitted proof for this challenge.",
      });
    }

    // Create new submission
    const submission = new Submission({
      challengeId,
      studentId,
      studentName,
      studentEmail,
      challengeTitle,
      facultyId,
      facultyName,
      points,
      cloudinaryUrl,
      cloudinaryPublicId,
      thumbnailUrl,
      imageFormat,
      imageSize,
      imageDimensions,
      status: "pending",
      uploadedAt: new Date(),
    });

    await submission.save();

    res.status(201).json({
      success: true,
      message: "Proof submitted successfully for review.",
      submission,
    });
  } catch (error) {
    console.error("Submit proof error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit proof.",
      error: error.message,
    });
  }
};

// Get all submissions for faculty
exports.getAllSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find()
      .populate("studentId", "name email rollNumber")
      .populate("challengeId", "title points description")
      .sort({ uploadedAt: -1 });

    res.status(200).json({
      success: true,
      count: submissions.length,
      submissions,
    });
  } catch (error) {
    console.error("Get submissions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch submissions.",
      error: error.message,
    });
  }
};

// Get submission status for student
exports.getSubmissionStatus = async (req, res) => {
  try {
    const { challengeId, studentId } = req.query;

    if (!challengeId || !studentId) {
      return res.status(400).json({
        success: false,
        message: "Challenge ID and Student ID are required",
      });
    }

    const submission = await Submission.findOne({
      challengeId,
      studentId,
    })
      .populate("studentId", "name email")
      .populate("challengeId", "title points");

    res.status(200).json({
      success: true,
      submission: submission || null,
    });
  } catch (error) {
    console.error("Get status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch submission status.",
      error: error.message,
    });
  }
};

// Approve submission
exports.approveSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;

    const submission = await Submission.findById(id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    if (submission.status === STATUS.APPROVED) {
      return res.status(400).json({
        success: false,
        message: "Submission already approved",
      });
    }

    submission.status = STATUS.APPROVED;
    submission.feedback = feedback || "Good job! Submission approved.";
    submission.reviewedAt = new Date();
    submission.pointsAwarded = submission.points;

    await submission.save();

    // Here you can add logic to update student's total points
    // updateStudentPoints(submission.studentId, submission.points);

    res.status(200).json({
      success: true,
      message: "Submission approved successfully",
      submission,
    });
  } catch (error) {
    console.error("Approve submission error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve submission.",
      error: error.message,
    });
  }
};

// Reject submission
exports.rejectSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;

    if (!feedback || feedback.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Feedback is required when rejecting a submission",
      });
    }

    const submission = await Submission.findById(id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    submission.status = STATUS.REJECTED;
    submission.feedback = feedback;
    submission.reviewedAt = new Date();

    await submission.save();

    res.status(200).json({
      success: true,
      message: "Submission rejected successfully",
      submission,
    });
  } catch (error) {
    console.error("Reject submission error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reject submission.",
      error: error.message,
    });
  }
};

// Delete submission (optional)
exports.deleteSubmission = async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await Submission.findByIdAndDelete(id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    // Here you can add logic to delete from Cloudinary
    // deleteFromCloudinary(submission.cloudinaryPublicId);

    res.status(200).json({
      success: true,
      message: "Submission deleted successfully",
    });
  } catch (error) {
    console.error("Delete submission error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete submission.",
      error: error.message,
    });
  }
};