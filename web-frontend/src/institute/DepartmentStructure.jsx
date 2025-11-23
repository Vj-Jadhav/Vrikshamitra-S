// Enhanced DepartmentStructure.jsx
import React, { useState } from 'react';
import { Network, Users, BookOpen, Award, Plus, Edit3 } from 'lucide-react';

const DepartmentStructure = ({ instituteData }) => {
  const [editing, setEditing] = useState(false);

  // School Structure with Grade Management
  const renderSchoolStructure = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Grades Structure</h3>
          <button className="bg-blue-500 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600">
            <Plus size={16} />
            Add Grade
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {instituteData.grades.map((grade, index) => (
            <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center group hover:bg-blue-100 transition-colors">
              <BookOpen size={20} className="mx-auto text-blue-500 mb-1" />
              <div className="text-sm font-medium text-blue-800">{grade}</div>
              <div className="text-xs text-blue-600 mt-1">Students: 45</div>
              <button className="mt-2 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                <Edit3 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* School Levels Overview */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">School Levels</h3>
        <div className="flex flex-wrap gap-3">
          {instituteData.schoolLevel && (
            <div className="bg-green-100 border border-green-200 px-4 py-2 rounded-lg">
              <span className="text-green-800 font-medium">{instituteData.schoolLevel}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // College Structure with Department Management
  const renderCollegeStructure = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Departments & Courses</h3>
          <div className="flex gap-2">
            <button className="bg-blue-500 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600">
              <Plus size={16} />
              Add Department
            </button>
            <button className="bg-green-500 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600">
              <Plus size={16} />
              Add Course
            </button>
          </div>
        </div>

        {/* Departments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {instituteData.departments.map((dept, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BookOpen size={20} className="text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-800">{dept}</div>
                  <div className="text-sm text-gray-500">Department</div>
                </div>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Faculty: 12</span>
                <span>Students: 240</span>
              </div>
            </div>
          ))}
        </div>

        {/* Courses List */}
        <div className="border-t pt-4">
          <h4 className="font-semibold text-gray-700 mb-3">Offered Courses</h4>
          <div className="flex flex-wrap gap-2">
            {instituteData.courses?.map((course, index) => (
              <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                {course}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // University Structure with Faculty Hierarchy
  const renderUniversityStructure = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Faculty Hierarchy</h3>
          <button className="bg-purple-500 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-600">
            <Plus size={16} />
            Add Faculty
          </button>
        </div>
        
        <div className="space-y-4">
          {instituteData.faculties.map((faculty, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users size={24} className="text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-lg text-gray-800">{faculty}</div>
                  <div className="text-sm text-gray-500">Faculty</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Programs: {instituteData.programs?.length || 0}</div>
                  <div className="text-sm text-gray-600">Research Centers: {instituteData.researchCenters?.length || 0}</div>
                </div>
              </div>
              
              {/* Programs under this faculty */}
              <div className="ml-4 pl-4 border-l-2 border-purple-200">
                <h4 className="font-medium text-gray-700 mb-2">Programs:</h4>
                <div className="flex flex-wrap gap-2 mb-3">
                  {instituteData.programs?.map((program, progIndex) => (
                    <span key={progIndex} className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm">
                      {program}
                    </span>
                  ))}
                </div>

                {/* Research Centers */}
                {instituteData.researchCenters && instituteData.researchCenters.length > 0 && (
                  <>
                    <h4 className="font-medium text-gray-700 mb-2">Research Centers:</h4>
                    <div className="flex flex-wrap gap-2">
                      {instituteData.researchCenters.map((center, centerIndex) => (
                        <span key={centerIndex} className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-sm">
                          {center}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const getStructureContent = () => {
    switch (instituteData.type) {
      case 'school':
        return renderSchoolStructure();
      case 'college':
        return renderCollegeStructure();
      case 'university':
        return renderUniversityStructure();
      default:
        return (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 text-center">
            <Network className="mx-auto text-gray-300 mb-4" size={48} />
            <div className="text-gray-500">No specific structure defined</div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Institute Structure</h1>
        <button 
          onClick={() => setEditing(!editing)}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-600"
        >
          <Edit3 size={16} />
          {editing ? 'Save Changes' : 'Edit Structure'}
        </button>
      </div>

      {/* Institute Type Overview */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
            <Network className="text-white" size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 capitalize">{instituteData.type} Structure</h2>
            <p className="text-gray-600">
              {instituteData.type === 'school' && 'Manage grade levels, school levels, and class structure'}
              {instituteData.type === 'college' && 'Organize departments, courses, and academic programs'}
              {instituteData.type === 'university' && 'Manage faculty hierarchy, programs, and research centers'}
            </p>
          </div>
        </div>
      </div>

      {/* Dynamic Structure Content */}
      {getStructureContent()}
    </div>
  );
};

export default DepartmentStructure;