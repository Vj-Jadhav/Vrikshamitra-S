
import mongoose from "mongoose";
import dotenv from "dotenv";
import Faculty from "./src/models/Faculty.js";
import { Institute } from "./src/models/BaseInstituteSchema.js";

dotenv.config();

const checkFaculty = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const faculties = await Faculty.find({});
        console.log(`Found ${faculties.length} faculties.`);

        if (faculties.length > 0) {
            console.log("Sample Faculty:", JSON.stringify(faculties[0], null, 2));
        }

        const institutes = await Institute.find({});
        console.log(`Found ${institutes.length} institutes.`);
        if (institutes.length > 0) {
            console.log("Sample Institute ID:", institutes[0]._id);

            const linkedFaculty = await Faculty.find({ instituteId: institutes[0]._id });
            console.log(`Faculty for first institute (${institutes[0]._id}): ${linkedFaculty.length}`);
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkFaculty();
