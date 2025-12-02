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
    console.log(`📥 Fetching faculty for institute ${instituteId}`);
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

export const createChallenge = async (data, token) => {
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

export const updateChallenge = async (id, data, token) => {
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
    console.error("API Error Details:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
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
