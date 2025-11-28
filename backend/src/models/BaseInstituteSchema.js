import mongoose from "mongoose";

const baseOptions = { discriminatorKey: "instituteType", timestamps: true };

// ==============================
// Base Schema (Common Fields) - UPDATED
// ==============================
const BaseInstituteSchema = new mongoose.Schema({
  // Basic Info
  instituteName: { type: String, required: true },
  instituteCode: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  accreditation: { type: String },
  affiliation: { type: String },

  // Contact Info
  address: { type: String },
  city: { type: String },
  state: { type: String },
  country: { type: String },
  pincode: { type: String },
  phone: { type: String },
  website: { type: String },
  alternatePhone: { type: String },

  // Institute Details - UPDATED infrastructure to array
  totalStudents: { type: Number },
  totalStaff: { type: Number },
  totalFaculty: { type: Number },
  establishedYear: { type: Number },
  campusArea: { type: String },
  infrastructure: [{ type: String }], // Changed from String to Array

  // Principal Details
  principalName: { type: String },
  principalEmail: { type: String },
  principalPhone: { type: String },
  principalQualification: { type: String },
  principalExperience: { type: String },

  // Academic Details - UPDATED workingDays to array
  academicSession: { type: String },
  workingDays: [{ type: String }], // Changed from Number to Array

  // Approval (Government)
  approvalStatus: { type: Boolean, default: null },

  // System Controlled
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}, baseOptions);

const Institute = mongoose.model("Institute", BaseInstituteSchema);

// ==============================
// SCHOOL SCHEMA - UPDATED (added board field)
// ==============================
const School = Institute.discriminator(
  "school",
  new mongoose.Schema({
    schoolLevel: {
      type: String,
      enum: [
        "Primary School",
        "Middle School",
        "High School",
        "Higher Secondary",
        "K-12",
        "International School"
      ],
      required: true
    },
    grades: [{ type: String }],
    board: { type: String, required: true } // Added board field
  })
);

// ==============================
// COLLEGE SCHEMA (unchanged)
// ==============================
const College = Institute.discriminator(
  "college",
  new mongoose.Schema({
    departments: [{ type: String, trim: true, maxlength: 100 }],
    courses: [{ type: String, trim: true, maxlength: 100 }],
    universityAffiliated: { type: String }
  })
);

// ==============================
// UNIVERSITY SCHEMA (unchanged - correct)
// ==============================
const FacultySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 150 },
  departments: [{ type: String, trim: true, maxlength: 100 }]
});

const University = Institute.discriminator(
  "university",
  new mongoose.Schema({
    faculties: [FacultySchema],
    programs: [{ type: String, trim: true, maxlength: 100 }],
    researchCenters: [{ type: String, trim: true, maxlength: 150 }]
  })
);

export { Institute, School, College, University };