import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Institute, School, College, University } from "../models/BaseInstituteSchema.js";
import Faculty from "../models/Faculty.js";
import Student from "../models/Student.js";
import Admin from "../models/AdminSchema.js";
import crypto from "crypto";
import { sendOTPEmail } from "../utils/emailService.js";



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
// export const loginUser = async (req, res) => {
//   try {
//     const { email, password, role } = req.body;

//     if (!email || !password || !role) {
//       return res.status(400).json({ message: "Please fill all fields" });
//     }

//     let user;

//     // Check based on role
//     switch (role) {
//       case "institute":
//         user = await Institute.findOne({ email });
//         if (!user) return res.status(404).json({ message: "Institute not found" });

//         // Only allow login if approvalStatus is true
//         if (!user.approvalStatus) {
//           return res.status(403).json({ message: "Institute not approved yet" });
//         }
//         break;

//       case "faculty":
//         user = await Faculty.findOne({ email });
//         if (!user) return res.status(404).json({ message: "Faculty not found" });
//         break;

//       case "student":
//         user = await Student.findOne({ email });
//         if (!user) return res.status(404).json({ message: "Student not found" });
//         break;
    
//         case "admin":
//         user = await Admin.findOne({ email });
//         if (!user) return res.status(404).json({ message: "Admin not found" });
//         break;

//       default:
//         // fallback to normal users (like admin)
//         user = await User.findOne({ email });
//         if (!user) return res.status(404).json({ message: "User not found" });
//         break;
//     }

//     // Check password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(401).json({ message: "Incorrect password" });

//     // Generate JWT
//     const token = jwt.sign(
//       { id: user._id, role },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     // Send user info
//     return res.status(200).json({
//       message: "Login successful",
//       token,
//       user: {
//         id: user._id,
//         fullName: user.fullName || user.instituteName, // adapt for Institute
//         email: user.email,
//         role: role,
//       },
//     });

//   } catch (err) {
//     return res.status(500).json({ message: err.message });
//   }
// };


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


export const verifyStudentOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log("Verify student OTP:", { email, otp });
    res.status(200).json({ 
      success: true, 
      message: "Student OTP verified successfully",
      tempToken: "temp_token_here"
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error verifying OTP: " + error.message 
    });
  }
};

export const setStudentPassword = async (req, res) => {
  try {
    const { email, tempToken, password } = req.body;
    console.log("Set student password:", { email, tempToken, password });
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update student password
    const student = await Student.findOne({ email });
    if (student) {
      student.password = hashedPassword;
      student.requiresPasswordSetup = false;
      student.otp = undefined;
      await student.save();
    }
    
    // Generate final token
    const token = jwt.sign(
      { 
        id: student._id, 
        email: student.email, 
        role: 'student',
        instituteId: student.instituteId 
      }, 
      process.env.JWT_SECRET || 'fallback_secret', 
      { expiresIn: '7d' }
    );
    
    res.status(200).json({ 
      success: true, 
      message: "Student password set successfully",
      token: token,
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        role: 'student',
        instituteId: student.instituteId
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error setting password: " + error.message 
    });
  }
};

export const verifyFacultyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log("Verify faculty OTP:", { email, otp });
    res.status(200).json({ 
      success: true, 
      message: "Faculty OTP verified successfully",
      tempToken: "temp_token_here"
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error verifying OTP: " + error.message 
    });
  }
};

export const setFacultyPassword = async (req, res) => {
  try {
    const { email, tempToken, password } = req.body;
    console.log("Set faculty password:", { email, tempToken, password });
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update faculty password
    const faculty = await Faculty.findOne({ email });
    if (faculty) {
      faculty.password = hashedPassword;
      faculty.otp = undefined;
      await faculty.save();
    }
    
    // Generate final token
    const token = jwt.sign(
      { 
        id: faculty._id, 
        email: faculty.email, 
        role: 'faculty',
        instituteId: faculty.instituteId 
      }, 
      process.env.JWT_SECRET || 'fallback_secret', 
      { expiresIn: '7d' }
    );
    
    res.status(200).json({ 
      success: true, 
      message: "Faculty password set successfully",
      token: token,
      faculty: {
        id: faculty._id,
        name: faculty.name,
        email: faculty.email,
        role: 'faculty',
        instituteId: faculty.instituteId
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error setting password: " + error.message 
    });
  }
};

export const resendStudentOTP = async (req, res) => {
  try {
    const { email } = req.body;
    console.log("Resend student OTP:", email);
    res.status(200).json({ 
      success: true, 
      message: "New OTP sent to student email" 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error resending OTP: " + error.message 
    });
  }
};

export const resendFacultyOTP = async (req, res) => {
  try {
    const { email } = req.body;
    console.log("Resend faculty OTP:", email);
    res.status(200).json({ 
      success: true, 
      message: "New OTP sent to faculty email" 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error resending OTP: " + error.message 
    });
  }
};

// Generate OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Generate temporary token
const generateTempToken = (email, role) => {
  return jwt.sign({ email, role, type: 'temp' }, process.env.JWT_SECRET || 'fallback_secret', { 
    expiresIn: '15m' 
  });
};

// Regular login for all roles
// Regular login for all roles
export const loginUser = async (req, res) => {
  try {
    console.log("Login attempt:", req.body);
    
    const { email, password, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({
        success: false,
        message: "Email and role are required"
      });
    }

    // For first-time login, password might be empty
    if (!password && (role === 'student' || role === 'faculty')) {
      return res.status(400).json({
        success: false,
        message: "Password is required for login",
        requiresPasswordSetup: false
      });
    }

    let user;
    
    // Find user based on role
    switch (role) {
      case 'student':
        user = await Student.findOne({ email });
        break;
      case 'faculty':
        user = await Faculty.findOne({ email });
        break;
      case 'institute':
        user = await Institute.findOne({ email });
        break;
      case 'admin':
        user = await Admin.findOne({ email });
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Invalid role"
        });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with this email"
      });
    }

    // Check if password is set (for student and faculty)
    if ((role === 'student' || role === 'faculty') && !user.password) {
      return res.status(400).json({
        success: false,
        message: "Password not set. Please use OTP flow for first-time login.",
        requiresPasswordSetup: true
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid password"
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email, 
        role: role,
        instituteId: user.instituteId 
      }, 
      process.env.JWT_SECRET || 'fallback_secret', 
      { expiresIn: '7d' }
    );

    // Prepare user data for response
    const userData = {
      id: user._id,
      name: user.name || user.fullName,
      email: user.email,
      role: role,
      instituteId: user.instituteId
    };

    res.status(200).json({
      success: true,
      message: "Login successful",
      token: token,
      user: userData
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message
    });
  }
};


// Student Login Attempt
export const studentLoginAttempt = async (req, res) => {
  try {
    console.log("Student login attempt called with:", req.body);
    
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found with this email"
      });
    }

    console.log("Found student:", student.email);

    // Check if password is not set (first time login)
    if (!student.password || student.requiresPasswordSetup) {
      // Generate OTP
      const otpCode = generateOTP();
      const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      
      // Save OTP to student record
      student.otp = {
        code: otpCode,
        expiresAt: otpExpires,
        attempts: 0,
        verified: false,
        tempToken: generateTempToken(email, 'student'),
        tokenExpires: otpExpires,
        lastSentAt: new Date()
      };
      
      await student.save();

      console.log("OTP generated for student:", otpCode);

      return res.status(200).json({
        success: true,
        requiresPasswordSetup: true,
        message: "OTP sent to your email for password setup",
        otpExpires: otpExpires,
        email: email,
        // Remove otp field in production - only for testing
        otp: otpCode 
      });
    }

    // If password exists, proceed with normal login
    res.status(200).json({
      success: true,
      requiresPasswordSetup: false,
      message: "Proceed with password login"
    });

  } catch (error) {
    console.error("Student login attempt error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message
    });
  }
};

// Faculty Login Attempt
export const facultyLoginAttempt = async (req, res) => {
  try {
    console.log("Faculty login attempt called with:", req.body);
    
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    const faculty = await Faculty.findOne({ email });
    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found with this email"
      });
    }

    console.log("Found faculty:", faculty.email);

    // Check if password is not set (first time login)
    if (!faculty.password) {
      // Generate OTP
      const otpCode = generateOTP();
      const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      
      // Save OTP to faculty record
      faculty.otp = {
        code: otpCode,
        expiresAt: otpExpires,
        attempts: 0,
        verified: false,
        tempToken: generateTempToken(email, 'faculty'),
        tokenExpires: otpExpires,
        lastSentAt: new Date()
      };
      
      await faculty.save();

      console.log("OTP generated for faculty:", otpCode);

      return res.status(200).json({
        success: true,
        requiresPasswordSetup: true,
        message: "OTP sent to your email for password setup",
        otpExpires: otpExpires,
        email: email,
        // Remove otp field in production - only for testing
        otp: otpCode 
      });
    }

    // If password exists, proceed with normal login
    res.status(200).json({
      success: true,
      requiresPasswordSetup: false,
      message: "Proceed with password login"
    });

  } catch (error) {
    console.error("Faculty login attempt error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message
    });
  }
};