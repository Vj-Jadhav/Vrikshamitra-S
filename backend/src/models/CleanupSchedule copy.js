// models/CleanupSchedule.js
import mongoose from "mongoose";

const cleanupScheduleSchema = new mongoose.Schema({
  report: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report',
    required: true
  },
  scheduledBy: {
    userType: {
      type: String,
       enum: ['Student', 'Faculty', 'User', 'Guest', 'Admin', 'Institute'],
      default: 'guest'
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      refPath: 'scheduledBy.userType'
    }
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  scheduledTime: {
    type: String, // Store as HH:MM format
    required: true
  },
  participantCount: {
    type: Number,
    required: true,
    min: 1,
    max: 50,
    default: 1
  },
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  completedAt: Date,
  completionProof: [{
    imageUrl: String,
    cloudinaryId: String,
    uploadedAt: Date
  }],
  estimatedDuration: {
    type: Number, // in minutes
    default: 60
  },
  actualDuration: Number, // in minutes
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

// Indexes
cleanupScheduleSchema.index({ scheduledDate: 1 });
cleanupScheduleSchema.index({ status: 1 });
cleanupScheduleSchema.index({ report: 1 });

// Virtual property for combined date and time
cleanupScheduleSchema.virtual('scheduledDateTime').get(function () {
  const datePart = this.scheduledDate.toISOString().split('T')[0];
  return new Date(`${datePart}T${this.scheduledTime}`);
});

// Pre-save middleware to update report status
cleanupScheduleSchema.pre('save', async function (next) {
  if (this.isNew) {
    try {
      // Update the associated report status
      await mongoose.model('Report').findByIdAndUpdate(
        this.report,
        {
          status: 'in_progress',
          updatedAt: new Date()
        }
      );
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Instance method to check if schedule is upcoming
cleanupScheduleSchema.methods.isUpcoming = function () {
  const now = new Date();
  const scheduleDateTime = new Date(`${this.scheduledDate.toISOString().split('T')[0]}T${this.scheduledTime}`);
  return scheduleDateTime > now;
};

export default mongoose.model("CleanupSchedule", cleanupScheduleSchema);