// components/institute-registration/UniversityFields.js
import { motion } from "framer-motion";

export default function UniversityFields({ form = {}, setForm, errors = {} }) {
  const safeForm = form || {};
  
  // Add a new faculty
  const addCustomFaculty = () => {
    const customFaculty = safeForm.customFaculty?.trim();
    if (customFaculty) {
      const newFaculty = {
        name: customFaculty,
        departments: []
      };
      setForm({
        ...safeForm,
        faculties: [...(safeForm.faculties || []), newFaculty],
        customFaculty: ""
      });
    }
  };

  // Remove a faculty
  const removeFaculty = (facultyIndex) => {
    const updatedFaculties = (safeForm.faculties || []).filter((_, index) => index !== facultyIndex);
    setForm({ ...safeForm, faculties: updatedFaculties });
  };

  // Update temporary department input for a specific faculty
  const updateFacultyTempDepartment = (facultyIndex, value) => {
    const updatedFaculties = [...(safeForm.faculties || [])];
    updatedFaculties[facultyIndex] = {
      ...updatedFaculties[facultyIndex],
      tempDepartment: value
    };
    setForm({ ...safeForm, faculties: updatedFaculties });
  };

  // Add department to a specific faculty
  const addDepartment = (facultyIndex) => {
    const faculties = safeForm.faculties || [];
    const departmentName = faculties[facultyIndex]?.tempDepartment?.trim();
    if (departmentName) {
      const updatedFaculties = [...faculties];
      updatedFaculties[facultyIndex] = {
        ...updatedFaculties[facultyIndex],
        departments: [...(updatedFaculties[facultyIndex].departments || []), departmentName],
        tempDepartment: ""
      };
      setForm({ ...safeForm, faculties: updatedFaculties });
    }
  };

  // Remove department from a specific faculty
  const removeDepartment = (facultyIndex, departmentIndex) => {
    const updatedFaculties = [...(safeForm.faculties || [])];
    updatedFaculties[facultyIndex].departments = (updatedFaculties[facultyIndex].departments || []).filter(
      (_, index) => index !== departmentIndex
    );
    setForm({ ...safeForm, faculties: updatedFaculties });
  };

  // Programs functions
  const addCustomProgram = () => {
    const customProgram = safeForm.customProgram?.trim();
    const currentPrograms = safeForm.programs || [];
    
    if (customProgram && !currentPrograms.includes(customProgram)) {
      setForm({
        ...safeForm,
        programs: [...currentPrograms, customProgram],
        customProgram: ""
      });
    }
  };

  const removeProgram = (programToRemove) => {
    setForm({
      ...safeForm,
      programs: (safeForm.programs || []).filter(program => program !== programToRemove)
    });
  };

  // Research Centers functions
  const addResearchCenter = () => {
    const customResearchCenter = safeForm.customResearchCenter?.trim();
    const currentResearchCenters = safeForm.researchCenters || [];
    
    if (customResearchCenter && !currentResearchCenters.includes(customResearchCenter)) {
      setForm({
        ...safeForm,
        researchCenters: [...currentResearchCenters, customResearchCenter],
        customResearchCenter: ""
      });
    }
  };

  const removeResearchCenter = (centerToRemove) => {
    setForm({
      ...safeForm,
      researchCenters: (safeForm.researchCenters || []).filter(center => center !== centerToRemove)
    });
  };

  return (
    <div className="space-y-6">
      {/* Faculties with Departments */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Faculties & Departments <span className="text-red-500">*</span>
        </label>
        
        {(safeForm.faculties || []).length > 0 && (
          <div className="space-y-4 mb-4">
            {safeForm.faculties.map((faculty, facultyIndex) => (
              <motion.div 
                key={facultyIndex} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-gray-200 rounded-lg p-4 bg-gray-50"
              >
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-800 text-lg">{faculty.name}</h4>
                  <button
                    type="button"
                    onClick={() => removeFaculty(facultyIndex)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remove Faculty
                  </button>
                </div>
                
                {/* Departments for this faculty */}
                {(faculty.departments || []).length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-2">
                      {faculty.departments.map((dept, deptIndex) => (
                        <span
                          key={deptIndex}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                        >
                          {dept}
                          <button
                            type="button"
                            onClick={() => removeDepartment(facultyIndex, deptIndex)}
                            className="ml-2 hover:text-blue-600"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Add Department to this Faculty */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={`Add department to ${faculty.name} (e.g., Computer Science, Mathematics)`}
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                      value={faculty.tempDepartment || ""}
                      onChange={(e) => updateFacultyTempDepartment(facultyIndex, e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addDepartment(facultyIndex);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => addDepartment(facultyIndex)}
                      className="px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add Dept
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {errors.faculties && (
          <p className="text-red-500 text-sm mb-4">{errors.faculties}</p>
        )}

        {/* Add New Faculty */}
        <div className="space-y-4 p-4 border-2 border-dashed border-gray-300 rounded-lg">
          <h4 className="font-medium text-gray-700">Add New Faculty</h4>
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter faculty name (e.g., Faculty of Science, Faculty of Engineering)"
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                value={safeForm.customFaculty || ""}
                onChange={(e) => setForm({ ...safeForm, customFaculty: e.target.value })}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomFaculty();
                  }
                }}
              />
              <button
                type="button"
                onClick={addCustomFaculty}
                className="px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Add Faculty
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Add faculty first, then add departments under each faculty
            </p>
          </div>
        </div>
      </div>

      {/* Programs */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Programs Offered
        </label>
        
        {(safeForm.programs || []).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {safeForm.programs.map((program) => (
              <span
                key={program}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800"
              >
                {program}
                <button
                  type="button"
                  onClick={() => removeProgram(program)}
                  className="ml-2 hover:text-orange-600"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter program name (e.g., Bachelor's Degree, Master's Degree)"
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={safeForm.customProgram || ""}
            onChange={(e) => setForm({ ...safeForm, customProgram: e.target.value })}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCustomProgram();
              }
            }}
          />
          <button
            type="button"
            onClick={addCustomProgram}
            className="px-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      {/* Research Centers */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Research Centers
        </label>
        
        {(safeForm.researchCenters || []).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {safeForm.researchCenters.map((center) => (
              <span
                key={center}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800"
              >
                {center}
                <button
                  type="button"
                  onClick={() => removeResearchCenter(center)}
                  className="ml-2 hover:text-red-600"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter research center name"
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={safeForm.customResearchCenter || ""}
            onChange={(e) => setForm({ ...safeForm, customResearchCenter: e.target.value })}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addResearchCenter();
              }
            }}
          />
          <button
            type="button"
            onClick={addResearchCenter}
            className="px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}