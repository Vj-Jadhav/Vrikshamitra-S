// models/Event.js
import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Event title is required"],
    trim: true,
    maxlength: [200, "Event title cannot exceed 200 characters"]
  },

  description: {
    type: String,
    required: [true, "Event description is required"],
    trim: true,
    maxlength: [2000, "Description cannot exceed 2000 characters"]
  },

  date: {
    type: Date,
    required: [true, "Event date is required"],
    validate: {
      validator: function (value) {
        // Allow dates from the start of today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return value >= today;
      },
      message: "Event date cannot be in the past"
    }
  },

  venue: {
    type: String,
    required: [true, "Event venue is required"],
    trim: true,
    maxlength: [500, "Venue cannot exceed 500 characters"]
  },

  instituteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institute',
    required: [true, "Institute ID is required"]
  },

  instituteName: {
    type: String,
    required: [true, "Institute name is required"]
  },

  // Target Information (Optional)
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PlantingTarget'
  },

  plannedTrees: {
    type: Number
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  createdByName: {
    type: String,
    required: true
  },

  // NGO Information
  // NGO Information - Optional initially for Institute Created Events
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NGO'
  },

  ngoName: {
    type: String
  },

  // Request Information
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request'
  },

  itemsRequested: {
    type: String,
    required: [true, "Items requested is required"],
    trim: true
  },

  // Event Details
  eventType: {
    type: String,
    enum: ['tree-planting', 'cleanup', 'awareness', 'workshop', 'fundraiser', 'other'],
    default: 'tree-planting'
  },

  status: {
    type: String,
    enum: ['pending', 'approved', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },

  expectedParticipants: {
    type: Number,
    min: 1,
    max: 10000
  },

  actualParticipants: {
    type: Number,
    default: 0
  },

  // Logistics
  coordinatorName: {
    type: String,
    trim: true
  },

  coordinatorPhone: {
    type: String,
    trim: true
  },

  coordinatorEmail: {
    type: String,
    trim: true,
    lowercase: true
  },

  // Media
  photos: [{
    url: String,
    caption: String,
    uploadedAt: Date
  }],

  documents: [{
    name: String,
    url: String,
    type: String
  }],

  registrations: [{
    studentName: String,
    studentId: String,
    email: String,
    registeredAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Delivery & Assignment
  deliveryStatus: {
    type: String,
    enum: ['pending', 'delivered'],
    default: 'pending'
  },

  assignedFaculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Or 'Faculty' if you have a specific Faculty model, but usually User with role
  },

  // Timeline
  createdAt: {
    type: Date,
    default: Date.now
  },

  approvedAt: Date,

  startedAt: Date,

  completedAt: Date,

  // Reporting
  report: {
    type: String,
    trim: true,
    maxlength: [5000, "Report cannot exceed 5000 characters"]
  },

  impactMetrics: {
    treesPlanted: Number,
    wasteCollected: Number, // in kg
    participantsReached: Number,
    communityImpact: String
  },

  // Feedback
  ngoFeedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    providedAt: Date
  },

  instituteFeedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    providedAt: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
eventSchema.index({ instituteId: 1, status: 1 });
eventSchema.index({ ngoId: 1, status: 1 });
eventSchema.index({ date: 1 });
eventSchema.index({ createdAt: -1 });

// Virtual for formatted date
eventSchema.virtual('formattedDate').get(function () {
  return this.date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for time remaining
eventSchema.virtual('daysUntilEvent').get(function () {
  const today = new Date();
  const eventDate = new Date(this.date);
  const diffTime = eventDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

const Event = mongoose.model('Event', eventSchema);

export default Event;