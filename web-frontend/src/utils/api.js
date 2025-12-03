/** @format */

// src/utils/api.js
import axios from "axios";

// Create a reusable Axios instance
export const API = axios.create({
  baseURL: "http://localhost:5000/api", // Update if backend URL changes
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle token expiration
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ========== AUTHENTICATION ENDPOINTS ==========
export const loginUser = async (credentials) => {
  try {
    const response = await API.post("/auth/login", credentials);
    return response.data;
  } catch (error) {
    console.error("Login error:", error.response?.data || error);
    throw error;
  }
};

export const registerInstitute = async (payload) => {
  try {
    const response = await API.post("/auth/institute-register", payload);
    return response.data;
  } catch (error) {
    console.error(
      "Error registering institute:",
      error.response?.data || error
    );
    throw error;
  }
};

// ========== OTP & PASSWORD SETUP ENDPOINTS ==========
export const initiateLoginAttempt = async (email, role) => {
  try {
    const endpoint = role === "student" 
      ? "/auth/student/login-attempt" 
      : "/auth/faculty/login-attempt";
    
    const response = await API.post(endpoint, { email });
    return response.data;
  } catch (error) {
    console.error("Error initiating login attempt:", error.response?.data || error);
    throw error;
  }
};

export const verifyOTP = async (email, otp, role) => {
  try {
    const endpoint = role === "student" 
      ? "/auth/student/verify-otp" 
      : "/auth/faculty/verify-otp";
    
    const response = await API.post(endpoint, { email, otp });
    return response.data;
  } catch (error) {
    console.error("Error verifying OTP:", error.response?.data || error);
    throw error;
  }
};

export const setupPassword = async (email, password, otp, role) => {
  try {
    const endpoint = role === "student" 
      ? "/auth/student/setup-password" 
      : "/auth/faculty/setup-password";
    
    const response = await API.post(endpoint, { email, password, otp });
    return response.data;
  } catch (error) {
    console.error("Error setting up password:", error.response?.data || error);
    throw error;
  }
};

export const resendOTP = async (email, role) => {
  try {
    const endpoint = role === "student" 
      ? "/auth/student/resend-otp" 
      : "/auth/faculty/resend-otp";
    
    const response = await API.post(endpoint, { email });
    return response.data;
  } catch (error) {
    console.error("Error resending OTP:", error.response?.data || error);
    throw error;
  }
};

// ========== INSTITUTE ENDPOINTS ==========
export const getInstituteById = async (id) => {
  try {
    const response = await API.get(`/institute/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching institute:", error.response?.data || error);
    throw error;
  }
};

// ========== FACULTY ENDPOINTS ==========
export const addFaculty = async (instituteId, facultyData) => {
  try {
    console.log(`📤 Adding faculty to institute ${instituteId}`);
    const response = await API.post(
      `/institute/${instituteId}/faculty`,
      facultyData
    );
    return response.data;
  } catch (error) {
    console.error("Error adding faculty:", error.response?.data || error);
    throw error;
  }
};

export const getFacultyByInstitute = async (instituteId) => {
  try {
    const response = await API.get(`/institute/${instituteId}/faculty`);
    console.log("📡 API Response structure:", {
      success: response.data?.success,
      hasData: !!response.data?.data,
      dataIsArray: Array.isArray(response.data?.data),
      dataLength: response.data?.data?.length,
    });
    return response.data; // This returns { success: true, data: [...] }
  } catch (error) {
    console.error("Error fetching faculty:", error.response?.data || error);
    throw error;
  }
};

// ========== STUDENT ENDPOINTS ==========
export const addStudent = async (instituteId, studentData) => {
  try {
    const response = await API.post(
      `/institute/${instituteId}/students`,
      studentData
    );
    return response.data;
  } catch (error) {
    console.error("Error adding student:", error.response?.data || error);
    throw error;
  }
};

export const getStudentsByInstitute = async (instituteId) => {
  try {
    const response = await API.get(`/institute/${instituteId}/students`);

    // Ensure consistent response format
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && response.data.students) {
      return response.data.students;
    } else if (response.data && response.data.data) {
      return response.data.data;
    } else {
      console.warn("Unexpected API response format:", response.data);
      return [];
    }
  } catch (error) {
    console.error("Error fetching students:", error);
    throw error;
  }
};

export const addStudentsBulk = async (instituteId, students) => {
  try {
    const response = await API.post(`/institute/${instituteId}/students/bulk`, {
      students,
    });
    return response.data;
  } catch (error) {
    console.error("Error adding bulk students:", error.response?.data || error);
    throw error;
  }
};

// ========== CHALLENGE ENDPOINTS ==========
export const getChallenges = async () => {
  try {
    const response = await API.get("/challenges");
    return response.data;
  } catch (error) {
    console.error("Error fetching challenges:", error.response?.data || error);
    throw error;
  }
};

export const deleteChallenge = async (id) => {
  try {
    const response = await API.delete(`/challenges/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting challenge:", error.response?.data || error);
    throw error;
  }
};

export const createChallenge = async (data) => {
  try {
    const response = await API.post("/challenges", data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating challenge:", error.response?.data || error);
    throw error;
  }
};

export const updateChallenge = async (id, data) => {
  try {
    const response = await API.put(`/challenges/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating challenge:", error.response?.data || error);
    throw error;
  }
};

// ========== ASSIGNMENT ENDPOINTS ==========
export const createChallengeAssignment = async (instituteId, data) => {
  try {
    const response = await API.post(
      `/institute/${instituteId}/assignments`,
      data
    );
    console.log("📤 Assignment created:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating assignment:", error.response?.data || error);
    throw error;
  }
};

export const getInstituteAssignments = async (instituteId, filters = {}) => {
  try {
    const response = await API.get(`/institute/${instituteId}/assignments`, {
      params: filters,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching assignments:", error.response?.data || error);
    throw error;
  }
};

export const getAssignmentDetails = async (assignmentId) => {
  try {
    const response = await API.get(`/assignments/${assignmentId}`);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching assignment details:",
      error.response?.data || error
    );
    throw error;
  }
};

export const updateAssignmentStatus = async (assignmentId, statusData) => {
  try {
    const response = await API.put(
      `/assignments/${assignmentId}/status`,
      statusData
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error updating assignment status:",
      error.response?.data || error
    );
    throw error;
  }
};

export const deleteAssignment = async (assignmentId) => {
  try {
    const response = await API.delete(`/assignments/${assignmentId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting assignment:", error.response?.data || error);
    throw error;
  }
};

export const getAssignmentStatistics = async (instituteId) => {
  try {
    const response = await API.get(
      `/institute/${instituteId}/assignment-stats`
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching assignment statistics:",
      error.response?.data || error
    );
    throw error;
  }
};

// ========== STUDENT PROGRESS ENDPOINTS ==========
export const getStudentChallengeProgress = async (studentId, filters = {}) => {
  try {
    const response = await API.get(`/student-progress/student/${studentId}`, {
      params: filters,
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching student progress:",
      error.response?.data || error
    );
    throw error;
  }
};

export const updateStudentProgress = async (progressId, progressData) => {
  try {
    const response = await API.put(
      `/student-progress/${progressId}`,
      progressData
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error updating student progress:",
      error.response?.data || error
    );
    throw error;
  }
};

export const submitChallengeCompletion = async (progressId, submissionData) => {
  try {
    const response = await API.post(
      `/student-progress/${progressId}/submit`,
      submissionData
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error submitting challenge completion:",
      error.response?.data || error
    );
    throw error;
  }
};

export const reviewStudentSubmission = async (progressId, reviewData) => {
  try {
    const response = await API.put(
      `/student-progress/${progressId}/review`,
      reviewData
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error reviewing student submission:",
      error.response?.data || error
    );
    throw error;
  }
};

// ========== USER PROFILE ENDPOINTS ==========
export const getUserProfile = async (userId) => {
  try {
    const response = await API.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error.response?.data || error);
    throw error;
  }
};

export const updateUserProfile = async (userId, userData) => {
  try {
    const response = await API.put(`/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error("Error updating user profile:", error.response?.data || error);
    throw error;
  }
};

// ========== DASHBOARD STATISTICS ==========
export const getDashboardStats = async (role, userId) => {
  try {
    const response = await API.get(`/dashboard/${role}/${userId}/stats`);
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error.response?.data || error);
    throw error;
  }
};
