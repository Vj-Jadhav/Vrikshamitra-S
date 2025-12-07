import Challenge from "../models/Challenge.js";

export const getChallenges = async (req, res) => {
  try {
    let query = {};

    // If the user is authenticated (which they should be for this route), check their role
    // Assuming authMiddleware adds req.user
    if (req.user) {
      if (req.user.role === 'faculty') {
        // Faculty should see:
        // 1. Challenges they created
        // 2. Challenges assigned to them (via ChallengeAssignment - logic needed or simplified "createdBy")
        // For now, based on user request "allocated by institute", it might mean "Challenges assigned to them".
        // Typically, challenges are "Questions".
        // If a faculty logs in, they want to see challenges they can MANAGE or challenges their students are doing?
        // "ManageChallenges.jsx" implies managing challenges they created or have rights to.

        // Let's filter by createdBy for now as a safe default for "My Challenges"
        // If the user specifically said "allocated by institute", that suggests `ChallengeAssignment`.
        // But `Challenge` model has `createdBy`.
        // IF challenges are created BY the institute AND "assigned" to faculty to oversee, checking `createdBy` won't work if it's the Institute ID.

        // Let's check ChallengeAssignment to find challenges assigned to this faculty.
        // This is complex because we need to join/lookup.

        // QUICK FIX: Filter by createdBy for simple "My Created Challenges" view
        // OR if request query param exists?

        // Re-reading user request: "show the faculty that only those challenges that they got allocated by institute"
        // This likely refers to `ChallengeAssignment` where `facultyCoordinator` or `assignedBy` logic applies.
        // However, `ManageChallenges` fetches `/api/challenges`.

        // Let's implement a hybrid:
        // If role is faculty, find ChallengeAssignments where `facultyCoordinator` == req.user.id
        // Collect those challengeIds.
        // ALSO find challenges where `createdBy` == req.user.id
        // Return unique set.

        const { default: ChallengeAssignment } = await import("../models/ChallengeAssignment.js");

        // Find assignments where this faculty is the coordinator
        const assignments = await ChallengeAssignment.find({ facultyCoordinator: req.user.id }).select('challengeId');
        const assignedChallengeIds = assignments.map(a => a.challengeId);

        query = {
          $or: [
            { createdBy: req.user.id },
            { _id: { $in: assignedChallengeIds } }
          ]
        };
      } else if (req.user.role === 'institute') {
        query = { createdBy: req.user.id };
      }
      // Admins see all
    }

    const challenges = await Challenge.find(query).sort({ createdAt: -1 });
    res.status(200).json(challenges);
  } catch (error) {
    console.error("Get challenges error:", error);
    res.status(500).json({ message: "Failed to fetch challenges", error });
  }
};

/**
 * @desc    Create new challenge
 * @route   POST /challenges
 */
export const createChallenge = async (req, res) => {
  try {
    console.log('📥 Received challenge creation data:', req.body); // Debug log

    const {
      title,
      description,
      category,
      priority,
      status,
      mandatory,
      startDate,
      deadline,
      requirements,
      resources,
      createdBy,
      ecoPoints // ADDED: Extract ecoPoints from request body
    } = req.body;

    // Auto-sync mandatory with priority
    const isMandatory = priority === "mandatory";

    const challenge = await Challenge.create({
      title,
      description,
      category,
      priority,
      status,
      mandatory: isMandatory,
      startDate,
      deadline,
      requirements,
      resources,
      createdBy,
      ecoPoints: ecoPoints || 0 // ADDED: Include ecoPoints with default value
    });

    console.log('💾 Created challenge:', challenge); // Debug log

    res.status(201).json(challenge);
  } catch (error) {
    console.error('❌ Error creating challenge:', error); // Debug log
    res.status(400).json({ message: "Failed to create challenge", error });
  }
};

/**
 * @desc    Update a challenge
 * @route   PUT /challenges/:id
 */
export const updateChallenge = async (req, res) => {
  try {
    console.log('📥 Received challenge update data:', req.body); // Debug log

    const updates = { ...req.body };

    // Keep mandatory consistent with priority if changed
    if (updates.priority) {
      updates.mandatory = updates.priority === "mandatory";
    }

    // Ensure ecoPoints is included in updates
    if (updates.ecoPoints === undefined) {
      updates.ecoPoints = 0; // Set default if not provided
    }

    const updatedChallenge = await Challenge.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true } // Added runValidators to ensure schema validation
    );

    if (!updatedChallenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }

    console.log('💾 Updated challenge:', updatedChallenge); // Debug log

    res.status(200).json(updatedChallenge);
  } catch (error) {
    console.error('❌ Error updating challenge:', error); // Debug log
    res.status(500).json({ message: "Failed to update challenge", error });
  }
};

/**
 * @desc    Delete a challenge
 * @route   DELETE /challenges/:id
 */
export const deleteChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findByIdAndDelete(req.params.id);

    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }

    res.status(200).json({ message: "Challenge deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete challenge", error });
  }
};