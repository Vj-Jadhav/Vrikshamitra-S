// src/utils/instituteApi.js
import { API } from './api';

export const instituteApi = {
  // Get institute statistics
  getStats: async (instituteId) => {
    const response = await API.get(`/institute/${instituteId}/stats`);
    return response.data;
  },

  // Get faculty list
  getFaculty: async (instituteId, filters = {}) => {
    const response = await API.get(`/institute/${instituteId}/faculty`, { params: filters });
    return response.data;
  },

  // Get student list
  getStudents: async (instituteId, filters = {}) => {
    const response = await API.get(`/institute/${instituteId}/students`, { params: filters });
    return response.data;
  },

  // Update institute profile
  updateProfile: async (instituteId, data) => {
    const response = await API.put(`/institute/${instituteId}/profile`, data);
    return response.data;
  },

  // Add new faculty
  addFaculty: async (instituteId, facultyData) => {
    const response = await API.post(`/institute/${instituteId}/faculty`, facultyData);
    return response.data;
  },

  // Add new student
  addStudent: async (instituteId, studentData) => {
    const response = await API.post(`/institute/${instituteId}/students`, studentData);
    return response.data;
  }
};