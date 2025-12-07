import Student from "../models/Student.js";
import StudentChallengeProgress from "../models/StudentChallengeProgress.js";

/**
 * @desc    Get student profile with aggregated EcoPoints
 * @route   GET /api/student/:id
 * @access  Private (Student)
 */
export const getStudentProfile = async (req, res) => {
    try {
        const { id } = req.params;

        const student = await Student.findById(id).select("-password -otp -resetToken -resetOTP");

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Option A: Use stored EcoPoints directly (matches User expectation if DB is manually updated)
        const totalEcoPoints = student.ecoPoints || 0;

        // Combine student data with calculated points
        const studentData = {
            ...student.toObject(),
            points: totalEcoPoints, // Frontend expects 'points'
            ecoPoints: totalEcoPoints // Sending both just in case
        };

        res.status(200).json(studentData);
    } catch (error) {
        console.error("Error fetching student profile:", error);
        res.status(500).json({ message: "Failed to fetch student profile", error: error.message });
    }
};

/**
 * @desc    Update student avatar
 * @route   PUT /api/student/:id/avatar
 * @access  Private (Student)
 */
export const updateStudentAvatar = async (req, res) => {
    try {
        const { id } = req.params;
        const { photo } = req.body;

        if (!photo) {
            return res.status(400).json({ message: "Photo URL is required" });
        }

        // Re-fetching or using findByIdAndUpdate with new:true
        const updatedStudent = await Student.findByIdAndUpdate(
            id,
            { $set: { photo: photo } }, // Using $set to be explicit
            { new: true }
        ).select("-password");

        if (!updatedStudent) {
            return res.status(404).json({ message: "Student not found" });
        }

        res.status(200).json(updatedStudent);
    } catch (error) {
        console.error("Error updating avatar:", error);
        res.status(500).json({ message: "Failed to update avatar", error: error.message });
    }
};
