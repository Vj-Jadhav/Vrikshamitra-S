import Faculty from "../models/Faculty.js";
import Student from "../models/Student.js";
import Challenge from "../models/Challenge.js";
import Submission from "../models/Submission.js";
import ChallengeAssignment from "../models/ChallengeAssignment.js";
import mongoose from "mongoose";

/**
 * @desc    Get analytics for a specific faculty member
 * @route   GET /api/faculty/:id
 * @access  Private (Faculty/Admin)
 */
export const getFacultyAnalytics = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid faculty ID" });
        }

        const faculty = await Faculty.findById(id);
        if (!faculty) {
            return res.status(404).json({ message: "Faculty not found" });
        }

        // 1. Total Students
        // Faculty can be assigned students directly via 'assignedStudents'
        // OR via ChallengeAssignments where they are coordinator.
        // Let's consolidate unique students.

        // Get students directly assigned
        let studentIds = faculty.assignedStudents || [];

        // Get students from assignments where this faculty is coordinator
        const assignments = await ChallengeAssignment.find({ facultyCoordinator: id });
        assignments.forEach(assignment => {
            if (assignment.assignedStudents) {
                studentIds.push(...assignment.assignedStudents);
            }
        });

        // Unique students
        studentIds = [...new Set(studentIds.map(s => s.toString()))];
        const totalStudents = studentIds.length;

        // 2. Total EcoPoints
        // Sum of ecoPoints of all these unique students
        const students = await Student.find({ _id: { $in: studentIds } }).select('ecoPoints');
        const totalEcoPoints = students.reduce((sum, s) => sum + (s.ecoPoints || 0), 0);

        // 3. Active Challenges
        // Challenges currently 'in-progress' managed by this faculty
        const activeChallengesCount = await ChallengeAssignment.countDocuments({
            facultyCoordinator: id,
            status: 'in-progress' // Assuming 'in-progress' is the status for active
        });

        // 4. Participation Rate
        // (Students who have submitted at least one thing / Total Students) * 100
        // OR (Total Submissions / (Total Students * Total Active Challenges)) ?
        // "Submissions / student" hint in UI suggests average submissions per student, but "Participation Rate" suggests % of students active.
        // Let's go with % of students who have made at least one submission under this faculty.

        const submissions = await Submission.find({ facultyId: id });
        const uniqueStudentSubmitters = new Set(submissions.map(s => s.studentId.toString()));
        const submittersCount = uniqueStudentSubmitters.size;

        const participationRate = totalStudents > 0
            ? Math.round((submittersCount / totalStudents) * 100)
            : 0;

        // 5. Monthly Participation (Line Chart)
        // Group submissions by month (last 12 months)
        const monthlyParticipation = await Submission.aggregate([
            {
                $match: {
                    facultyId: new mongoose.Types.ObjectId(id),
                    uploadedAt: { $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) }
                }
            },
            {
                $group: {
                    _id: { month: { $month: "$uploadedAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.month": 1 } }
        ]);

        // 6. Top Classes (Bar Chart)
        // Group by student's grade/class. Join with Student model.
        // Submissions -> Student -> Grade
        const topClasses = await Submission.aggregate([
            {
                $match: { facultyId: new mongoose.Types.ObjectId(id) }
            },
            {
                $lookup: {
                    from: "students",
                    localField: "studentId",
                    foreignField: "_id",
                    as: "student"
                }
            },
            { $unwind: "$student" },
            {
                $group: {
                    _id: "$student.grade", // Assuming 'grade' is the class identifier like "9A", "10B" etc
                    submissions: { $sum: 1 }
                }
            },
            { $sort: { submissions: -1 } },
            { $limit: 5 }
        ]);

        // Format topClasses for frontend: { name: "9A", submissions: 10 }
        const formattedTopClasses = topClasses.map(c => ({
            name: c._id || "Unknown",
            submissions: c.submissions
        }));

        // 7. Activity Distribution (Pie Chart)
        // Group by Challenge Category
        const activityDistribution = await Submission.aggregate([
            {
                $match: { facultyId: new mongoose.Types.ObjectId(id) }
            },
            {
                $lookup: {
                    from: "challenges",
                    localField: "challengeId",
                    foreignField: "_id",
                    as: "challenge"
                }
            },
            { $unwind: "$challenge" },
            {
                $group: {
                    _id: "$challenge.category",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Format for frontend
        const formattedActivityDistribution = activityDistribution.map(a => ({
            name: a._id || "Other",
            value: a.count
        }));

        res.status(200).json({
            totalStudents,
            totalEcoPoints,
            activeChallenges: activeChallengesCount,
            participationRate,
            monthlyParticipation, // frontend handles the mapping of month numbers
            topClasses: formattedTopClasses,
            activityDistribution: formattedActivityDistribution,

            // Also return basic profile info if needed, as frontend does `setFacultyData` partially from user context but might expect updates
            name: faculty.name,
            designation: faculty.designation || "Faculty", // Schema doesn't have designation, might need to add or mock
            school: faculty.department || "Institute", // Using department as school/unit
        });

    } catch (error) {
        console.error("Error fetching faculty analytics:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};
