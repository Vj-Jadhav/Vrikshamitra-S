import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Institute, School, College, University } from "../models/BaseInstituteSchema.js";
import Faculty from "../models/Faculty.js";
import Student from "../models/Student.js";
import Admin from "../models/AdminSchema.js";
import crypto from "crypto";
import { sendOTPEmail } from "../utils/emailService.js";

// ===============================
// ⭐ REGISTER INSTITUTE
// ===============================
export const registerInstitute = async (req, res) => {
  try {
    const {
      instituteName, instituteCode, email, password, instituteType,
      accreditation, affiliation, address, city, state, country, pincode,
      phone, website, alternatePhone, totalStudents, totalStaff, totalFaculty,
      establishedYear, campusArea, infrastructure, principalName, principalEmail,
      principalPhone, principalQualification, principalExperience, academicSession,
      workingDays, schoolLevel, grades, board, departments, courses, universityAffiliated,
      faculties, programs, researchCenters
    } = req.body;

    if (!instituteName || !email || !password || !instituteType) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const exists = await Institute.findOne({ email });
    if (exists) return res.status(409).json({ message: "Email already registered" });

    if (instituteCode) {
      const codeExists = await Institute.findOne({ instituteCode });
      if (codeExists) return res.status(409).json({ message: "Institute code already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let payload = {
      instituteName,
      instituteCode: instituteCode || `INST_${Date.now()}`,
      email,
      password: hashedPassword,
      accreditation: accreditation || "",
      affiliation: affiliation || "",
      address, city, state, country, pincode, phone, website, alternatePhone,
      totalStudents: parseInt(totalStudents) || 0,
      totalStaff: parseInt(totalStaff) || 0,
      totalFaculty: parseInt(totalFaculty) || 0,
      establishedYear: parseInt(establishedYear) || null,
      campusArea,
      infrastructure: Array.isArray(infrastructure) ? infrastructure : infrastructure ? [infrastructure] : [],
      principalName, principalEmail, principalPhone,
      principalQualification, principalExperience,
      academicSession,
      workingDays: Array.isArray(workingDays) ? workingDays : workingDays ? [workingDays] : []
    };

    switch (instituteType) {
      case "school":
        if (!schoolLevel) return res.status(400).json({ message: "School level required" });
        if (!board) return res.status(400).json({ message: "Board required" });
        payload = { ...payload, schoolLevel, grades: grades || [], board };
        break;

      case "college":
        if (!departments?.length) return res.status(400).json({ message: "Departments required" });
        payload = {
          ...payload, departments, courses: courses || [], universityAffiliated: universityAffiliated || ""
        };
        break;

      case "university":
        if (!faculties?.length) return res.status(400).json({ message: "At least one faculty required" });
        payload = {
          ...payload,
          faculties: faculties.map(f => ({ name: f.name, departments: f.departments || [] })),
          programs: programs || [],
          researchCenters: researchCenters || []
        };
        break;

      default: return res.status(400).json({ message: "Invalid institute type" });
    }

    let institute;
    if (instituteType === "school") institute = await School.create(payload);
    if (instituteType === "college") institute = await College.create(payload);
    if (instituteType === "university") institute = await University.create(payload);

    return res.status(201).json({
      message: "Institute registered successfully",
      institute: {
        id: institute._id,
        instituteName: institute.instituteName,
        instituteCode: institute.instituteCode,
        email: institute.email,
        instituteType: institute.instituteType,
        principalName: institute.principalName
      }
    });

  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: "Duplicate entry" });
    return res.status(500).json({ message: err.message });
  }
};

// ===============================
// 🔹 ADMIN REGISTER USER
// ===============================
export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) return res.status(400).json({ message: "Fill all fields" });

    const exists = await Admin.findOne({ email });
    if (exists) return res.status(409).json({ message: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await Admin.create({ fullName, email, password: hashed });

    res.status(201).json({ message: "User registered", user });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===============================
// 🔹 LOGIN (UPDATED WITH FACULTY FIX)
// ===============================
export const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    console.log("Login attempt:", { email, role });

    if (!email || !password || !role) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    let user;
    let userData = {};

    switch (role) {
      case "student":
        user = await Student.findOne({ email: email.toLowerCase().trim() });
        console.log("Student found:", user ? "Yes" : "No");
        if (!user) return res.status(404).json({ message: "Student not found" });
        
        if (user.status !== "active") {
          return res.status(403).json({ message: "Student account is not active" });
        }

        // Check if student requires password setup
        if (user.requiresPasswordSetup) {
          return res.status(200).json({
            success: true,
            requiresPasswordSetup: true,
            message: "Password setup required",
            email: user.email,
            role: role
          });
        }

        userData = {
          id: user._id,
          name: user.name,
          email: user.email,
          role,
          instituteId: user.instituteId,
          grade: user.grade,
          rollNumber: user.rollNumber,
          batch: user.batch,
          section: user.section,
        };
        break;

      case "faculty":
        user = await Faculty.findOne({ email: email.toLowerCase().trim() });
        console.log("Faculty found:", user ? "Yes" : "No");
        if (!user) return res.status(404).json({ message: "Faculty not found" });

        // ✅ CRITICAL FIX: Check if faculty requires password setup
        if (user.requiresPasswordSetup) {
          console.log("Faculty requires password setup, redirecting...");
          return res.status(200).json({
            success: true,
            requiresPasswordSetup: true,
            message: "Password setup required",
            email: user.email,
            role: role
          });
        }

        userData = {
          id: user._id,
          name: user.name,
          email: user.email,
          role,
          instituteId: user.instituteId,
          department: user.department,
          subjects: user.subjects,
        };
        break;

      case "institute":
        user = await Institute.findOne({ email: email.toLowerCase().trim() });
        if (!user) return res.status(404).json({ message: "Institute not found" });
        if (!user.approvalStatus) {
          return res.status(403).json({ message: "Institute not approved yet" });
        }
        userData = {
          id: user._id,
          name: user.instituteName,
          email: user.email,
          role,
        };
        break;

      case "admin":
        user = await Admin.findOne({ email: email.toLowerCase().trim() });
        if (!user) return res.status(404).json({ message: "Admin not found" });
        userData = {
          id: user._id,
          name: user.fullName,
          email: user.email,
          role,
        };
        break;

      default:
        return res.status(400).json({ message: "Invalid role" });
    }

    if (!user.password) {
      return res.status(400).json({ message: "Password not set. Please use password setup flow." });
    }

    console.log("Comparing password for:", user.email);
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Incorrect password" });

    const token = jwt.sign(
      { id: user._id, role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const response = {
      message: "Login successful",
      token,
      user: userData,
      requiresPasswordSetup: false // ✅ Explicitly set to false
    };

    if (role === "student") {
      response.student = {
        id: user._id,
        name: user.name,
        email: user.email,
        instituteId: user.instituteId,
        grade: user.grade,
        rollNumber: user.rollNumber,
        batch: user.batch,
        section: user.section,
        status: user.status,
      };
    } else if (role === "faculty") {
      response.faculty = {
        id: user._id,
        name: user.name,
        email: user.email,
        instituteId: user.instituteId,
        department: user.department,
        subjects: user.subjects,
        status: user.status,
      };
    }

    console.log("Login successful, sending response");
    return res.status(200).json(response);

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: err.message });
  }
};

// ===============================
// 📌 ADD FACULTY (UPDATED WITH PASSWORD SETUP FIX)
// ===============================
export const addFaculty = async (req, res) => {
  try {
    const { instituteId } = req.params;
    const { name, email, phone, department, subjects } = req.body;

    if (!name || !email || !department)
      return res.status(400).json({ message: "Required: name email department" });

    const inst = await Institute.findById(instituteId);
    if (!inst) return res.status(404).json({ message: "Institute not found" });

    // ✅ Create faculty with requiresPasswordSetup: false by default
    const faculty = await Faculty.create({ 
      name, 
      email, 
      phone, 
      department, 
      subjects, 
      instituteId,
      requiresPasswordSetup: false, // ✅ Explicitly set to false
      isVerified: true // ✅ Set to true
    });
    
    res.status(201).json({
      message: "Faculty added successfully",
      faculty: {
        id: faculty._id,
        name: faculty.name,
        email: faculty.email,
        department: faculty.department,
        requiresPasswordSetup: faculty.requiresPasswordSetup
      }
    });

  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Faculty with this email already exists" });
    }
    res.status(500).json({ message: "Error adding faculty: " + err.message });
  }
};

// ===============================
// 📌 GET FACULTY BY INSTITUTE
// ===============================
export const getFacultyByInstitute = async (req, res) => {
  try {
    const { instituteId } = req.params;
    const staff = await Faculty.find({ instituteId: instituteId });
    res.status(200).json({
      success: true,
      data: staff,
      count: staff.length
    });
  } catch (error) {
    res.status(500).json({ message: "Faculty fetch error: " + error.message });
  }
};

// ===============================
// 🔹 BULK STUDENT IMPORT
// ===============================
export const addStudentsBulk = async (req, res) => {
  try {
    const { students } = req.body;
    const { instituteId } = req.params;

    if (!students?.length) return res.status(400).json({ message: "No students provided" });

    const studentsWithHashedPasswords = await Promise.all(
      students.map(async (student) => {
        const hashedPassword = await bcrypt.hash(student.password || 'defaultPassword123', 10);
        return {
          ...student,
          instituteId,
          password: hashedPassword,
          status: student.status || 'active',
          joinDate: student.joinDate || new Date()
        };
      })
    );

    const savedStudents = await Student.insertMany(studentsWithHashedPasswords);

    res.status(201).json({
      message: `${savedStudents.length} students added successfully`,
      students: savedStudents
    });
  } catch (error) {
    console.error('Error adding students in bulk:', error);
    res.status(500).json({ message: 'Failed to upload students: ' + error.message });
  }
};

// ===============================
// 🔥 WEBSITE BRANCH REQUIRED EXPORTS
// ===============================
export const getAllInstitutes = async (req, res) => {
  try { 
    const institutes = await Institute.find();
    res.status(200).json({ 
      success: true, 
      data: institutes,
      count: institutes.length
    });
  } catch (err) { 
    res.status(500).json({ message: err.message });
  }
};

export const approveInstitute = async (req, res) => {
  try {
    const institute = await Institute.findByIdAndUpdate(
      req.params.id, 
      { approvalStatus: true }, 
      { new: true }
    );
    if (!institute) return res.status(404).json({ message: "Institute not found" });
    res.status(200).json({ 
      success: true,
      message: "Institute approved", 
      data: institute 
    });
  } catch (err) { 
    res.status(500).json({ message: err.message });
  }
};

export const rejectInstitute = async (req, res) => {
  try {
    const institute = await Institute.findByIdAndDelete(req.params.id);
    if (!institute) return res.status(404).json({ message: "Institute not found" });
    res.status(200).json({ message: "Institute removed" });
  } catch (err) { 
    res.status(500).json({ message: err.message });
  }
};

export const getInstituteById = async (req, res) => {
  try {
    const institute = await Institute.findById(req.params.id);
    if (!institute) return res.status(404).json({ message: "Institute not found" });
    res.status(200).json({ 
      success: true, 
      data: institute 
    });
  } catch (err) { 
    res.status(500).json({ message: err.message });
  }
};

// ===============================
// 🔹 FORGOT PASSWORD (UPDATED - COMPATIBLE WITH STUDENT MODEL)
// ===============================
export const forgotPassword = async (req, res) => {
  try {
    const { email, role } = req.body;

    console.log("Forgot password request:", { email, role });

    if (!email || !role) {
      return res.status(400).json({ 
        success: false,
        message: "Email and role are required" 
      });
    }

    let user;
    
    // Find user based on role
    switch (role) {
      case "student":
        user = await Student.findOne({ email: email.toLowerCase().trim() });
        break;
      case "faculty":
        user = await Faculty.findOne({ email: email.toLowerCase().trim() });
        break;
      case "institute":
        user = await Institute.findOne({ email: email.toLowerCase().trim() });
        break;
      default:
        return res.status(400).json({ 
          success: false,
          message: "Invalid role. Must be 'student', 'faculty', or 'institute'" 
        });
    }

    if (!user) {
      console.log("User not found for email:", email);
      return res.status(404).json({ 
        success: false,
        message: `${role} not found with this email` 
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    console.log(`Generated OTP for ${email}: ${otp}`);

    // Save OTP based on user type
    if (role === "student") {
      // Use the existing OTP structure from Student model
      user.otp = {
        code: otp,
        expiresAt: otpExpiry,
        attempts: 0,
        verified: false,
        tempToken: null,
        tokenExpires: null,
        lastSentAt: new Date(),
        resendCount: (user.otp?.resendCount || 0) + 1
      };
    } else {
      // For faculty and institute, use flat reset fields
      user.resetOTP = otp;
      user.resetOTPExpiry = otpExpiry;
    }

    await user.save();

    // Send OTP via email
    try {
      await sendOTPEmail(email, otp, role);
      console.log(`OTP email sent successfully to ${email}`);
      
      return res.status(200).json({
        success: true,
        message: "Password reset OTP has been sent to your email",
        email: email,
        role: role
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      
      // For testing purposes, return OTP in response
      return res.status(200).json({
        success: true,
        message: "OTP generated. Check server logs for OTP (email service failed).",
        email: email,
        role: role,
        otp: otp, // Include OTP for testing
        note: "Development mode - OTP shown due to email service issue"
      });
    }

  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Server error during password reset process: " + error.message 
    });
  }
};

// ===============================
// 🔹 VERIFY OTP (UPDATED - COMPATIBLE WITH STUDENT MODEL)
// ===============================
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp, role } = req.body;
    
    console.log("OTP verification request:", { email, otp, role });
    
    if (!email || !otp || !role) {
      return res.status(400).json({ 
        success: false,
        message: "Email, OTP and role are required" 
      });
    }

    let user;
    
    switch (role) {
      case "student":
        user = await Student.findOne({ email: email.toLowerCase().trim() });
        break;
      case "faculty":
        user = await Faculty.findOne({ email: email.toLowerCase().trim() });
        break;
      case "institute":
        user = await Institute.findOne({ email: email.toLowerCase().trim() });
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
        message: "User not found" 
      });
    }

    // Check OTP based on user type
    let isOTPValid = false;
    let resetToken;
    
    if (role === "student") {
      // Use Student model's OTP structure
      if (user.otp && user.otp.code === otp && user.otp.expiresAt > new Date()) {
        isOTPValid = true;
        resetToken = crypto.randomBytes(32).toString('hex');
        
        user.otp.verified = true;
        user.otp.tempToken = resetToken;
        user.otp.tokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      }
    } else {
      // For faculty and institute
      if (user.resetOTP === otp && user.resetOTPExpiry > new Date()) {
        isOTPValid = true;
        resetToken = crypto.randomBytes(32).toString('hex');
        
        user.resetToken = resetToken;
        user.resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);
        user.resetOTP = null;
        user.resetOTPExpiry = null;
      }
    }

    if (!isOTPValid) {
      // Increment OTP attempts for students
      if (role === "student" && user.otp) {
        user.otp.attempts += 1;
        await user.save();
      }
      
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP"
      });
    }

    await user.save();
    console.log(`OTP verified successfully for ${email}`);

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      resetToken: resetToken
    });

  } catch (error) {
    console.error("OTP verification error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Server error during OTP verification: " + error.message 
    });
  }
};

// ===============================
// 🔹 RESET PASSWORD (UPDATED - COMPATIBLE WITH STUDENT MODEL)
// ===============================
export const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword, role, email } = req.body;
    
    console.log("Reset password request:", { resetToken, role, email });
    
    if (!resetToken || !newPassword || !role) {
      return res.status(400).json({ 
        success: false,
        message: "Reset token, new password and role are required" 
      });
    }

    let user;
    let query = {};
    
    // Build query based on user type
    if (role === "student") {
      query = {
        "otp.tempToken": resetToken,
        "otp.tokenExpires": { $gt: new Date() }
      };
      if (email) {
        query.email = email.toLowerCase().trim();
      }
      user = await Student.findOne(query);
    } else {
      query = {
        resetToken: resetToken,
        resetTokenExpiry: { $gt: new Date() }
      };
      if (email) {
        query.email = email.toLowerCase().trim();
      }
      
      switch (role) {
        case "faculty":
          user = await Faculty.findOne(query);
          break;
        case "institute":
          user = await Institute.findOne(query);
          break;
      }
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token"
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset fields based on user type
    user.password = hashedPassword;
    
    if (role === "student") {
      // Clear OTP data using the model's method
      if (user.clearResetData) {
        user.clearResetData();
      } else {
        // Fallback if method doesn't exist
        user.otp = {
          code: null,
          expiresAt: null,
          attempts: 0,
          verified: false,
          tempToken: null,
          tokenExpires: null,
          lastSentAt: null,
          resendCount: 0
        };
      }
      user.requiresPasswordSetup = false;
      user.isVerified = true;
    } else {
      // Clear reset fields for faculty/institute
      user.resetToken = null;
      user.resetTokenExpiry = null;
      user.resetOTP = null;
      user.resetOTPExpiry = null;
    }

    await user.save();

    console.log(`Password reset successfully for ${user.email}`);

    return res.status(200).json({
      success: true,
      message: "Password has been reset successfully"
    });

  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Server error during password reset: " + error.message 
    });
  }
};

// ===============================
// 🔹 GET USER DETAILS
// ===============================
export const getUserDetails = (req, res) => res.json({ user: req.user });

// ===============================
// 🔹 LEGACY FUNCTIONS (KEPT FOR COMPATIBILITY)
// ===============================
export const studentLoginAttempt = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: "Email is required" 
      });
    }

    const student = await Student.findOne({ email: email.toLowerCase().trim() });
    
    if (!student) {
      return res.status(404).json({ 
        success: false,
        message: "Student not found" 
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to student
    student.otp = {
      code: otp,
      expiresAt: otpExpiry,
      attempts: 0,
      verified: false,
      tempToken: null,
      tokenExpires: null,
      lastSentAt: new Date(),
      resendCount: (student.otp?.resendCount || 0) + 1
    };

    await student.save();

    // Send OTP via email
    try {
      await sendOTPEmail(email, otp, "student");
      
      return res.status(200).json({
        success: true,
        requiresPasswordSetup: student.requiresPasswordSetup,
        message: "OTP sent to your email",
        email: email,
        role: "student"
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      
      return res.status(200).json({
        success: true,
        requiresPasswordSetup: student.requiresPasswordSetup,
        message: "OTP generated but email failed",
        email: email,
        role: "student",
        otp: otp, // Include OTP for testing
        note: "Development mode - OTP shown due to email service issue"
      });
    }

  } catch (error) {
    console.error("Student login attempt error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Server error: " + error.message 
    });
  }
};

export const facultyLoginAttempt = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: "Email is required" 
      });
    }

    const faculty = await Faculty.findOne({ email: email.toLowerCase().trim() });
    
    if (!faculty) {
      return res.status(404).json({ 
        success: false,
        message: "Faculty not found" 
      });
    }

    // Check if faculty requires password setup
    if (faculty.requiresPasswordSetup) {
      // Generate OTP for password setup
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

      // Save OTP to faculty
      faculty.otp = {
        code: otp,
        expiresAt: otpExpiry,
        attempts: 0,
        verified: false,
        tempToken: null,
        tokenExpires: null,
        lastSentAt: new Date(),
        resendCount: (faculty.otp?.resendCount || 0) + 1
      };

      await faculty.save();

      // Send OTP via email
      try {
        await sendOTPEmail(email, otp, "faculty");
        
        return res.status(200).json({
          success: true,
          requiresPasswordSetup: true,
          message: "OTP sent to your email for password setup",
          email: email,
          role: "faculty"
        });
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
        
        return res.status(200).json({
          success: true,
          requiresPasswordSetup: true,
          message: "OTP generated but email failed",
          email: email,
          role: "faculty",
          otp: otp,
          note: "Development mode - OTP shown due to email service issue"
        });
      }
    } else {
      // Faculty doesn't require password setup - proceed to normal login
      return res.status(200).json({
        success: true,
        requiresPasswordSetup: false,
        message: "Proceed with password login",
        email: email,
        role: "faculty"
      });
    }

  } catch (error) {
    console.error("Faculty login attempt error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Server error: " + error.message 
    });
  }
};

export const verifyStudentOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ 
        success: false,
        message: "Email and OTP are required" 
      });
    }

    const student = await Student.findOne({ email: email.toLowerCase().trim() });
    
    if (!student) {
      return res.status(404).json({ 
        success: false,
        message: "Student not found" 
      });
    }

    // Verify OTP
    if (!student.otp || student.otp.code !== otp || student.otp.expiresAt <= new Date()) {
      // Increment attempts
      if (student.otp) {
        student.otp.attempts += 1;
        await student.save();
      }
      
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP"
      });
    }

    // Generate temp token
    const tempToken = crypto.randomBytes(32).toString('hex');
    
    student.otp.verified = true;
    student.otp.tempToken = tempToken;
    student.otp.tokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    
    await student.save();

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      tempToken: tempToken,
      requiresPasswordSetup: student.requiresPasswordSetup
    });

  } catch (error) {
    console.error("Verify student OTP error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Server error: " + error.message 
    });
  }
};

export const verifyFacultyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ 
        success: false,
        message: "Email and OTP are required" 
      });
    }

    const faculty = await Faculty.findOne({ email: email.toLowerCase().trim() });
    
    if (!faculty) {
      return res.status(404).json({ 
        success: false,
        message: "Faculty not found" 
      });
    }

    // Verify OTP
    if (!faculty.otp || faculty.otp.code !== otp || faculty.otp.expiresAt <= new Date()) {
      // Increment attempts
      if (faculty.otp) {
        faculty.otp.attempts += 1;
        await faculty.save();
      }
      
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP"
      });
    }

    // Generate temp token
    const tempToken = crypto.randomBytes(32).toString('hex');
    
    faculty.otp.verified = true;
    faculty.otp.tempToken = tempToken;
    faculty.otp.tokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    
    await faculty.save();

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      tempToken: tempToken,
      requiresPasswordSetup: faculty.requiresPasswordSetup
    });

  } catch (error) {
    console.error("Verify faculty OTP error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Server error: " + error.message 
    });
  }
};

export const setStudentPassword = async (req, res) => {
  try {
    const { email, tempToken, password } = req.body;
    
    if (!email || !tempToken || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Email, temp token and password are required" 
      });
    }

    const student = await Student.findOne({ 
      email: email.toLowerCase().trim(),
      "otp.tempToken": tempToken,
      "otp.tokenExpires": { $gt: new Date() }
    });
    
    if (!student) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token"
      });
    }

    // Hash and set new password
    const hashedPassword = await bcrypt.hash(password, 10);
    student.password = hashedPassword;
    student.requiresPasswordSetup = false;
    student.isVerified = true;
    
    // Clear OTP data
    student.otp = {
      code: null,
      expiresAt: null,
      attempts: 0,
      verified: false,
      tempToken: null,
      tokenExpires: null,
      lastSentAt: null,
      resendCount: 0
    };
    
    await student.save();

    // Generate JWT token for auto-login
    const token = jwt.sign(
      { id: student._id, role: "student", email: student.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Password set successfully",
      token: token,
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        role: "student",
        instituteId: student.instituteId,
        grade: student.grade,
        rollNumber: student.rollNumber,
        batch: student.batch,
        section: student.section,
        status: student.status,
      }
    });

  } catch (error) {
    console.error("Set student password error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Server error: " + error.message 
    });
  }
};

export const setFacultyPassword = async (req, res) => {
  try {
    const { email, tempToken, password } = req.body;
    
    if (!email || !tempToken || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Email, temp token and password are required" 
      });
    }

    const faculty = await Faculty.findOne({ 
      email: email.toLowerCase().trim(),
      "otp.tempToken": tempToken,
      "otp.tokenExpires": { $gt: new Date() }
    });
    
    if (!faculty) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token"
      });
    }

    // Hash and set new password
    const hashedPassword = await bcrypt.hash(password, 10);
    faculty.password = hashedPassword;
    faculty.requiresPasswordSetup = false;
    faculty.isVerified = true;
    
    // Clear OTP data
    faculty.otp = {
      code: null,
      expiresAt: null,
      attempts: 0,
      verified: false,
      tempToken: null,
      tokenExpires: null,
      lastSentAt: null,
      resendCount: 0
    };
    
    await faculty.save();

    // Generate JWT token for auto-login
    const token = jwt.sign(
      { id: faculty._id, role: "faculty", email: faculty.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Password set successfully",
      token: token,
      faculty: {
        id: faculty._id,
        name: faculty.name,
        email: faculty.email,
        role: "faculty",
        instituteId: faculty.instituteId,
        department: faculty.department,
        subjects: faculty.subjects,
        status: faculty.status,
      }
    });

  } catch (error) {
    console.error("Set faculty password error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Server error: " + error.message 
    });
  }
};

export const resendStudentOTP = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: "Email is required" 
      });
    }

    const student = await Student.findOne({ email: email.toLowerCase().trim() });
    
    if (!student) {
      return res.status(404).json({ 
        success: false,
        message: "Student not found" 
      });
    }

    // Check resend limits
    if (student.otp?.resendCount >= 3) {
      return res.status(429).json({
        success: false,
        message: "Maximum OTP resend attempts reached. Please try again later."
      });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // Update OTP
    student.otp = {
      code: otp,
      expiresAt: otpExpiry,
      attempts: 0,
      verified: false,
      tempToken: null,
      tokenExpires: null,
      lastSentAt: new Date(),
      resendCount: (student.otp?.resendCount || 0) + 1
    };

    await student.save();

    // Send OTP via email
    try {
      await sendOTPEmail(email, otp, "student");
      
      return res.status(200).json({
        success: true,
        message: "New OTP sent to your email"
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      
      return res.status(200).json({
        success: true,
        message: "New OTP generated but email failed",
        otp: otp,
        note: "Development mode - OTP shown due to email service issue"
      });
    }

  } catch (error) {
    console.error("Resend student OTP error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Server error: " + error.message 
    });
  }
};

export const resendFacultyOTP = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: "Email is required" 
      });
    }

    const faculty = await Faculty.findOne({ email: email.toLowerCase().trim() });
    
    if (!faculty) {
      return res.status(404).json({ 
        success: false,
        message: "Faculty not found" 
      });
    }

    // Check resend limits
    if (faculty.otp?.resendCount >= 3) {
      return res.status(429).json({
        success: false,
        message: "Maximum OTP resend attempts reached. Please try again later."
      });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // Update OTP
    faculty.otp = {
      code: otp,
      expiresAt: otpExpiry,
      attempts: 0,
      verified: false,
      tempToken: null,
      tokenExpires: null,
      lastSentAt: new Date(),
      resendCount: (faculty.otp?.resendCount || 0) + 1
    };

    await faculty.save();

    // Send OTP via email
    try {
      await sendOTPEmail(email, otp, "faculty");
      
      return res.status(200).json({
        success: true,
        message: "New OTP sent to your email"
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      
      return res.status(200).json({
        success: true,
        message: "New OTP generated but email failed",
        otp: otp,
        note: "Development mode - OTP shown due to email service issue"
      });
    }

  } catch (error) {
    console.error("Resend faculty OTP error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Server error: " + error.message 
    });
  }
};