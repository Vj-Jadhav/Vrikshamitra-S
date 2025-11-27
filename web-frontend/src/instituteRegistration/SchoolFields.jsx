// components/institute-registration/SchoolFields.js
import { motion } from "framer-motion";

const schoolLevels = [
  "Primary School",
  "Middle School", 
  "High School",
  "Higher Secondary",
  "K-12",
  "International School",
  "Play School"
];

const educationBoards = [
  "CBSE",
  "ICSE",
  "State Board",
  "IB (International Baccalaureate)",
  "IGCSE",
  "NIOS",
  "Other"
];

const grades = [
  "Play Group", "Nursery", "LKG", "UKG", 
  "1st Grade", "2nd Grade", "3rd Grade", "4th Grade", "5th Grade",
  "6th Grade", "7th Grade", "8th Grade", "9th Grade", "10th Grade", 
  "11th Grade", "12th Grade"
];

export default function SchoolFields({ form = {}, setForm, errors = {} }) {
  const safeForm = form || {};
  
  const toggleGrade = (grade) => {
    const currentGrades = safeForm.grades || [];
    setForm({
      ...safeForm,
      grades: currentGrades.includes(grade)
        ? currentGrades.filter(g => g !== grade)
        : [...currentGrades, grade]
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            School Level <span className="text-red-500">*</span>
          </label>
          <select
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.schoolLevel ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-blue-400"
            }`}
            value={safeForm.schoolLevel || ""}
            onChange={(e) => setForm({ ...safeForm, schoolLevel: e.target.value })}
            required
          >
            <option value="">Select school level</option>
            {schoolLevels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
          {errors.schoolLevel && (
            <p className="text-red-500 text-sm mt-1">{errors.schoolLevel}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Education Board <span className="text-red-500">*</span>
          </label>
          <select
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.board ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-blue-400"
            }`}
            value={safeForm.board || ""}
            onChange={(e) => setForm({ ...safeForm, board: e.target.value })}
            required
          >
            <option value="">Select education board</option>
            {educationBoards.map(board => (
              <option key={board} value={board}>{board}</option>
            ))}
          </select>
          {errors.board && (
            <p className="text-red-500 text-sm mt-1">{errors.board}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Grades Offered <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-60 overflow-y-auto p-2 border border-gray-300 rounded-lg">
          {grades.map(grade => (
            <label key={grade} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={(safeForm.grades || []).includes(grade)}
                onChange={() => toggleGrade(grade)}
                className="rounded text-blue-600 focus:ring-blue-400"
              />
              <span className="text-sm">{grade}</span>
            </label>
          ))}
        </div>
        {(safeForm.grades || []).length > 0 && (
          <div className="mt-3">
            <p className="text-sm text-gray-600 mb-2">Selected grades:</p>
            <div className="flex flex-wrap gap-2">
              {safeForm.grades.map(grade => (
                <motion.span
                  key={grade}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                >
                  {grade}
                  <button
                    type="button"
                    onClick={() => toggleGrade(grade)}
                    className="ml-2 hover:text-green-600"
                  >
                    ×
                  </button>
                </motion.span>
              ))}
            </div>
          </div>
        )}
        {errors.grades && (
          <p className="text-red-500 text-sm mt-2">{errors.grades}</p>
        )}
      </div>
    </div>
  );
}