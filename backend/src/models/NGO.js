// models/NGO.js
import mongoose from "mongoose";

const ngoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  
  description: {
    type: String,
    required: true,
    trim: true
  },
  
  location: {
    type: String,
    required: true
  },
  
  contactPerson: {
    type: String,
    required: true
  },
  
  contactEmail: {
    type: String,
    required: true,
    lowercase: true
  },
  
  contactPhone: {
    type: String,
    required: true
  },
  
  website: String,
  
  logo: String,
  
  focusAreas: [{
    type: String,
    enum: ['tree-planting', 'cleanup', 'education', 'wildlife', 'sustainability', 'community']
  }],
  
  resourcesAvailable: [{
    name: String,
    description: String,
    quantity: Number,
    unit: String
  }],
  
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const NGO = mongoose.model('NGO', ngoSchema);

export default NGO;