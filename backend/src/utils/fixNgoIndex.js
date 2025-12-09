import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Adjust path to point to backend root .env
dotenv.config({ path: path.join(__dirname, '../../.env') });

const fixIndexes = async () => {
    try {
        console.log("Connecting to MongoDB...");
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        const db = mongoose.connection.db;
        const collection = db.collection('ngos');

        console.log("Listing indexes for 'ngos' collection...");
        const indexes = await collection.indexes();
        console.log('Current Indexes:', JSON.stringify(indexes, null, 2));

        // Attempt to drop the problematic 'email_1' index
        try {
            if (indexes.some(idx => idx.name === 'email_1')) {
                await collection.dropIndex('email_1');
                console.log('SUCCESS: Dropped index "email_1".');
            } else {
                console.log('INFO: Index "email_1" not found. Checking for "email" field in other indexes...');
            }
        } catch (e) {
            console.log('ERROR dropping email_1:', e.message);
        }

        console.log("Done.");
        process.exit(0);
    } catch (error) {
        console.error(`FATAL ERROR: ${error.message}`);
        process.exit(1);
    }
};

fixIndexes();
