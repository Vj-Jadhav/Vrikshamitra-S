import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


import mongoose from "mongoose";

import { Institute, School, College, University } from "../models/BaseInstituteSchema.js";
import Faculty from "../models/Faculty.js";
import Student from "../models/Student.js";
import Admin from "../models/AdminSchema.js";




// ⭐ REGISTER INSTITUTE ⭐
export const registerInstitute = async (req, res) => {
  try {
    const {
      // Basic Institute Info
      instituteName,
      instituteCode,
      email,
      password,
      instituteType,
      accreditation,
      affiliation,
      
      // Contact Information
      address,
      city,
      state,
      country,
      pincode,
      phone,
      website,
      alternatePhone,
      
      // Institute Details
      totalStudents,
      totalStaff,
      totalFaculty,
      establishedYear,
      campusArea,
      infrastructure,
      
      // Principal/Head Details
      principalName,
      principalEmail,
      principalPhone,
      principalQualification,
      principalExperience,
      
      // Academic Details
      academicSession,
      workingDays,

      // School specific
      schoolLevel,
      grades,
      board,
      
      // College specific
      departments,
      courses,
      universityAffiliated,
      
      // University specific
      faculties,
      programs,
      researchCenters
    } = req.body;

    console.log("📥 Received university faculties:", faculties);
    console.log("📥 Received workingDays:", workingDays);
    console.log("📥 Received infrastructure:", infrastructure);

    // Basic validation
    if (!instituteName || !email || !password || !instituteType) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    // Check if email already exists
    const exists = await Institute.findOne({ email });
    if (exists) return res.status(409).json({ message: "Email already registered" });

    // Check if institute code already exists (if provided)
    if (instituteCode) {
      const codeExists = await Institute.findOne({ instituteCode });
      if (codeExists) return res.status(409).json({ message: "Institute code already registered" });
    }

    console.log("🔍 RAW PASSWORD RECEIVED FROM FRONTEND:", password);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("🔐 HASHED PASSWORD SAVED:", hashedPassword);

    // Prepare base payload - UPDATED to match schema
    let payload = {
      instituteName,
      instituteCode: instituteCode || `INST_${Date.now()}`,
      email,
      password: hashedPassword,
      accreditation: accreditation || "",
      affiliation: affiliation || "",
      
      // Contact Information
      address: address || "",
      city: city || "",
      state: state || "",
      country: country || "",
      pincode: pincode || "",
      phone: phone || "",
      website: website || "",
      alternatePhone: alternatePhone || "",
      
      // Institute Details - Convert to numbers and handle arrays
      totalStudents: totalStudents ? parseInt(totalStudents) : 0,
      totalStaff: totalStaff ? parseInt(totalStaff) : 0,
      totalFaculty: totalFaculty ? parseInt(totalFaculty) : 0,
      establishedYear: establishedYear ? parseInt(establishedYear) : null,
      campusArea: campusArea || "",
      infrastructure: Array.isArray(infrastructure) ? infrastructure : (infrastructure ? [infrastructure] : []),
      
      // Principal/Head Details
      principalName: principalName || "",
      principalEmail: principalEmail || "",
      principalPhone: principalPhone || "",
      principalQualification: principalQualification || "",
      principalExperience: principalExperience || "",
      
      // Academic Details - Keep workingDays as array
      academicSession: academicSession || "",
      workingDays: Array.isArray(workingDays) ? workingDays : (workingDays ? [workingDays] : []),
    };

    console.log("🔄 Prepared base payload:", JSON.stringify(payload, null, 2));

    // Add type-specific fields with validation
    switch (instituteType) {
      case "school":
        if (!schoolLevel) {
          return res.status(400).json({ 
            message: "School level is required for schools" 
          });
        }
        if (!board) {
          return res.status(400).json({ 
            message: "Education board is required for schools" 
          });
        }
        payload = { 
          ...payload, 
          schoolLevel, 
          grades: Array.isArray(grades) ? grades : [],
          board 
        };
        break;
        
      case "college":
        if (!departments || departments.length === 0) {
          return res.status(400).json({ 
            message: "At least one department is required for colleges" 
          });
        }
        payload = { 
          ...payload, 
          departments: Array.isArray(departments) ? departments : [departments], 
          courses: Array.isArray(courses) ? courses : [],
          universityAffiliated: universityAffiliated || ""
        };
        break;
        
      case "university":
        // Validate faculties structure for universities
        if (!faculties || faculties.length === 0) {
          return res.status(400).json({ 
            message: "At least one faculty is required for universities" 
          });
        }

        // Validate that each faculty has the correct structure
        const invalidFaculties = faculties.filter(faculty => 
          !faculty || !faculty.name || typeof faculty.name !== 'string'
        );
        
        if (invalidFaculties.length > 0) {
          return res.status(400).json({ 
            message: "Invalid faculty structure. Each faculty must have a name." 
          });
        }

        payload = { 
          ...payload, 
          faculties: faculties.map(faculty => ({
            name: faculty.name?.trim() || "",
            departments: Array.isArray(faculty.departments) ? faculty.departments : []
          })), 
          programs: Array.isArray(programs) ? programs : [],
          researchCenters: Array.isArray(researchCenters) ? researchCenters : [] 
        };
        break;
        
      default:
        return res.status(400).json({ 
          message: "Invalid institute type" 
        });
    }

    console.log("📤 Final payload for creation:", JSON.stringify(payload, null, 2));

    // Create document using the correct discriminator
    let instituteDoc;
    switch (instituteType) {
      case "school":
        instituteDoc = await School.create(payload);
        break;
      case "college":
        instituteDoc = await College.create(payload);
        break;
      case "university":
        instituteDoc = await University.create(payload);
        break;
      default:
        return res.status(400).json({ 
          message: "Invalid institute type" 
        });
    }

    console.log("✅ Institute created successfully:", instituteDoc._id);

    return res.status(201).json({
      message: "Institute registered successfully",
      institute: {
        id: instituteDoc._id,
        instituteName: instituteDoc.instituteName,
        instituteCode: instituteDoc.instituteCode,
        email: instituteDoc.email,
        instituteType: instituteDoc.instituteType,
        principalName: instituteDoc.principalName
      }
    });

  } catch (err) {
    console.error("❌ Institute registration error:", err);
    
    // Handle MongoDB duplicate key errors
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(409).json({ 
        message: `${field === 'email' ? 'Email' : 'Institute code'} already exists` 
      });
    }
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(error => error.message);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: messages 
      });
    }
    
    return res.status(500).json({ 
      message: err.message || "Internal server error during registration" 
    });
  }
};

export const getUserDetails = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


// ⭐ REGISTER ⭐
export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    const userExists = await Admin.findOne({ email });
    if (userExists) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await Admin.create({
      fullName,
      email,
      password: hashed,
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ⭐ LOGIN ⭐
export const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    let user;

    // Check based on role
    switch (role) {
      case "institute":
        user = await Institute.findOne({ email });
        if (!user) return res.status(404).json({ message: "Institute not found" });

        // Only allow login if approvalStatus is true
        if (!user.approvalStatus) {
          return res.status(403).json({ message: "Institute not approved yet" });
        }
        break;

      case "faculty":
        user = await Faculty.findOne({ email });
        if (!user) return res.status(404).json({ message: "Faculty not found" });
        break;

      case "student":
        user = await Student.findOne({ email });
        if (!user) return res.status(404).json({ message: "Student not found" });
        break;
    
        case "admin":
        user = await Admin.findOne({ email });
        if (!user) return res.status(404).json({ message: "Admin not found" });
        break;

      default:
        // fallback to normal users (like admin)
        user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });
        break;
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Incorrect password" });

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Send user info
    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName || user.instituteName, // adapt for Institute
        email: user.email,
        role: role,
      },
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


export const addFaculty = async (req, res) => {
  try {
    const { instituteId } = req.params;
    const { name, email, phone, department, subjects } = req.body;

    // Validate required fields
    if (!name || !email || !department) {
      return res.status(400).json({ message: "Name, Email, and Department are required." });
    }

    // Check if institute exists
    const institute = await Institute.findById(instituteId);
    if (!institute) return res.status(404).json({ message: "Institute not found" });

    // Create new faculty
    const newFaculty = await Faculty.create({
      name,
      email,
      phone,
      department,
      subjects, // array expected
      instituteId
    });

    res.status(201).json(newFaculty);
  } catch (err) {
    console.error("Error adding faculty:", err);
    res.status(500).json({ message: "Failed to add faculty error printend in console" });
  }
};

export const getFacultyByInstitute = async (req, res) => {
  try {
    const { instituteId } = req.params;

    // Check if institute exists
    const institute = await Institute.findById(instituteId);
    if (!institute) {
      return res.status(404).json({ message: "Institute not found" });
    }

    // Find all faculty belonging to this institute
    const faculty = await Faculty.find({ instituteId });

    return res.status(200).json(faculty);
  } catch (err) {
    console.error("Error fetching faculty:", err);
    return res.status(500).json({ message: "Failed to fetch faculty" });
  }
};

export const addStudentsBulk = async (req, res) => {
  try {
    const { students } = req.body;
    const { instituteId } = req.params;

    if (!students || !Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ message: 'No students provided' });
    }

    // Add instituteId to each student
    const studentsWithInstitute = students.map(s => ({
      ...s,
      instituteId,
      status: s.status || 'active',
      joinDate: s.joinDate || new Date(),
      ecoPoints: s.ecoPoints || 0
    }));

    // Save all students at once
    const savedStudents = await Student.insertMany(studentsWithInstitute);

    res.status(201).json(savedStudents);
  } catch (error) {
    console.error('Error adding students in bulk:', error);
    res.status(500).json({ message: 'Failed to save students' });
  }
};


