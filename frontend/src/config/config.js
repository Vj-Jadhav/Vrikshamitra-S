// config.js
export const BASE_URL = "http://10.39.251.155:5000";

export const API_ENDPOINTS = {
  LOGIN: `${BASE_URL}/api/auth/login`,
  FORGOT_PASSWORD: `${BASE_URL}/api/auth/forgot-password`,
  VERIFY_OTP: `${BASE_URL}/api/auth/verify-otp`,
  RESET_PASSWORD: `${BASE_URL}/api/auth/reset-password`,

  REPORTS: `${BASE_URL}/api/reports`,
  TEST: `${BASE_URL}/`, 
  COMPLAINTS: `${BASE_URL}/api/reports`,
  SCHEDULE_CLEANUP: `${BASE_URL}/api/reports/schedule`,
  SCHEDULE_COUNTS: `${BASE_URL}/api/reports/schedule/counts`,

};