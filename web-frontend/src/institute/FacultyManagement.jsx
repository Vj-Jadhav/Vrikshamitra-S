// src/institute/FacultyManagement.jsx
import React, { useState, useEffect } from 'react';
import { Search, Plus, Mail, Phone, BookOpen, Users, Building, School, GraduationCap } from 'lucide-react';
import { addFaculty, getFacultyByInstitute, getInstituteById } from '../utils/api';

const FacultyManagement = ({ instituteId }) => {
  const [faculty, setFaculty] = useState([]);
  const [institute, setInstitute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterFaculty, setFilterFaculty] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newFaculty, setNewFaculty] = useState({
    name: '',
    email: '',
    phone: '',
    faculty: '',
    department: '',
    subjects: ''
  });
  const [addingFaculty, setAddingFaculty] = useState(false);

  // Fetch institute details and faculty list
  useEffect(() => {
    if (instituteId) {
      fetchInstitute();
      fetchFaculty();
    }
  }, [instituteId]);

  const fetchInstitute = async () => {
    try {
      console.log("🔍 Fetching institute with ID:", instituteId);
      const data = await getInstituteById(instituteId);
      console.log("🏫 Institute data:", data);
      setInstitute(data.data || data);
    } catch (error) {
      console.error("❌ Error fetching institute:", error);
      alert('Failed to load institute details');
    }
  };

  const fetchFaculty = async () => {
  setLoading(true);
  try {
    console.log("🔍 Fetching faculty for institute:", instituteId);
    const response = await getFacultyByInstitute(instituteId);
    console.log("👨‍🏫 Raw API response:", response);
    
    // Your backend returns { success: true, data: facultyArray }
    let facultyData = [];
    
    if (response && response.success === true && Array.isArray(response.data)) {
      facultyData = response.data;
      console.log("✅ Found faculty array in response.data");
    } else {
      console.warn("⚠️ Unexpected response structure:", response);
      facultyData = [];
    }
    
    console.log("✅ Final faculty data:", facultyData);
    console.log("📊 Number of faculty members:", facultyData.length);
    
    setFaculty(facultyData);
    
  } catch (error) {
    console.error("❌ Error fetching faculty:", error);
    console.error("❌ Error details:", error.response?.data);
    setFaculty([]);
    alert('Failed to load faculty list');
  } finally {
    setLoading(false);
  }
};

  const handleAddFaculty = async () => {
    // Validation based on institute type
    let requiredFields = ['name', 'email'];
    
    if (institute?.instituteType === 'university') {
      requiredFields.push('faculty', 'department');
    } else if (institute?.instituteType === 'college') {
      requiredFields.push('department');
    }

    const missingFields = requiredFields.filter(field => !newFaculty[field]);
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newFaculty.email)) {
      alert('Please enter a valid email address');
      return;
    }

    setAddingFaculty(true);
    
    try {
      console.log('📝 Preparing faculty data...');
      
      const payload = {
        name: newFaculty.name.trim(),
        email: newFaculty.email.trim(),
        phone: newFaculty.phone.trim(),
        subjects: newFaculty.subjects.split(',').map(s => s.trim()).filter(s => s)
      };

      // Add faculty-specific fields based on institute type
      if (institute?.instituteType === 'university') {
        payload.faculty = newFaculty.faculty;
        payload.department = newFaculty.department;
      } else if (institute?.instituteType === 'college') {
        payload.department = newFaculty.department;
      } else if (institute?.instituteType === 'school' && newFaculty.department) {
        payload.department = newFaculty.department;
      }

      console.log('📤 Sending payload:', payload);
      console.log('🏫 Institute ID:', instituteId);

      // Add faculty
      const response = await addFaculty(instituteId, payload);
      console.log('✅ Faculty added successfully:', response);

      // Refresh the faculty list
      await fetchFaculty();
      
      setShowModal(false);
      resetNewFaculty();
      
      alert(`✅ ${institute?.instituteType === 'school' ? 'Teacher' : 'Faculty member'} added successfully!`);
    } catch (err) {
      console.error('❌ Failed to add faculty:', err);
      
      // Enhanced error handling
      if (err.response) {
        // Server responded with error status
        const errorMessage = err.response.data?.message || 
                            err.response.data?.error ||
                            `Server error: ${err.response.status}`;
        alert(`Failed to add faculty: ${errorMessage}`);
      } else if (err.request) {
        // Request was made but no response received
        alert('Network error: Could not connect to server. Please check if the server is running.');
      } else {
        // Something else happened
        alert('Failed to add faculty: ' + err.message);
      }
    } finally {
      setAddingFaculty(false);
    }
  };

  const resetNewFaculty = () => {
    setNewFaculty({ 
      name: '', 
      email: '', 
      phone: '', 
      faculty: '', 
      department: '', 
      subjects: '' 
    });
  };

  // Filter faculty based on search and filters
  const filteredFaculty = faculty.filter(fac =>
    fac.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterDept === '' || fac.department === filterDept) &&
    (filterFaculty === '' || fac.faculty === filterFaculty)
  );

  // Get unique departments and faculties for filters
  const departments = [...new Set(faculty.map(f => f.department).filter(Boolean))];
  const faculties = [...new Set(faculty.map(f => f.faculty).filter(f => f))];

  // Get available faculties from institute data for university
  const universityFaculties = institute?.instituteType === 'university' 
    ? (institute.faculties?.map(f => f.name) || [])
    : [];

  // Get available departments based on institute type
  const getAvailableDepartments = () => {
    if (!institute) return [];
    
    switch (institute.instituteType) {
      case 'university':
        // For university, show departments based on selected faculty
        if (newFaculty.faculty) {
          const selectedFaculty = institute.faculties?.find(f => f.name === newFaculty.faculty);
          return selectedFaculty?.departments || [];
        }
        return [];
      case 'college':
        return institute.departments || [];
      case 'school':
        return []; // Schools typically don't have predefined departments
      default:
        return [];
    }
  };

  // Render different form based on institute type
  const renderAddFacultyForm = () => {
    const availableDepartments = getAvailableDepartments();
    
    switch (institute?.instituteType) {
      case 'university':
        return (
          <UniversityFacultyForm
            newFaculty={newFaculty}
            setNewFaculty={setNewFaculty}
            universityFaculties={universityFaculties}
            availableDepartments={availableDepartments}
          />
        );
      case 'college':
        return (
          <CollegeFacultyForm
            newFaculty={newFaculty}
            setNewFaculty={setNewFaculty}
            availableDepartments={availableDepartments}
          />
        );
      case 'school':
        return (
          <SchoolFacultyForm
            newFaculty={newFaculty}
            setNewFaculty={setNewFaculty}
          />
        );
      default:
        return <div className="text-center py-4">Loading institute type...</div>;
    }
  };

  if (loading && faculty.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading faculty data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Faculty Management</h1>
          {institute && (
            <p className="text-gray-600 capitalize">
              {institute.instituteType} - {institute.instituteName}
            </p>
          )}
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition-colors disabled:bg-blue-300"
          disabled={addingFaculty}
        >
          <Plus size={20} /> 
          {addingFaculty ? 'Adding...' : `Add ${institute?.instituteType === 'school' ? 'Teacher' : 'Faculty'}`}
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search faculty by name..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Faculty Filter (Only for University) */}
          {institute?.instituteType === 'university' && faculties.length > 0 && (
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={filterFaculty}
              onChange={e => setFilterFaculty(e.target.value)}
            >
              <option value="">All Faculties</option>
              {faculties.map(faculty => (
                <option key={faculty} value={faculty}>{faculty}</option>
              ))}
            </select>
          )}

          {/* Department Filter */}
          {departments.length > 0 && (
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={filterDept}
              onChange={e => setFilterDept(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Faculty Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-lg text-gray-600">Loading faculty...</div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFaculty.map(fac => (
              <FacultyCard 
                key={fac._id || fac.id} 
                faculty={fac} 
                instituteType={institute?.instituteType}
              />
            ))}
          </div>

          {filteredFaculty.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <Users className="mx-auto text-gray-300 mb-4" size={48} />
              <div className="text-gray-500">
                {searchTerm || filterDept || filterFaculty 
                  ? "No faculty members match your search criteria" 
                  : "No faculty members found"
                }
              </div>
            </div>
          )}
        </>
      )}

      {/* Add Faculty Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-2 mb-4">
              {institute?.instituteType === 'university' && <Building className="text-purple-500" size={24} />}
              {institute?.instituteType === 'college' && <School className="text-blue-500" size={24} />}
              {institute?.instituteType === 'school' && <GraduationCap className="text-green-500" size={24} />}
              <h2 className="text-xl font-bold">
                Add {institute?.instituteType === 'school' ? 'Teacher' : 'Faculty Member'}
              </h2>
            </div>
            
            {renderAddFacultyForm()}

            <div className="flex justify-end gap-2 mt-6">
              <button 
                onClick={() => {
                  setShowModal(false);
                  resetNewFaculty();
                }} 
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition-colors disabled:bg-gray-100"
                disabled={addingFaculty}
              >
                Cancel
              </button>
              <button 
                onClick={handleAddFaculty} 
                className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:bg-blue-300 flex items-center gap-2"
                disabled={addingFaculty}
              >
                {addingFaculty ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Adding...
                  </>
                ) : (
                  `Add ${institute?.instituteType === 'school' ? 'Teacher' : 'Faculty'}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Faculty Card Component
const FacultyCard = ({ faculty, instituteType }) => {
  // Safely access properties with fallbacks
  const facultyName = faculty.name || faculty.fullName || 'Unknown Name';
  const facultyEmail = faculty.email || faculty.emailAddress || 'No email';
  const facultyPhone = faculty.phone || faculty.phoneNumber || faculty.mobile || '';
  const facultyDept = faculty.department || faculty.dept || faculty.departmentName || '';
  const facultyFaculty = faculty.faculty || faculty.facultyName || '';
  
  // Handle subjects - could be array, string, or undefined
  let subjectsArray = [];
  if (Array.isArray(faculty.subjects)) {
    subjectsArray = faculty.subjects;
  } else if (typeof faculty.subjects === 'string') {
    subjectsArray = faculty.subjects.split(',').map(s => s.trim());
  }
  
  const joinDate = faculty.joinDate || faculty.createdAt || faculty.joinedDate || new Date();
  const status = faculty.status || faculty.accountStatus || 'active';

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-lg text-gray-800">{facultyName}</h3>
          <div className="flex flex-wrap gap-1 mt-1">
            {facultyFaculty && (
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                <Building size={12} /> {facultyFaculty}
              </span>
            )}
            {facultyDept && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                <School size={12} /> {facultyDept}
              </span>
            )}
            {instituteType === 'school' && (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                <GraduationCap size={12} /> Teacher
              </span>
            )}
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs ${status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {status}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-gray-600">
          <Mail size={16} /><span className="text-sm">{facultyEmail}</span>
        </div>
        {facultyPhone && (
          <div className="flex items-center gap-2 text-gray-600">
            <Phone size={16} /><span className="text-sm">{facultyPhone}</span>
          </div>
        )}
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2 text-gray-600 mb-2">
          <BookOpen size={16} /><span className="text-sm font-medium">Subjects</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {subjectsArray.length > 0 ? (
            subjectsArray.map((subject, idx) => (
              <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                {subject}
              </span>
            ))
          ) : (
            <span className="text-gray-400 text-xs">No subjects assigned</span>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>Joined: {new Date(joinDate).toLocaleDateString()}</span>
        <button className="text-blue-500 hover:text-blue-700 font-medium">View Profile</button>
      </div>
    </div>
  );
};

// University Faculty Form Component
const UniversityFacultyForm = ({ newFaculty, setNewFaculty, universityFaculties, availableDepartments }) => (
  <div className="space-y-3">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Faculty *
      </label>
      <select
        className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
        value={newFaculty.faculty}
        onChange={e => setNewFaculty({ 
          ...newFaculty, 
          faculty: e.target.value,
          department: '' // Reset department when faculty changes
        })}
        required
      >
        <option value="">Select Faculty</option>
        {universityFaculties.map(faculty => (
          <option key={faculty} value={faculty}>{faculty}</option>
        ))}
      </select>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Department *
        {newFaculty.faculty && (
          <span className="text-xs text-gray-500 ml-1">
            (from {newFaculty.faculty})
          </span>
        )}
      </label>
      <select
        className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
        value={newFaculty.department}
        onChange={e => setNewFaculty({ ...newFaculty, department: e.target.value })}
        required
        disabled={!newFaculty.faculty}
      >
        <option value="">{newFaculty.faculty ? 'Select Department' : 'Select Faculty first'}</option>
        {availableDepartments.map(dept => (
          <option key={dept} value={dept}>{dept}</option>
        ))}
      </select>
    </div>

    <div className="border-t pt-3">
      <h3 className="font-medium text-gray-700 mb-2">Personal Information</h3>
      <input 
        type="text" 
        placeholder="Full Name *" 
        className="w-full border px-3 py-2 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-purple-400" 
        value={newFaculty.name} 
        onChange={e => setNewFaculty({ ...newFaculty, name: e.target.value })} 
        required
      />
      <input 
        type="email" 
        placeholder="Email *" 
        className="w-full border px-3 py-2 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-purple-400" 
        value={newFaculty.email} 
        onChange={e => setNewFaculty({ ...newFaculty, email: e.target.value })} 
        required
      />
      <input 
        type="text" 
        placeholder="Phone" 
        className="w-full border px-3 py-2 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-purple-400" 
        value={newFaculty.phone} 
        onChange={e => setNewFaculty({ ...newFaculty, phone: e.target.value })} 
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Subjects
      </label>
      <input 
        type="text" 
        placeholder="Subjects (comma separated)" 
        className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-400" 
        value={newFaculty.subjects} 
        onChange={e => setNewFaculty({ ...newFaculty, subjects: e.target.value })} 
      />
      <p className="text-xs text-gray-500 mt-1">Separate multiple subjects with commas</p>
    </div>
  </div>
);

// College Faculty Form Component
const CollegeFacultyForm = ({ newFaculty, setNewFaculty, availableDepartments }) => (
  <div className="space-y-3">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Department *
      </label>
      {availableDepartments.length > 0 ? (
        <select
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={newFaculty.department}
          onChange={e => setNewFaculty({ ...newFaculty, department: e.target.value })}
          required
        >
          <option value="">Select Department</option>
          {availableDepartments.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
      ) : (
        <input
          type="text"
          placeholder="Enter department name"
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={newFaculty.department}
          onChange={e => setNewFaculty({ ...newFaculty, department: e.target.value })}
          required
        />
      )}
    </div>

    <div className="border-t pt-3">
      <h3 className="font-medium text-gray-700 mb-2">Personal Information</h3>
      <input 
        type="text" 
        placeholder="Full Name *" 
        className="w-full border px-3 py-2 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400" 
        value={newFaculty.name} 
        onChange={e => setNewFaculty({ ...newFaculty, name: e.target.value })} 
        required
      />
      <input 
        type="email" 
        placeholder="Email *" 
        className="w-full border px-3 py-2 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400" 
        value={newFaculty.email} 
        onChange={e => setNewFaculty({ ...newFaculty, email: e.target.value })} 
        required
      />
      <input 
        type="text" 
        placeholder="Phone" 
        className="w-full border px-3 py-2 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400" 
        value={newFaculty.phone} 
        onChange={e => setNewFaculty({ ...newFaculty, phone: e.target.value })} 
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Subjects
      </label>
      <input 
        type="text" 
        placeholder="Subjects (comma separated)" 
        className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" 
        value={newFaculty.subjects} 
        onChange={e => setNewFaculty({ ...newFaculty, subjects: e.target.value })} 
      />
      <p className="text-xs text-gray-500 mt-1">Separate multiple subjects with commas</p>
    </div>
  </div>
);

// School Faculty Form Component
const SchoolFacultyForm = ({ newFaculty, setNewFaculty }) => (
  <div className="space-y-3">
    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-2">
      <div className="flex items-center gap-2 text-green-800">
        <GraduationCap size={16} />
        <span className="text-sm font-medium">Teacher Information</span>
      </div>
      <p className="text-xs text-green-600 mt-1">
        Add teacher details for your school
      </p>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Department (Optional)
      </label>
      <input
        type="text"
        placeholder="e.g., Mathematics, Science, English"
        className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
        value={newFaculty.department}
        onChange={e => setNewFaculty({ ...newFaculty, department: e.target.value })}
      />
    </div>

    <div className="border-t pt-3">
      <h3 className="font-medium text-gray-700 mb-2">Personal Information</h3>
      <input 
        type="text" 
        placeholder="Full Name *" 
        className="w-full border px-3 py-2 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-green-400" 
        value={newFaculty.name} 
        onChange={e => setNewFaculty({ ...newFaculty, name: e.target.value })} 
        required
      />
      <input 
        type="email" 
        placeholder="Email *" 
        className="w-full border px-3 py-2 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-green-400" 
        value={newFaculty.email} 
        onChange={e => setNewFaculty({ ...newFaculty, email: e.target.value })} 
        required
      />
      <input 
        type="text" 
        placeholder="Phone" 
        className="w-full border px-3 py-2 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-green-400" 
        value={newFaculty.phone} 
        onChange={e => setNewFaculty({ ...newFaculty, phone: e.target.value })} 
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Subjects/Grades
      </label>
      <input 
        type="text" 
        placeholder="e.g., Mathematics, Grade 5, Science" 
        className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400" 
        value={newFaculty.subjects} 
        onChange={e => setNewFaculty({ ...newFaculty, subjects: e.target.value })} 
      />
      <p className="text-xs text-gray-500 mt-1">Enter subjects or grades taught (comma separated)</p>
    </div>
  </div>
);

export default FacultyManagement;