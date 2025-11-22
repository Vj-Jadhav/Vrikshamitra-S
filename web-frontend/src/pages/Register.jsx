import { useState } from "react";
import { API } from "../utils/api";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Lock, School, Calendar, BookOpen } from "lucide-react";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    schoolName: "",
    age: "",
    className: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = { ...form };

      if (form.role !== "student") {
        delete payload.age;
        delete payload.className;
      }

      await API.post("/auth/register", payload);
      alert("Registered successfully!");
      navigate("/login");
    } catch (err) {
      console.error(err.response?.data || err);
      alert(err.response?.data?.message || "Registration failed!");
    } finally {
      setLoading(false);
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
        <h1 className="text-3xl font-extrabold text-center text-green-800 mb-2">EcoQuest</h1>
        <p className="text-center text-gray-600 mb-8">
          Create your account and join the green journey 🌿
        </p>

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="mb-5 relative">
            <User className="absolute left-3 top-2.5 text-green-600" size={20} />
            <input
              type="text"
              placeholder="Name"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          {/* Email */}
          <div className="mb-5 relative">
            <Mail className="absolute left-3 top-2.5 text-green-600" size={20} />
            <input
              type="email"
              placeholder="Email"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          {/* Password */}
          <div className="mb-5 relative">
            <Lock className="absolute left-3 top-2.5 text-green-600" size={20} />
            <input
              type="password"
              placeholder="Password"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          {/* Role */}
          <div className="mb-6">
            <select
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* School Name */}
          <div className="mb-5 relative">
            <School className="absolute left-3 top-2.5 text-green-600" size={20} />
            <input
              type="text"
              placeholder="Enter your school name"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              value={form.schoolName}
              onChange={(e) => setForm({ ...form, schoolName: e.target.value })}
              required
            />
          </div>

          {/* Student-only fields */}
          {form.role === "student" && (
            <>
              <div className="mb-5 relative">
                <Calendar className="absolute left-3 top-2.5 text-green-600" size={20} />
                <input
                  type="number"
                  placeholder="Enter your age"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  required
                />
              </div>

              <div className="mb-5 relative">
                <BookOpen className="absolute left-3 top-2.5 text-green-600" size={20} />
                <input
                  type="text"
                  placeholder="Class (e.g., 10th Grade)"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                  value={form.className}
                  onChange={(e) => setForm({ ...form, className: e.target.value })}
                  required
                />
              </div>
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300 disabled:opacity-50"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-green-700 font-semibold cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </motion.div>
    </div>
  );
}
