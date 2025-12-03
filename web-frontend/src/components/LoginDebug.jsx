import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../utils/mockApi"; // Use mock API for testing
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Lock, Mail, User, AlertCircle, CheckCircle } from "lucide-react";

export default function LoginDebug() {
  const [form, setForm] = useState({ 
    email: "", 
    password: "", 
    role: "" 
  });
  const [loading, setLoading] = useState(false);
  const [debugLog, setDebugLog] = useState([]);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const addDebug = (message, type = "info") => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLog(prev => [...prev, { 
      timestamp, 
      message, 
      type,
      form: { ...form } 
    }]);
    console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`);
  };

  const handleOTPFlow = async (email, role) => {
    try {
      setLoading(true);
      addDebug(`Starting OTP flow for ${role}: ${email}`, "info");
      
      const endpoint = role === "student" 
        ? "/auth/student/login-attempt" 
        : "/auth/faculty/login-attempt";
      
      addDebug(`Calling endpoint: ${endpoint}`, "api");
      
      const attemptResponse = await API.post(endpoint, { email });
      
      addDebug(`API Response: ${JSON.stringify(attemptResponse.data)}`, "success");
      
      if (attemptResponse.data.requiresPasswordSetup) {
        addDebug(`OTP required. Redirecting to setup-password`, "redirect");
        
        // Save to localStorage for debugging
        localStorage.setItem('otpDebug', JSON.stringify({
          email,
          role,
          response: attemptResponse.data,
          timestamp: new Date().toISOString()
        }));
        
        navigate("/setup-password", { 
          state: { 
            email: email,
            role: role,
            otpExpires: attemptResponse.data.otpExpires,
            message: attemptResponse.data.message,
            tempToken: attemptResponse.data.tempToken
          } 
        });
        return true;
      }
      
      addDebug(`No OTP required. Proceeding with normal login`, "info");
      return false;
      
    } catch (error) {
      addDebug(`OTP Error: ${error.message}`, "error");
      console.error("Full error:", error);
      
      if (error.response?.data) {
        addDebug(`Server error: ${JSON.stringify(error.response.data)}`, "error");
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    addDebug("=== FORM SUBMITTED ===", "header");
    addDebug(`Form data: ${JSON.stringify(form)}`, "data");
    
    setLoading(true);

    try {
      // Special handling for student and faculty roles
      if (form.role === "student" || form.role === "faculty") {
        const otpInitiated = await handleOTPFlow(form.email, form.role);
        if (otpInitiated) {
          addDebug(`OTP flow initiated. Stopping further processing.`, "info");
          return;
        }
        addDebug(`No OTP needed. Continuing with normal login.`, "info");
      }

      // Normal login for all roles
      addDebug(`Attempting normal login to /auth/login`, "api");
      const res = await API.post("/auth/login", form);
      addDebug(`Login successful: ${JSON.stringify(res.data.user)}`, "success");

      const userFromApi = res.data.user;
      const token = res.data.token;

      const user = { ...userFromApi, _id: userFromApi._id || userFromApi.id };

      login(user);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
      addDebug(`User saved to localStorage and context`, "success");

      // Role-based navigation
      const navMap = {
        "admin": "/governmentDashboard",
        "institute": "/InstituteDashboard",
        "faculty": "/FacultyDashboard",
        "student": "/StudentDashboard"
      };
      
      const target = navMap[user.role] || "/";
      addDebug(`Navigating to: ${target}`, "redirect");
      navigate(target);
      
    } catch (error) {
      addDebug(`Login failed: ${error.message}`, "error");
      
      if (error.response?.data) {
        addDebug(`Error details: ${JSON.stringify(error.response.data)}`, "error");
        
        if (error.response?.data?.requiresPasswordSetup) {
          addDebug(`Backup OTP redirect triggered`, "redirect");
          navigate("/setup-password", { 
            state: { 
              email: form.email,
              role: form.role,
              message: error.response.data.message
            } 
          });
        } else {
          alert(error.response?.data?.message || "Invalid credentials");
        }
      } else {
        alert("Network error or server not responding");
      }
    } finally {
      setLoading(false);
    }
  };

  const clearDebug = () => {
    setDebugLog([]);
    localStorage.removeItem('otpDebug');
  };

  const getDebugIcon = (type) => {
    switch(type) {
      case 'success': return <CheckCircle size={12} className="text-green-500" />;
      case 'error': return <AlertCircle size={12} className="text-red-500" />;
      case 'redirect': return <AlertCircle size={12} className="text-blue-500" />;
      default: return <AlertCircle size={12} className="text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel - Login Form */}
      <div className="w-1/2 flex items-center justify-center bg-gradient-to-br from-green-100 to-green-300">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-10 w-96"
        >
          <h1 className="text-3xl font-extrabold text-center text-green-800 mb-2">
            EcoQuest Debug
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Test OTP Flow 🔍
          </p>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="mb-5 relative">
              <Mail className="absolute left-3 top-2.5 text-green-600" size={20} />
              <input
                type="email"
                placeholder="test@example.com"
                value={form.email}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            {/* Password */}
            <div className="mb-5 relative">
              <Lock className="absolute left-3 top-2.5 text-green-600" size={20} />
              <input
                type="password"
                placeholder="Enter password (leave blank for OTP)"
                value={form.password}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">
                For student/faculty: Leave blank to trigger OTP flow
              </p>
            </div>

            {/* Role */}
            <div className="mb-6 relative">
              <User className="absolute left-3 top-2.5 text-green-600" size={20} />
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"
                required
              >
                <option value="">Select role</option>
                <option value="admin">Admin</option>
                <option value="institute">Institute</option>
                <option value="faculty">Faculty</option>
                <option value="student">Student</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg mb-4"
            >
              {loading ? "Processing..." : "Login / Trigger OTP"}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={clearDebug}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear Debug Log
              </button>
            </div>
          </form>

          {/* Test Buttons */}
          <div className="mt-6 space-y-2">
            <p className="text-sm font-medium text-gray-700">Quick Test:</p>
            <div className="flex space-x-2">
              <button
                onClick={() => setForm({ email: "student@test.com", password: "", role: "student" })}
                className="flex-1 py-1.5 bg-blue-100 text-blue-700 rounded text-sm"
              >
                Student OTP
              </button>
              <button
                onClick={() => setForm({ email: "faculty@test.com", password: "password123", role: "faculty" })}
                className="flex-1 py-1.5 bg-purple-100 text-purple-700 rounded text-sm"
              >
                Faculty Normal
              </button>
              <button
                onClick={() => setForm({ email: "admin@test.com", password: "admin123", role: "admin" })}
                className="flex-1 py-1.5 bg-green-100 text-green-700 rounded text-sm"
              >
                Admin Login
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right panel - Debug Log */}
      <div className="w-1/2 bg-gray-900 text-gray-100 p-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Debug Console</h2>
          <span className="text-sm bg-gray-700 px-2 py-1 rounded">
            {debugLog.length} entries
          </span>
        </div>
        
        <div className="space-y-2">
          {debugLog.length === 0 ? (
            <div className="text-gray-400 text-center py-8">
              Submit the form to see debug logs
            </div>
          ) : (
            debugLog.map((log, index) => (
              <div 
                key={index} 
                className={`p-3 rounded border-l-4 ${
                  log.type === 'error' ? 'border-red-500 bg-red-900/20' :
                  log.type === 'success' ? 'border-green-500 bg-green-900/20' :
                  log.type === 'redirect' ? 'border-blue-500 bg-blue-900/20' :
                  'border-gray-500 bg-gray-800'
                }`}
              >
                <div className="flex items-start gap-2">
                  {getDebugIcon(log.type)}
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400">{log.timestamp}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        log.type === 'error' ? 'bg-red-800' :
                        log.type === 'success' ? 'bg-green-800' :
                        log.type === 'redirect' ? 'bg-blue-800' :
                        'bg-gray-700'
                      }`}>
                        {log.type}
                      </span>
                    </div>
                    <p className="mt-1 text-sm">{log.message}</p>
                    {log.form && (
                      <div className="mt-2 text-xs text-gray-300">
                        Form state: {JSON.stringify(log.form)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* LocalStorage Info */}
        <div className="mt-6 p-4 bg-gray-800 rounded">
          <h3 className="font-medium mb-2">LocalStorage Check:</h3>
          <pre className="text-xs bg-gray-900 p-2 rounded overflow-auto">
            {JSON.stringify({
              user: localStorage.getItem('user'),
              token: localStorage.getItem('token'),
              otpDebug: localStorage.getItem('otpDebug')
            }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}