// Mock API for testing OTP flow
export const mockApi = {
  post: async (endpoint, data) => {
    console.log("Mock API call:", endpoint, data);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Handle different endpoints
    if (endpoint.includes("/auth/student/login-attempt")) {
      return {
        data: {
          success: true,
          requiresPasswordSetup: true, // Change this to false to test normal login
          otpExpires: new Date(Date.now() + 15 * 60000).toISOString(),
          message: "OTP sent to student email",
          tempToken: "mock-temp-token-123"
        }
      };
    }
    
    if (endpoint.includes("/auth/faculty/login-attempt")) {
      return {
        data: {
          success: true,
          requiresPasswordSetup: true,
          otpExpires: new Date(Date.now() + 15 * 60000).toISOString(),
          message: "OTP sent to faculty email",
          tempToken: "mock-temp-token-456"
        }
      };
    }
    
    if (endpoint === "/auth/login") {
      // Check if it's first-time login without password
      if ((data.role === "student" || data.role === "faculty") && !data.password) {
        throw {
          response: {
            data: {
              requiresPasswordSetup: true,
              message: "Please set up your password first"
            }
          }
        };
      }
      
      // Normal login success
      return {
        data: {
          token: "mock-jwt-token",
          user: {
            _id: "user-" + Date.now(),
            email: data.email,
            role: data.role,
            name: data.role === "student" ? "Test Student" : 
                  data.role === "faculty" ? "Test Faculty" :
                  data.role === "admin" ? "Test Admin" : "Test Institute"
          }
        }
      };
    }
    
    throw new Error("Endpoint not found");
  }
};

export const API = {
  post: async (endpoint, data) => {
    // Switch between mock and real API
    const useMock = true; // Set to false to use real API
    
    if (useMock) {
      return mockApi.post(endpoint, data);
    } else {
      // Import your real API here
      const { API } = await import('./api');
      return API.post(endpoint, data);
    }
  }
};