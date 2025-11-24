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

// API helper functions
export const addFaculty = async (instituteId, facultyData) => {
  const response = await API.post(`/auth/${instituteId}/faculty`, facultyData);
  return response.data;
};

export const getFacultyByInstitute = async (instituteId) => {
  const response = await API.get(`/auth/${instituteId}/faculty`);
  return response.data;
};


export const addStudentsBulk = async (instituteId, students) => {
  try {
    const response = await API.post(`/auth/bulk/${instituteId}`, { students });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const TEMP_ADMIN_ID = "000000000000000000000001";

export const getChallenges = () => API.get("/challenges");

export const deleteChallenge = (id) =>
  API.delete(`/challenges/${id}`);


export const createChallenge = (data) => {
  return API.post("/challenges", {
    ...data,
    createdBy: TEMP_ADMIN_ID
  });
};

export const updateChallenge = (id, data) => {
  return API.put(`/challenges/${id}`, {
    ...data,
    createdBy: TEMP_ADMIN_ID
  });
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
