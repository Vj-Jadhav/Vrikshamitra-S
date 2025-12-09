import mongoose from "mongoose";

const plantingRequestSchema = new mongoose.Schema({
    instituteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Institute',
        required: true
    },
    instituteName: {
        type: String,
        required: true
    },
    pincode: {
        type: String,
        required: true
    },
    treeType: {
        type: String,
        // required: true // Made optional for new workflow
    },
    targetGrade: {
        type: String,
        // required: true
    },
    assignedFaculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty' // or User
    },
    facultyStatus: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    date: {
        type: Date
    },
    treeCount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    acceptedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'NGO'
    },
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const PlantingRequest = mongoose.model('PlantingRequest', plantingRequestSchema);

export default PlantingRequest;
