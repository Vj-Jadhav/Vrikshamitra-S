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

export const registerInstitute = async (payload) => {
  const response = await API.post("/auth/institute-register", payload);
  return response.data;
};


// API helper functions
export const addFaculty = async (instituteId, facultyData) => {
  const response = await API.post(`/institute/${instituteId}/faculty`, facultyData);
  return response.data;
};

export const getFacultyByInstitute = async (instituteId) => {
  const response = await API.get(`/institute/${instituteId}/faculty`);
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
    const response = await API.post(`/institute/bulk/${instituteId}`, { students });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getStudentsByInstitute = async (instituteId) => {
  try {
    const response = await API.get(`/institute/${instituteId}`);
    return response.data.data; // returns array of students
  } catch (error) {
    console.error("Error fetching students:", error.response?.data || error);
    throw error;
  }
};


export const getChallenges = () => API.get("/challenges");

export const deleteChallenge = (id) =>
  API.delete(`/challenges/${id}`);


export const createChallenge = (data) => {
  return API.post("/challenges", data);
};

export const updateChallenge = (id, data) => {
  return API.put(`/challenges/${id}`, data);
};


// In your api.js
export const createChallengeAssignment = async (data) => {
  try {
    const response = await API.post('/institute/assignments', data);
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


// Get assignments for institute
export const getInstituteAssignments = async (instituteId, filters = {}) => {
  const response = await API.get(`/challenge-assignments/institute/${instituteId}/assignments`, {
    params: filters
  });
  return response.data;
};

// Get assignment details with student progress
export const getAssignmentDetails = async (assignmentId) => {
  const response = await API.get(`/challenge-assignments/assignments/${assignmentId}`);
  return response.data;
};

// Update assignment status
export const updateAssignmentStatus = async (assignmentId, statusData) => {
  const response = await API.put(`/challenge-assignments/assignments/${assignmentId}/status`, statusData);
  return response.data;
};

// Delete assignment
export const deleteAssignment = async (assignmentId) => {
  const response = await API.delete(`/challenge-assignments/assignments/${assignmentId}`);
  return response.data;
};

// Get assignment statistics
export const getAssignmentStatistics = async (instituteId) => {
  const response = await API.get(`/challenge-assignments/institute/${instituteId}/assignment-stats`);
  return response.data;
};

// Get student's challenge progress
export const getStudentChallengeProgress = async (studentId, filters = {}) => {
  const response = await API.get(`/student-progress/student/${studentId}`, {
    params: filters
  });
  return response.data;
};

// Update student progress
export const updateStudentProgress = async (progressId, progressData) => {
  const response = await API.put(`/student-progress/${progressId}`, progressData);
  return response.data;
};

// Submit challenge completion
export const submitChallengeCompletion = async (progressId, submissionData) => {
  const response = await API.post(`/student-progress/${progressId}/submit`, submissionData);
  return response.data;
};

// Review student submission
export const reviewStudentSubmission = async (progressId, reviewData) => {
  const response = await API.put(`/student-progress/${progressId}/review`, reviewData);
  return response.data;
};


// export const getGames = async () => {
//   try {
//     const response = await API.get("/games");
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// export const addScore = async (data) => {
//   try {
//     const response = await API.post("/scores", data);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// export const getLeaderboard = async () => {
//   try {
//     const response = await API.get("/leaderboard");
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };
