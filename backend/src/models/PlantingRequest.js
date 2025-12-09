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
        default: 'Mixed'
    },
    targetGrade: {
        type: String
    },
    assignedFaculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty'
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
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PlantingTarget'
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