import { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { API } from "../utils/api";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Mail, Lock, Shield, ArrowLeft } from "lucide-react";

export default function SetupPassword() {
  const [step, setStep] = useState(1); // 1: OTP Verification, 2: Password Setup
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tempToken, setTempToken] = useState("");
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const { email, role, otpExpires, message } = location.state || {};

  if (!email || !role) {
    navigate("/login");
    return null;
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const endpoint = role === "student" 
        ? "/auth/student/verify-otp" 
        : "/auth/faculty/verify-otp";

      const response = await API.post(endpoint, {
        email,
        otp
      });

      if (response.data.success) {
        setTempToken(response.data.tempToken);
        setStep(2); // Move to password setup
        setError("");
      }
    } catch (error) {
      setError(error.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (e) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const endpoint = role === "student" 
        ? "/auth/student/set-password" 
        : "/auth/faculty/set-password";

      const response = await API.post(endpoint, {
        email,
        tempToken,
        password
      });

      if (response.data.success) {
        // Auto-login the user
        const userData = role === "student" ? response.data.student : response.data.faculty;
        const user = {
          ...userData,
          _id: userData.id,
          role: role
        };

        login(user);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", response.data.token);

        // Navigate to appropriate dashboard
        const dashboard = role === "student" ? "/StudentDashboard" : "/FacultyDashboard";
        navigate(dashboard);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Password setup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError("");

    try {
      const endpoint = role === "student" 
        ? "/auth/student/resend-otp" 
        : "/auth/faculty/resend-otp";

      const response = await API.post(endpoint, { email });
      
      if (response.data.success) {
        setError("New OTP sent to your email");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = () => {
    return role === "student" ? "blue" : "purple";
  };

  const getRoleDisplayName = () => {
    return role === "student" ? "Student" : "Faculty";
  };

  const color = getRoleColor();
  const roleName = getRoleDisplayName();

  const colorClasses = {
    blue: {
      bg: "from-blue-100 via-blue-200 to-blue-300",
      primary: "blue",
      button: "bg-blue-600 hover:bg-blue-700",
      disabled: "bg-blue-400",
      text: "text-blue-800",
      icon: "text-blue-600",
      border: "border-blue-200",
      bgLight: "bg-blue-50"
    },
    purple: {
      bg: "from-purple-100 via-purple-200 to-purple-300",
      primary: "purple",
      button: "bg-purple-600 hover:bg-purple-700",
      disabled: "bg-purple-400",
      text: "text-purple-800",
      icon: "text-purple-600",
      border: "border-purple-200",
      bgLight: "bg-purple-50"
    }
  };

  const currentColor = colorClasses[color];

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${currentColor.bg}`}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-8 w-96"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate("/login")}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className={`text-2xl font-bold ${currentColor.text}`}>
              {step === 1 ? "Verify Your Email" : "Set Your Password"}
            </h1>
            <p className="text-sm text-gray-600">
              {step === 1 ? `Enter the OTP sent to your ${roleName.toLowerCase()} email` : "Create your new password"}
            </p>
          </div>
        </div>

        {/* Email Display */}
        <div className={`mb-6 p-3 ${currentColor.bgLight} rounded-lg border ${currentColor.border}`}>
          <div className="flex items-center gap-2">
            <Mail size={16} className={currentColor.icon} />
            <span className="text-sm font-medium">{email}</span>
            <span className="text-xs px-2 py-1 bg-gray-200 rounded-full capitalize">{role}</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Step 1: OTP Verification */}
        {step === 1 && (
          <form onSubmit={handleVerifyOTP}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter OTP
              </label>
              <div className="relative">
                <Shield className={`absolute left-3 top-2.5 ${currentColor.icon}`} size={20} />
                <input
                  type="text"
                  placeholder="000000"
                  value={otp}
                  maxLength={6}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-center text-lg font-mono"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                We sent a 6-digit code to your email
              </p>
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className={`w-full py-2.5 ${currentColor.button} text-white font-semibold rounded-lg shadow-md transition-all duration-300 disabled:${currentColor.disabled} disabled:cursor-not-allowed`}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              <button
                type="button"
                onClick={handleResendOTP}
                disabled={loading}
                className="w-full py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-lg transition-all duration-300 disabled:opacity-50"
              >
                Resend OTP
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Password Setup */}
        {step === 2 && (
          <form onSubmit={handleSetPassword}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className={`absolute left-3 top-2.5 ${currentColor.icon}`} size={20} />
                  <input
                    type="password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                    minLength={6}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Must be at least 6 characters long
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className={`absolute left-3 top-2.5 ${currentColor.icon}`} size={20} />
                  <input
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300 disabled:bg-green-400 disabled:cursor-not-allowed"
              >
                {loading ? "Setting Password..." : "Set Password & Login"}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}