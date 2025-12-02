// config.js
export const BASE_URL = "http://192.168.1.9:5000";

export const API_ENDPOINTS = {
  LOGIN: `${BASE_URL}/api/auth/login`,
  FORGOT_PASSWORD: `${BASE_URL}/api/auth/forgot-password`,
  VERIFY_OTP: `${BASE_URL}/api/auth/verify-otp`,
  RESET_PASSWORD: `${BASE_URL}/api/auth/reset-password`,

  REPORTS: `${BASE_URL}/api/reports`,
  TEST: `${BASE_URL}/`, 
};