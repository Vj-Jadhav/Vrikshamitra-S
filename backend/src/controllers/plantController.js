import Plant from "../models/Plant.js";
import Student from "../models/Student.js";

// BASE_URL for images. Assuming backend runs on port 5000 or similar and served via /uploads
// Actually, better to construct full URL or return relative path. 
// Standard in this app seems to be relative path, let frontend handle or full path if possible.
// I will check if BASE_URL is defined in backend config, otherwise I'll infer it.
// Checking app.js, it serves /uploads. 

export const addPlant = async (req, res) => {
    try {
        const { studentId, name, species } = req.body;

        const plant = new Plant({
            student: studentId,
            name,
            species,
            plantedDate: new Date(),
        });

        await plant.save();
        res.status(201).json(plant);
    } catch (error) {
        console.error("Error adding plant:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getStudentPlants = async (req, res) => {
    try {
        const { studentId } = req.params;
        const plants = await Plant.find({ student: studentId }).sort({ createdAt: -1 });
        res.status(200).json(plants);
    } catch (error) {
        console.error("Error fetching plants:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const updatePlantStatus = async (req, res) => {
    try {
        const { plantId } = req.params;
        const { health } = req.body;

        const plant = await Plant.findByIdAndUpdate(
            plantId,
            { health },
            { new: true }
        );

        if (!plant) {
            return res.status(404).json({ message: "Plant not found" });
        }

        res.status(200).json(plant);
    } catch (error) {
        console.error("Error updating plant:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const uploadPlantPhoto = async (req, res) => {
    try {
        const { plantId } = req.params;

        if (!req.file) {
            return res.status(400).json({ message: "No image file provided" });
        }

        // Construct image URL
        // Assuming file is saved to uploads/submissions (via middleware) and served at /uploads
        // Middleware saves to ../uploads/submissions, app.js serves /uploads mapped to ../uploads
        // So if file is mapped to uploads/submissions/filename, web path is /uploads/submissions/filename

        // req.file.filename gives the filename
        const imageUrl = `/uploads/submissions/${req.file.filename}`;

        const plant = await Plant.findById(plantId);
        if (!plant) {
            return res.status(404).json({ message: "Plant not found" });
        }

        plant.photos.push({
            url: imageUrl,
            date: new Date()
        });

        // Determine growth/progress based on photo count or generic logic
        // For now simple generic increase if needed, or leave it. 
        // Logic: Each photo increases confidence/progress slightly? Or just manual.
        // Let's increment progress by 0.1 (10%) per photo up to 1.
        if (plant.progress < 1) {
            plant.progress = Math.min(plant.progress + 0.1, 1);
        }

        await plant.save();

        res.status(200).json(plant);

    } catch (error) {
        console.error("Error uploading photo:", error);
        res.status(500).json({ message: "Server error" });
    }
};
