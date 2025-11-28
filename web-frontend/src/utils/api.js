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

// ================================
// Faculty / Institute / Students
// ================================
export const addFaculty = async (instituteId, facultyData) => {
  const response = await API.post(`/auth/${instituteId}/faculty`, facultyData);
  return response.data;
};

export const getFacultyByInstitute = async (instituteId) => {
  const response = await API.get(`/auth/${instituteId}/faculty`);
  return response.data;
};

export const getInstituteById = async (id) => {
  try {
    const response = await API.get(`/government/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching institute:", error.response?.data || error);
    throw error;
  }
};

export const addStudentsBulk = async (instituteId, students) => {
  try {
    const response = await API.post(`/auth/bulk/${instituteId}`, { students });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// MERGE CONFLICT FIXED ✔ — imported both functions
export const getStudentsByInstitute = async (instituteId) => {
  try {
    const response = await API.get(`/institute/${instituteId}`);
    return response.data.data; // returns student list
  } catch (error) {
    console.error("Error fetching students:", error.response?.data || error);
    throw error;
  }
};

const TEMP_ADMIN_ID = "000000000000000000000001";

// ======================
// Challenge API
// ======================
export const getChallenges = () => API.get("/challenges");

export const deleteChallenge = (id) => API.delete(`/challenges/${id}`);

export const createChallenge = (data) => {
  return API.post("/challenges", {
    ...data,
    createdBy: TEMP_ADMIN_ID,
  });
};

export const updateChallenge = (id, data) => {
  return API.put(`/challenges/${id}`, {
    ...data,
    createdBy: TEMP_ADMIN_ID,
  });
};

// ================================
// Challenge Assignment APIs
// ================================
export const createChallengeAssignment = async (data) => {
  try {
    const response = await API.post(`/institute/assignments`, data);
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
  const response = await API.get(
    `/challenge-assignments/institute/${instituteId}/assignments`,
    { params: filters }
  );
  return response.data;
};

export const getAssignmentDetails = async (assignmentId) => {
  const response = await API.get(
    `/challenge-assignments/assignments/${assignmentId}`
  );
  return response.data;
};

export const updateAssignmentStatus = async (assignmentId, statusData) => {
  const response = await API.put(
    `/challenge-assignments/assignments/${assignmentId}/status`,
    statusData
  );
  return response.data;
};

export const deleteAssignment = async (assignmentId) => {
  const response = await API.delete(
    `/challenge-assignments/assignments/${assignmentId}`
  );
  return response.data;
};

export const getAssignmentStatistics = async (instituteId) => {
  const response = await API.get(
    `/challenge-assignments/institute/${instituteId}/assignment-stats`
  );
  return response.data;
};

// ================================
// Student Challenge Progress APIs
// ================================
export const getStudentChallengeProgress = async (studentId, filters = {}) => {
  const response = await API.get(
    `/student-progress/student/${studentId}`,
    { params: filters }
  );
  return response.data;
};

export const updateStudentProgress = async (progressId, progressData) => {
  const response = await API.put(`/student-progress/${progressId}`, progressData);
  return response.data;
};

export const submitChallengeCompletion = async (progressId, submissionData) => {
  const response = await API.post(
    `/student-progress/${progressId}/submit`,
    submissionData
  );
  return response.data;
};

export const reviewStudentSubmission = async (progressId, reviewData) => {
  const response = await API.put(
    `/student-progress/${progressId}/review`,
    reviewData
  );
  return response.data;
};
