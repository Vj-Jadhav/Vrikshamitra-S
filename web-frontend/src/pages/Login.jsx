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
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Submitting form:", form);

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
        default:
          break;
      }
    } catch (error) {
      console.error("Login failed:", error);
      alert("Invalid credentials. Please try again.");
    }
  };

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
              required
            />
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
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300"
          >
            Login
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
      </motion.div>
    </div>
  );
}