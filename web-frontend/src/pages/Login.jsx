import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../utils/api";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Lock, Mail, User } from "lucide-react";

export default function Login() {
  const [form, setForm] = useState({ 
    email: "", 
    password: "", 
    role: "" 
  });
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleOTPFlow = async (email, role) => {
    try {
      setLoading(true);
      
      // FIXED: Correct endpoint URLs
      const endpoint = role === "student" 
        ? "/auth/student/login-attempt" 
        : "/auth/faculty/login-attempt";
      
      console.log("Calling OTP endpoint:", endpoint, "with email:", email);
      
      const attemptResponse = await API.post(endpoint, { email });
      
      console.log("OTP response:", attemptResponse.data);
      
      if (attemptResponse.data.requiresPasswordSetup) {
        // Redirect to OTP verification page
        navigate("/setup-password", { 
          state: { 
            email: email,
            role: role,
            otpExpires: attemptResponse.data.otpExpires,
            message: attemptResponse.data.message
          } 
        });
        return true; // OTP flow initiated
      }
      
      return false; // No OTP needed, proceed with normal login
      
    } catch (error) {
      console.error("OTP flow error:", error);
      alert(error.response?.data?.message || "Error initiating password setup");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Special handling for student and faculty roles
      if (form.role === "student" || form.role === "faculty") {
        const otpInitiated = await handleOTPFlow(form.email, form.role);
        if (otpInitiated) {
          return; // Stop here, OTP flow started
        }
        // If no OTP needed, continue with normal login
      }

      // Normal login for all roles
      console.log("Normal login attempt:", form);
      const res = await API.post("/auth/login", form);

      const userFromApi = res.data.user;
      const token = res.data.token;

      // Ensure _id exists for future profile updates
      const user = { ...userFromApi, _id: userFromApi._id || userFromApi.id };

      // Save user and token in context and localStorage
      login(user);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);

      // Role-based navigation
      switch (user.role) {
        case "admin":
          navigate("/AdminDashboard");
          break;
        case "institute":
          navigate("/InstituteDashboard");
          break;
        case "faculty":
          navigate("/FacultyDashboard");
          break;
        case "student":
          navigate("/StudentDashboard");
          break;
        default:
          navigate("/");
          break;
      }
    } catch (error) {
      console.error("Login failed:", error);
      
      // Handle specific error cases
      if (error.response?.data?.requiresPasswordSetup) {
        // This shouldn't happen with our flow, but as backup
        navigate("/setup-password", { 
          state: { 
            email: form.email,
            role: form.role,
            message: error.response.data.message
          } 
        });
      } else {
        alert(error.response?.data?.message || "Invalid credentials. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const isFirstTimeLogin = () => {
    return (form.role === "student" || form.role === "faculty") && !form.password;
  };

  const getRoleSpecificInfo = () => {
    if (form.role === "student") {
      return {
        message: "First time student? Leave password blank and we'll send an OTP to your email for password setup.",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        textColor: "text-blue-700"
      };
    } else if (form.role === "faculty") {
      return {
        message: "First time faculty? Leave password blank and we'll send an OTP to your email for password setup.",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200",
        textColor: "text-purple-700"
      };
    }
    return null;
  };

  const roleInfo = getRoleSpecificInfo();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-green-200 to-green-300">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-10 w-96"
      >
        <h1 className="text-3xl font-extrabold text-center text-green-800 mb-2">
          EcoQuest
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Login to your environmental journey 🌿
        </p>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="mb-5 relative">
            <Mail className="absolute left-3 top-2.5 text-green-600" size={20} />
            <input
              type="email"
              placeholder="Enter your email"
              value={form.email}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          {/* Password */}
          <div className="mb-5 relative">
            <Lock className="absolute left-3 top-2.5 text-green-600" size={20} />
            <input
              type="password"
              placeholder="Enter your password"
              value={form.password}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required={!isFirstTimeLogin()}
            />
            {(form.role === "student" || form.role === "faculty") && (
              <p className="text-xs text-gray-500 mt-1">
                Leave blank if this is your first login
              </p>
            )}
          </div>

          {/* Role Dropdown */}
          <div className="mb-6 relative">
            <User className="absolute left-3 top-2.5 text-green-600" size={20} />
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 appearance-none bg-white"
              required
            >
              <option value="">Select your role</option>
              <option value="admin">Admin</option>
              <option value="institute">Institute</option>
              <option value="faculty">Faculty</option>
              <option value="student">Student</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300 disabled:bg-green-400 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-green-700 font-semibold cursor-pointer hover:underline"
          >
            Register
          </span>
        </p>

        {/* Role-specific info */}
        {roleInfo && (
          <div className={`mt-4 p-3 ${roleInfo.bgColor} rounded-lg border ${roleInfo.borderColor}`}>
            <p className={`text-xs ${roleInfo.textColor} text-center`}>
              <strong>First time {form.role}?</strong> {roleInfo.message}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}