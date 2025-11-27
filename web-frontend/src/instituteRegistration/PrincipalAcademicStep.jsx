// components/institute-registration/PrincipalAcademicStep.js
import { motion } from "framer-motion";
import { User, Mail, Phone, BookOpen, Calendar, Clock, FileText } from "lucide-react";

const academicSessions = [
  "January-December",
  "April-March", 
  "June-May",
  "August-July",
  "Other"
];

const workingDays = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];

export default function PrincipalAcademicStep({ form = {}, setForm, errors = {} }) {
  const safeForm = form || {};
  
  const toggleWorkingDay = (day) => {
    const currentWorkingDays = safeForm.workingDays || [];
    setForm({
      ...safeForm,
      workingDays: currentWorkingDays.includes(day)
        ? currentWorkingDays.filter(d => d !== day)
        : [...currentWorkingDays, day]
    });
  };

  return (
    <motion.div
      key="step4"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold text-blue-800 mb-6">Principal & Academic Details</h2>

      {/* Principal Details */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <User className="mr-2 text-blue-600" size={20} />
          Principal/Head Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <User className="absolute left-3 top-2.5 text-blue-600" size={20} />
            <input
              type="text"
              placeholder="Principal Name *"
              className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.principalName ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-blue-400"
              }`}
              value={safeForm.principalName || ""}
              onChange={(e) => setForm({ ...safeForm, principalName: e.target.value })}
              required
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-2.5 text-blue-600" size={20} />
            <input
              type="email"
              placeholder="Principal Email"
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={safeForm.principalEmail || ""}
              onChange={(e) => setForm({ ...safeForm, principalEmail: e.target.value })}
            />
          </div>

          <div className="relative">
            <Phone className="absolute left-3 top-2.5 text-blue-600" size={20} />
            <input
              type="tel"
              placeholder="Principal Phone"
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={safeForm.principalPhone || ""}
              onChange={(e) => setForm({ ...safeForm, principalPhone: e.target.value })}
            />
          </div>

          <input
            type="text"
            placeholder="Qualification"
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={safeForm.principalQualification || ""}
            onChange={(e) => setForm({ ...safeForm, principalQualification: e.target.value })}
          />

          <input
            type="text"
            placeholder="Experience (years)"
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={safeForm.principalExperience || ""}
            onChange={(e) => setForm({ ...safeForm, principalExperience: e.target.value })}
          />
        </div>
        {errors.principalName && (
          <p className="text-red-500 text-sm mt-2">{errors.principalName}</p>
        )}
      </div>

      {/* Academic Details */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <BookOpen className="mr-2 text-blue-600" size={20} />
          Academic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 text-blue-600" size={20} />
            <select
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={safeForm.academicSession || ""}
              onChange={(e) => setForm({ ...safeForm, academicSession: e.target.value })}
            >
              <option value="">Academic Session</option>
              {academicSessions.map(session => (
                <option key={session} value={session}>{session}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Clock className="absolute left-3 top-2.5 text-blue-600" size={20} />
            <div className="p-3 border border-gray-300 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2 ml-7">
                Working Days *
              </label>
              <div className="flex flex-wrap gap-2">
                {workingDays.map(day => (
                  <label key={day} className="flex items-center space-x-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(safeForm.workingDays || []).includes(day)}
                      onChange={() => toggleWorkingDay(day)}
                      className="rounded text-blue-600 focus:ring-blue-400"
                    />
                    <span className="text-sm">{day.substring(0, 3)}</span>
                  </label>
                ))}
              </div>
              {(safeForm.workingDays || []).length > 0 && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-2">Selected days:</p>
                  <div className="flex flex-wrap gap-2">
                    {safeForm.workingDays.map(day => (
                      <motion.span
                        key={day}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
                      >
                        {day}
                        <button
                          type="button"
                          onClick={() => toggleWorkingDay(day)}
                          className="ml-2 hover:text-purple-600"
                        >
                          ×
                        </button>
                      </motion.span>
                    ))}
                  </div>
                </div>
              )}
              {errors.workingDays && (
                <p className="text-red-500 text-sm mt-2">{errors.workingDays}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <FileText className="mr-2 text-blue-600" size={20} />
          Additional Information
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Affiliation Details
            </label>
            <input
              type="text"
              placeholder="e.g., Affiliated to XYZ University"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={safeForm.affiliation || ""}
              onChange={(e) => setForm({ ...safeForm, affiliation: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Accreditation
            </label>
            <input
              type="text"
              placeholder="e.g., NAAC A Grade, ISO Certified"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={safeForm.accreditation || ""}
              onChange={(e) => setForm({ ...safeForm, accreditation: e.target.value })}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}