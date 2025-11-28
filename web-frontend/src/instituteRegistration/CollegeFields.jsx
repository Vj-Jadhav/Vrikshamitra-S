// components/institute-registration/CollegeFields.js
import { motion } from "framer-motion";

export default function CollegeFields({ form = {}, setForm, errors = {} }) {
  const safeForm = form || {};
  
  // Department functions with safe access
  const addDepartment = (dept) => {
    const currentDepartments = safeForm.departments || [];
    if (!currentDepartments.includes(dept)) {
      setForm({ ...safeForm, departments: [...currentDepartments, dept] });
    }
  };

  const removeDepartment = (deptToRemove) => {
    setForm({
      ...safeForm,
      departments: (safeForm.departments || []).filter(dept => dept !== deptToRemove)
    });
  };

  const addCustomDepartment = () => {
    const customDept = safeForm.customDepartment?.trim();
    const currentDepartments = safeForm.departments || [];
    
    if (customDept && !currentDepartments.includes(customDept)) {
      setForm({
        ...safeForm,
        departments: [...currentDepartments, customDept],
        customDepartment: ""
      });
    }
  };

  // Course functions with safe access
  const addCourse = (course) => {
    const currentCourses = safeForm.courses || [];
    if (!currentCourses.includes(course)) {
      setForm({ ...safeForm, courses: [...currentCourses, course] });
    }
  };

  const removeCourse = (courseToRemove) => {
    setForm({
      ...safeForm,
      courses: (safeForm.courses || []).filter(course => course !== courseToRemove)
    });
  };

  const addCustomCourse = () => {
    const customCourse = safeForm.customCourse?.trim();
    const currentCourses = safeForm.courses || [];
    
    if (customCourse && !currentCourses.includes(customCourse)) {
      setForm({
        ...safeForm,
        courses: [...currentCourses, customCourse],
        customCourse: ""
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          University Affiliation
        </label>
        <input
          type="text"
          placeholder="Name of affiliated university"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={safeForm.universityAffiliated || ""}
          onChange={(e) => setForm({ ...safeForm, universityAffiliated: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Departments <span className="text-red-500">*</span>
        </label>
        
        {(safeForm.departments || []).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {safeForm.departments.map((dept) => (
              <motion.span
                key={dept}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
              >
                {dept}
                <button
                  type="button"
                  onClick={() => removeDepartment(dept)}
                  className="ml-2 hover:text-blue-600"
                >
                  ×
                </button>
              </motion.span>
            ))}
          </div>
        )}

        {errors.departments && (
          <p className="text-red-500 text-sm mb-3">{errors.departments}</p>
        )}

        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter department name (e.g., Computer Science, Mathematics)"
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={safeForm.customDepartment || ""}
              onChange={(e) => setForm({ ...safeForm, customDepartment: e.target.value })}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCustomDepartment();
                }
              }}
            />
            <button
              type="button"
              onClick={addCustomDepartment}
              className="px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          </div>
          <p className="text-xs text-gray-500">
            Type department name and click "Add" to include it in the list
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Courses
        </label>
        
        {(safeForm.courses || []).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {safeForm.courses.map((course) => (
              <motion.span
                key={course}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
              >
                {course}
                <button
                  type="button"
                  onClick={() => removeCourse(course)}
                  className="ml-2 hover:text-green-600"
                >
                  ×
                </button>
              </motion.span>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter course name"
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={safeForm.customCourse || ""}
            onChange={(e) => setForm({ ...safeForm, customCourse: e.target.value })}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCustomCourse();
              }
            }}
          />
          <button
            type="button"
            onClick={addCustomCourse}
            className="px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}