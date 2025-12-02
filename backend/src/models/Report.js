import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  reportedBy: {
    userType: {
      type: String,
      enum: ['Student', 'Faculty', 'User'],
      default: 'Guest'
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      refPath: 'reportedBy.userType'
    }
  },
  imageUrl: {
    type: String,
    required: true
  },
  cloudinaryId: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  address: {
    type: String,
    required: true
  },
  accuracy: {
    type: Number,
    required: false
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'in_progress', 'resolved', 'rejected'],
    default: 'pending'
  },
  category: {
    type: String,
    enum: ['plastic', 'organic', 'electronic', 'hazardous', 'construction', 'other'],
    default: 'plastic'
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  tags: [{
    type: String,
    trim: true
  }],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create 2dsphere index for location-based queries
reportSchema.index({ location: '2dsphere' });
reportSchema.index({ status: 1 });
reportSchema.index({ createdAt: -1 });

export default mongoose.model("Report", reportSchema);