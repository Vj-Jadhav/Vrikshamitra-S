// src/utils/api.js
import axios from "axios";

// Create a reusable Axios instance
export const API = axios.create({
  baseURL: "http://localhost:5000/api", // Update if backend URL changes
  headers: {
    "Content-Type": "application/json",
  },
});

// Add single student
export const addStudent = async (instituteId, studentData) => {
  try {
    const response = await API.post(`/institute/${instituteId}/students`, studentData);
    return response.data;
  } catch (error) {
    console.error("Error adding student:", error.response?.data || error);
    throw error;
  }
};

// Optional: Interceptors for logging or error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response || error.message);
    return Promise.reject(error);
  }
);

// ========== AUTH & INSTITUTE ENDPOINTS ==========
export const registerInstitute = async (payload) => {
  const response = await API.post("/auth/institute-register", payload);
  return response.data;
};

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
    const response = await API.post(`/institute/${instituteId}/faculty`, facultyData);
    return response.data;
  } catch (error) {
    console.error("Error adding faculty:", error.response?.data || error);
    throw error;
  }
};

export const getFacultyByInstitute = async (instituteId) => {
  try {
    console.log(`📥 Fetching faculty for institute ${instituteId}`);
    const response = await API.get(`/institute/${instituteId}/faculty`);
    return response.data;
  } catch (error) {
    console.error("Error fetching faculty:", error.response?.data || error);
    throw error;
  }
};

// ========== STUDENT ENDPOINTS ==========
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
      console.warn('Unexpected API response format:', response.data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching students:', error);
    throw error;
  }
};

export const addStudentsBulk = async (instituteId, students) => {
  try {
    const response = await API.post(`/institute/${instituteId}/students/bulk`, { students });
    return response.data;
  } catch (error) {
    console.error("Error adding bulk students:", error.response?.data || error);
    throw error;
  }
};

// ========== CHALLENGE ENDPOINTS ==========
export const getChallenges = () => API.get("/challenges");

export const deleteChallenge = (id) => API.delete(`/challenges/${id}`);

// FIXED: Add token parameter to createChallenge
export const createChallenge = (data, token) => {
  return API.post("/challenges", data, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

// FIXED: Add token parameter to updateChallenge
export const updateChallenge = (id, data, token) => {
  return API.put(`/challenges/${id}`, data, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

// ========== ASSIGNMENT ENDPOINTS ==========
export const createChallengeAssignment = async (instituteId,data) => {
  try {
    const response = await API.post(`/institute/${instituteId}/assignments`, data);
    console.log('📤 Assignment created:', response.data); // Debug log
    return response.data;
  } catch (error) {
    console.error('API Error Details:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
};

export const getInstituteAssignments = async (instituteId, filters = {}) => {
  const response = await API.get(`/institute/${instituteId}/assignments`, {
    params: filters
  });
  return response.data;
};

export const getAssignmentDetails = async (assignmentId) => {
  const response = await API.get(`/assignments/${assignmentId}`);
  return response.data;
};

export const updateAssignmentStatus = async (assignmentId, statusData) => {
  const response = await API.put(`/assignments/${assignmentId}/status`, statusData);
  return response.data;
};

export const deleteAssignment = async (assignmentId) => {
  const response = await API.delete(`/assignments/${assignmentId}`);
  return response.data;
};

export const getAssignmentStatistics = async (instituteId) => {
  const response = await API.get(`/institute/${instituteId}/assignment-stats`);
  return response.data;
};

// ========== STUDENT PROGRESS ENDPOINTS ==========
export const getStudentChallengeProgress = async (studentId, filters = {}) => {
  const response = await API.get(`/student-progress/student/${studentId}`, {
    params: filters
  });
  return response.data;
};

export const updateStudentProgress = async (progressId, progressData) => {
  const response = await API.put(`/student-progress/${progressId}`, progressData);
  return response.data;
};

export const submitChallengeCompletion = async (progressId, submissionData) => {
  const response = await API.post(`/student-progress/${progressId}/submit`, submissionData);
  return response.data;
};

export const reviewStudentSubmission = async (progressId, reviewData) => {
  const response = await API.put(`/student-progress/${progressId}/review`, reviewData);
  return response.data;
};