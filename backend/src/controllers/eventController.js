import Event from "../models/Event.js";
import fs from "fs";

// Bulk register students via CSV
export const bulkRegister = async (req, res) => {
    try {
        const { eventId } = req.params;

        if (!req.file) {
            return res.status(400).json({ message: "No CSV file uploaded" });
        }

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // Read file content
        const fileContent = fs.readFileSync(req.file.path, "utf-8");

        // Parse CSV safely
        // Expected format: Name,StudentID,Email
        // Skip header row if present
        const rows = fileContent.split(/\r?\n/).filter(row => row.trim() !== "");
        const newRegistrations = [];
        const errors = [];

        // Simple check if first row is header
        let startIndex = 0;
        if (rows.length > 0 && rows[0].toLowerCase().includes("name")) {
            startIndex = 1;
        }

        for (let i = startIndex; i < rows.length; i++) {
            const columns = rows[i].split(",");
            if (columns.length < 2) continue; // Skip invalid rows

            const name = columns[0]?.trim();
            const studentId = columns[1]?.trim();
            const email = columns[2]?.trim();

            if (name && studentId) {
                // Check if already registered
                const isDuplicate = event.registrations.some(
                    reg => reg.studentId === studentId || (email && reg.email === email)
                );

                if (!isDuplicate) {
                    newRegistrations.push({
                        studentName: name,
                        studentId: studentId,
                        email: email || ""
                    });
                }
            }
        }

        if (newRegistrations.length > 0) {
            event.registrations.push(...newRegistrations);
            await event.save();
        }

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        res.status(200).json({
            success: true,
            message: `Successfully registered ${newRegistrations.length} students.`,
            addedCount: newRegistrations.length,
            totalRegistrations: event.registrations.length
        });

    } catch (error) {
        console.error("Bulk Registration Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};
