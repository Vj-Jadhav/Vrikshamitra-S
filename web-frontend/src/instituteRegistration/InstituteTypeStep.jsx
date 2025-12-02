// components/institute-registration/InstituteTypeStep.js
import { motion } from "framer-motion";
import { School, GraduationCap, Building } from "lucide-react";

const instituteTypes = [
  { value: "school", label: "School", description: "Primary/Secondary Education", icon: School },
  { value: "college", label: "College", description: "Undergraduate Education", icon: GraduationCap },
  { value: "university", label: "University", description: "Postgraduate & Research", icon: Building }
];

export default function InstituteTypeStep({ form = {}, setForm, errors = {} }) {
  const safeForm = form || {};
  
  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
    >
      <h2 className="text-2xl font-bold text-blue-800 mb-6">Select Institute Type</h2>
      
      {errors.instituteType && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{errors.instituteType}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {instituteTypes.map((type) => {
          const IconComponent = type.icon;
          return (
            <motion.div
              key={type.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                safeForm.instituteType === type.value
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-300 hover:border-blue-400"
              }`}
              onClick={() => setForm({ ...safeForm, instituteType: type.value })}
            >
              <div className="flex items-center space-x-3">
                <IconComponent size={24} className="text-blue-600" />
                <div>
                  <div className="font-semibold text-gray-800">{type.label}</div>
                  <div className="text-sm text-gray-600 mt-1">{type.description}</div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}