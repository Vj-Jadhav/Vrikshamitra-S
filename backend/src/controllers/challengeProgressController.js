
import StudentChallengeProgress from "../models/StudentChallengeProgress.js";
import Challenge from "../models/Challenge.js";
import ChallengeAssignment from "../models/ChallengeAssignment.js"; // Import Assignment model

export const getStudentChallengesWithDetails = async (req, res) => {
  try {
    const { studentId } = req.params;

    console.log(`Fetching challenges for studentId: ${studentId}`);

    if (!studentId) {
      return res.status(400).json({ message: "studentId is required" });
    }

    // STEP 1: Fetch progress records with Assignment details populated
    // We populate 'facultyCoordinator' in the assignment because that is the Faculty responsible for this.
    const progressData = await StudentChallengeProgress.find({ studentId })
      .populate({
        path: "assignmentId",
        populate: {
          path: "facultyCoordinator",
          select: "name email _id"
        }
      })
      .lean();

    console.log(`Found ${progressData.length} progress records `);

    if (progressData.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No challenges found",
        challenges: [],
      });
    }

    // Extract challenge IDs
    const challengeIds = progressData.map((item) => item.challengeId);

    // STEP 2: Fetch full challenge details
    const fullChallenges = await Challenge.find({
      _id: { $in: challengeIds },
    }).populate("createdBy", "fullName email").lean();

    // STEP 3: Merge Challenge Data with Assignment/Faculty Data
    const challengesWithFaculty = fullChallenges.map(challenge => {
      const progress = progressData.find(p => p.challengeId.toString() === challenge._id.toString());
      const assignment = progress?.assignmentId;

      // DESTINATION LOGIC:
      // Submissions should go to the Faculty Coordinator if one is assigned.
      // If not, they fallback to the Challenge Creator (e.g., if created directly by a faculty without assignment, or by admin).

      let facultyId = challenge.createdBy?._id || challenge.createdBy;
      let facultyName = challenge.createdBy?.fullName || "Institute Admin";

      if (assignment?.facultyCoordinator) {
        facultyId = assignment.facultyCoordinator._id;
        facultyName = assignment.facultyCoordinator.name;
      }

      return {
        ...challenge,
        facultyId: facultyId,
        facultyName: facultyName,
        createdBy: challenge.createdBy?._id || challenge.createdBy
      };
    });

    console.log(`Returning ${challengesWithFaculty.length} challenges with faculty details`);
    if (challengesWithFaculty.length > 0) {
      console.log("Sample Faculty ID:", challengesWithFaculty[0].facultyId);
    }

    return res.status(200).json({
      success: true,
      count: challengesWithFaculty.length,
      challenges: challengesWithFaculty,
    });
  } catch (error) {
    console.error("Error fetching student challenge details:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching challenge details",
    });
  }
};