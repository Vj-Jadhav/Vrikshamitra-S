import Challenge from "../models/Challenge.js";

export const getChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.find().sort({ createdAt: -1 });
    res.status(200).json(challenges);
  } catch (error) {
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