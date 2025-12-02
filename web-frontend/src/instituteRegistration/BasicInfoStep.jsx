// components/institute-registration/BasicInfoStep.js
import { motion } from "framer-motion";
import { Building, IdCard, Mail, Lock } from "lucide-react";

export default function BasicInfoStep({ form = {}, setForm, errors = {} }) {
  // Safe access with default values
  const safeForm = form || {};
  
  return (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold text-blue-800 mb-6">Basic Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="relative">
            <Building className="absolute left-3 top-2.5 text-blue-600" size={20} />
            <input
              type="text"
              placeholder="Institute Name *"
              className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.instituteName 
                  ? "border-red-500 focus:ring-red-400" 
                  : "border-gray-300 focus:ring-blue-400"
              }`}
              value={safeForm.instituteName || ""}
              onChange={(e) => setForm({ ...safeForm, instituteName: e.target.value })}
              required
            />
          </div>
          {errors.instituteName && (
            <p className="text-red-500 text-sm mt-1">{errors.instituteName}</p>
          )}
        </div>

        <div>
          <div className="relative">
            <IdCard className="absolute left-3 top-2.5 text-blue-600" size={20} />
            <input
              type="text"
              placeholder="Institute Code *"
              className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.instituteCode 
                  ? "border-red-500 focus:ring-red-400" 
                  : "border-gray-300 focus:ring-blue-400"
              }`}
              value={safeForm.instituteCode || ""}
              onChange={(e) => setForm({ ...safeForm, instituteCode: e.target.value })}
              required
            />
          </div>
          {errors.instituteCode && (
            <p className="text-red-500 text-sm mt-1">{errors.instituteCode}</p>
          )}
        </div>
      </div>

      <div>
        <div className="relative">
          <Mail className="absolute left-3 top-2.5 text-blue-600" size={20} />
          <input
            type="email"
            placeholder="Official Email *"
            className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.email 
                ? "border-red-500 focus:ring-red-400" 
                : "border-gray-300 focus:ring-blue-400"
            }`}
            value={safeForm.email || ""}
            onChange={(e) => setForm({ ...safeForm, email: e.target.value })}
            required
          />
        </div>
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 text-blue-600" size={20} />
            <input
              type="password"
              placeholder="Password *"
              className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.password 
                  ? "border-red-500 focus:ring-red-400" 
                  : "border-gray-300 focus:ring-blue-400"
              }`}
              value={safeForm.password || ""}
              onChange={(e) => setForm({ ...safeForm, password: e.target.value })}
              required
            />
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        <div>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 text-blue-600" size={20} />
            <input
              type="password"
              placeholder="Confirm Password *"
              className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.confirmPassword 
                  ? "border-red-500 focus:ring-red-400" 
                  : "border-gray-300 focus:ring-blue-400"
              }`}
              value={safeForm.confirmPassword || ""}
              onChange={(e) => setForm({ ...safeForm, confirmPassword: e.target.value })}
              required
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}