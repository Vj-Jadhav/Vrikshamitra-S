// src/institute/StudentManagement.jsx
import React, { useState, useEffect } from 'react';
import { Search, Plus, GraduationCap, Upload, Download, Building, School, Users } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { addStudentsBulk, getInstituteById, getStudentsByInstitute } from '../utils/api';

const StudentManagement = ({ instituteId }) => {
  const [students, setStudents] = useState([]);
  const [institute, setInstitute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    grade: '',
    department: '',
    faculty: '',
    batch: '',
    program: ''
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [csvData, setCsvData] = useState([]);
  const [uploadStatus, setUploadStatus] = useState('');
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    phone: '',
    // Common fields
    rollNumber: '',
    // School fields
    grade: '',
    batch: '',
    section: '',
    // College fields
    department: '',
    program: '',
    semester: '',
    // University fields
    faculty: '',
    enrollmentNumber: '',
    academicYear: '',
    batch: '' // Added batch for universities
  });

  useEffect(() => {
    if (instituteId) {
      fetchInstitute();
      fetchStudents();
    }
  }, [instituteId]);

  const fetchInstitute = async () => {
    try {
      console.log("Calling API with ID:", instituteId);
      const data = await getInstituteById(instituteId);
      console.log("API returned:", data.data.instituteType);
      setInstitute(data.data);
      console.log("State updated:", data);
    } catch (error) {
      console.error("Error fetching institute:", error);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await getStudentsByInstitute(instituteId);
      setStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async () => {
    // Validation based on institute type
    const requiredFields = ['name', 'email'];
    let instituteSpecificFields = [];

    switch (institute?.instituteType) {
      case 'university':
        instituteSpecificFields = ['faculty', 'department', 'enrollmentNumber', 'batch']; // Added batch
        break;
      case 'college':
        instituteSpecificFields = ['department', 'program'];
        break;
      case 'school':
        instituteSpecificFields = ['grade', 'batch'];
        break;
      default:
        instituteSpecificFields = [];
    }

    const allRequiredFields = [...requiredFields, ...instituteSpecificFields];
    const missingFields = allRequiredFields.filter(field => !newStudent[field]);

    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    try {
      const payload = {
        ...newStudent,
        instituteId,
        semester: newStudent.semester ? parseInt(newStudent.semester) : undefined
      };

      // Remove unused fields based on institute type
      if (institute?.instituteType !== 'university') {
        delete payload.faculty;
        delete payload.enrollmentNumber;
        delete payload.academicYear;
      }
      if (institute?.instituteType !== 'college') {
        delete payload.program;
        delete payload.semester;
      }
      if (institute?.instituteType !== 'school') {
        delete payload.grade;
        delete payload.section;
      }

      // TODO: Add API call for single student
      // const res = await addStudent(instituteId, payload);
      // setStudents(prev => [...prev, res]);
      
      setShowAddModal(false);
      resetNewStudent();
      fetchStudents(); // Refresh the list
    } catch (err) {
      console.error("Failed to add student:", err);
      alert(err.response?.data?.message || "Failed to add student");
    }
  };

  const resetNewStudent = () => {
    setNewStudent({
      name: '',
      email: '',
      phone: '',
      rollNumber: '',
      grade: '',
      batch: '',
      section: '',
      department: '',
      program: '',
      semester: '',
      faculty: '',
      enrollmentNumber: '',
      academicYear: ''
    });
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadStatus('Parsing file...');
    const fileExt = file.name.split('.').pop().toLowerCase();

    if (fileExt === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const data = results.data.filter(row =>
            Object.values(row).some(cell => cell && cell.toString().trim() !== '')
          );
          setCsvData(data);
          setUploadStatus(`Found ${data.length} students in CSV`);
        },
        error: (error) => {
          console.error('CSV parsing error:', error);
          setUploadStatus('Error parsing CSV file');
        }
      });
    } else if (fileExt === 'xls' || fileExt === 'xlsx') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const sheetData = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
        setCsvData(sheetData);
        setUploadStatus(`Found ${sheetData.length} students in Excel`);
      };
      reader.onerror = (err) => {
        console.error('Excel reading error:', err);
        setUploadStatus('Error reading Excel file');
      };
      reader.readAsArrayBuffer(file);
    } else {
      setUploadStatus('Unsupported file type. Please upload CSV, XLS, or XLSX.');
    }
  };

  const processCSVData = async () => {
    if (!csvData || csvData.length === 0) {
      setUploadStatus('No valid data to process');
      return;
    }

    const newStudents = csvData.map((row, index) => {
      const baseStudent = {
        name: row['name'] || '',
        email: row['email'] || '',
        phone: row['phone'] || '',
        rollNumber: row['rollNumber'] || `S${String(students.length + index + 1).padStart(3, '0')}`,
        status: 'active'
      };

      // Add institute-specific fields
      switch (institute?.instituteType) {
        case 'university':
          return {
            ...baseStudent,
            faculty: row['faculty'] || '',
            department: row['department'] || '',
            enrollmentNumber: row['enrollmentNumber'] || '',
            academicYear: row['academicYear'] || '',
            program: row['program'] || '',
            batch: row['batch'] || '' // Added batch for universities
          };
        case 'college':
          return {
            ...baseStudent,
            department: row['department'] || '',
            program: row['program'] || '',
            semester: row['semester'] ? parseInt(row['semester']) : undefined,
            batch: row['batch'] || '' // Added batch for colleges
          };
        case 'school':
          return {
            ...baseStudent,
            grade: row['grade'] || '',
            batch: row['batch'] || '',
            section: row['section'] || ''
          };
        default:
          return baseStudent;
      }
    }).filter(student => student.name && student.email);

    if (newStudents.length === 0) {
      setUploadStatus('No valid students found in file');
      return;
    }

    try {
      setUploadStatus('Saving students to server...');
      const savedStudents = await addStudentsBulk(instituteId, newStudents);
      setStudents(prev => [...prev, ...savedStudents]);
      setUploadStatus(`Successfully added ${savedStudents.length} students`);
      setShowCSVModal(false);
      setCsvData([]);
      const fileInput = document.getElementById('csv-upload');
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Failed to save students:', error);
      setUploadStatus('Error saving students to server');
    }
  };

  const downloadCSVTemplate = () => {
    let headers = ['name', 'email', 'phone', 'rollNumber'];
    
    switch (institute?.instituteType) {
      case 'university':
        headers.push('faculty', 'department', 'enrollmentNumber', 'academicYear', 'program', 'batch'); // Added batch
        break;
      case 'college':
        headers.push('department', 'program', 'semester', 'batch'); // Added batch
        break;
      case 'school':
        headers.push('grade', 'batch', 'section');
        break;
    }

    const template = [headers.join(',')];
    const blob = new Blob(template, { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student_template_${institute?.instituteType || 'general'}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filters.grade === '' || student.grade === filters.grade) &&
    (filters.department === '' || student.department === filters.department) &&
    (filters.faculty === '' || student.faculty === filters.faculty) &&
    (filters.batch === '' || student.batch === filters.batch) &&
    (filters.program === '' || student.program === filters.program)
  );

  // Get unique values for filters
  const grades = [...new Set(students.map(s => s.grade).filter(Boolean))];
  const departments = [...new Set(students.map(s => s.department).filter(Boolean))];
  const faculties = [...new Set(students.map(s => s.faculty).filter(Boolean))];
  const batches = [...new Set(students.map(s => s.batch).filter(Boolean))];
  const programs = [...new Set(students.map(s => s.program).filter(Boolean))];

  const renderAddStudentForm = () => {
    if (!institute) return <div>Loading institute details...</div>;

    switch (institute.instituteType) {
      case 'university':
        return <UniversityStudentForm newStudent={newStudent} setNewStudent={setNewStudent} institute={institute} />;
      case 'college':
        return <CollegeStudentForm newStudent={newStudent} setNewStudent={setNewStudent} institute={institute} />;
      case 'school':
        return <SchoolStudentForm newStudent={newStudent} setNewStudent={setNewStudent} />;
      default:
        return <div>Unknown institute type</div>;
    }
  };

  const renderStudentBadges = (student) => {
    const badges = [];
    
    if (student.faculty) {
      badges.push(
        <span key="faculty" className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
          <Building size={12} /> {student.faculty}
        </span>
      );
    }
    
    if (student.department) {
      badges.push(
        <span key="department" className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
          <School size={12} /> {student.department}
        </span>
      );
    }
    
    if (student.grade) {
      badges.push(
        <span key="grade" className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
          {student.grade}
        </span>
      );
    }
    
    if (student.batch) {
      badges.push(
        <span key="batch" className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
          Batch: {student.batch}
        </span>
      );
    }

    return badges;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Student Management</h1>
          {institute && (
            <p className="text-gray-600 capitalize">
              {institute.instituteType} - {institute.instituteName}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600"
            onClick={() => setShowCSVModal(true)}
          >
            <Upload size={20} /> Import CSV/Excel
          </button>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={20} /> Add Student
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search students by name..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Dynamic filters based on institute type */}
          {institute?.instituteType === 'university' && faculties.length > 0 && (
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={filters.faculty}
              onChange={(e) => setFilters(prev => ({ ...prev, faculty: e.target.value }))}
            >
              <option value="">All Faculties</option>
              {faculties.map(faculty => (
                <option key={faculty} value={faculty}>{faculty}</option>
              ))}
            </select>
          )}

          {departments.length > 0 && (
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={filters.department}
              onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          )}

          {institute?.instituteType === 'school' && grades.length > 0 && (
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={filters.grade}
              onChange={(e) => setFilters(prev => ({ ...prev, grade: e.target.value }))}
            >
              <option value="">All Grades</option>
              {grades.map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
          )}

          {batches.length > 0 && (
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={filters.batch}
              onChange={(e) => setFilters(prev => ({ ...prev, batch: e.target.value }))}
            >
              <option value="">All Batches</option>
              {batches.map(batch => (
                <option key={batch} value={batch}>{batch}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Eco Points</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">{student.rollNumber}</div>
                        {student.enrollmentNumber && (
                          <div className="text-xs text-gray-400">{student.enrollmentNumber}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.email}</div>
                    <div className="text-sm text-gray-500">{student.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {renderStudentBadges(student)}
                    </div>
                    {student.program && (
                      <div className="text-sm text-gray-600 mt-1">{student.program}</div>
                    )}
                    {student.semester && (
                      <div className="text-sm text-gray-600">Semester: {student.semester}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{student.ecoPoints || 0}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                    <button className="text-green-600 hover:text-green-900">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStudents.length === 0 && !loading && (
          <div className="text-center py-12">
            <GraduationCap className="mx-auto text-gray-300 mb-4" size={48} />
            <div className="text-gray-500">No students found</div>
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                {institute?.instituteType === 'university' && <Building className="text-purple-500" size={24} />}
                {institute?.instituteType === 'college' && <School className="text-blue-500" size={24} />}
                {institute?.instituteType === 'school' && <Users className="text-green-500" size={24} />}
                <h2 className="text-xl font-bold">Add New Student</h2>
              </div>
              
              {renderAddStudentForm()}

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetNewStudent();
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddStudent}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Add Student
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSV/Excel Import Modal */}
      {showCSVModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Import Students from File</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload CSV / Excel File
                </label>
                <input
                  id="csv-upload"
                  type="file"
                  accept=".csv, .xls, .xlsx"
                  onChange={handleFileUpload}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: CSV, XLS, XLSX. Download template for required columns.
                </p>
              </div>

              {uploadStatus && (
                <div className={`p-3 rounded-lg text-sm ${
                  uploadStatus.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {uploadStatus}
                </div>
              )}

              <div className="flex justify-between items-center">
                <button
                  onClick={downloadCSVTemplate}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                >
                  <Download size={16} /> Download Template
                </button>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowCSVModal(false);
                      setUploadStatus('');
                      setCsvData([]);
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={processCSVData}
                    disabled={!csvData.length}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Import Students
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// University Student Form Component
const UniversityStudentForm = ({ newStudent, setNewStudent, institute }) => {
  const faculties = institute?.faculties || [];
  const [availableDepartments, setAvailableDepartments] = useState([]);

  useEffect(() => {
    if (newStudent.faculty) {
      const selectedFaculty = faculties.find(f => f.name === newStudent.faculty);
      setAvailableDepartments(selectedFaculty?.departments || []);
    } else {
      setAvailableDepartments([]);
    }
  }, [newStudent.faculty, faculties]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Faculty *</label>
          <select
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
            value={newStudent.faculty}
            onChange={(e) => setNewStudent({ ...newStudent, faculty: e.target.value, department: '' })}
            required
          >
            <option value="">Select Faculty</option>
            {faculties.map(faculty => (
              <option key={faculty.name} value={faculty.name}>{faculty.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
          <select
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
            value={newStudent.department}
            onChange={(e) => setNewStudent({ ...newStudent, department: e.target.value })}
            required
            disabled={!newStudent.faculty}
          >
            <option value="">{newStudent.faculty ? 'Select Department' : 'Select Faculty first'}</option>
            {availableDepartments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Enrollment Number *</label>
          <input
            type="text"
            placeholder="Enter enrollment number"
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
            value={newStudent.enrollmentNumber}
            onChange={(e) => setNewStudent({ ...newStudent, enrollmentNumber: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Batch *</label>
          <input
            type="text"
            placeholder="e.g., 2023, 2024"
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
            value={newStudent.batch}
            onChange={(e) => setNewStudent({ ...newStudent, batch: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
          <input
            type="text"
            placeholder="e.g., 2024-2025"
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
            value={newStudent.academicYear}
            onChange={(e) => setNewStudent({ ...newStudent, academicYear: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
          <input
            type="text"
            placeholder="e.g., B.Tech Computer Science"
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
            value={newStudent.program}
            onChange={(e) => setNewStudent({ ...newStudent, program: e.target.value })}
          />
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-medium text-gray-700 mb-2">Personal Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              type="text"
              placeholder="Enter full name"
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
              value={newStudent.name}
              onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
            <input
              type="text"
              placeholder="Enter roll number"
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
              value={newStudent.rollNumber}
              onChange={(e) => setNewStudent({ ...newStudent, rollNumber: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              placeholder="Enter email address"
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
              value={newStudent.email}
              onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="text"
              placeholder="Enter phone number"
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
              value={newStudent.phone}
              onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// College Student Form Component
const CollegeStudentForm = ({ newStudent, setNewStudent, institute }) => {
  const departments = institute?.departments || [];
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
          {departments.length > 0 ? (
            <select
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={newStudent.department}
              onChange={(e) => setNewStudent({ ...newStudent, department: e.target.value })}
              required
            >
              <option value="">Select Department</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              placeholder="Enter department name"
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={newStudent.department}
              onChange={(e) => setNewStudent({ ...newStudent, department: e.target.value })}
              required
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Program *</label>
          <input
            type="text"
            placeholder="e.g., B.Tech, B.Sc, MCA"
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={newStudent.program}
            onChange={(e) => setNewStudent({ ...newStudent, program: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
          <input
            type="text"
            placeholder="e.g., 2023, 2024"
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={newStudent.batch}
            onChange={(e) => setNewStudent({ ...newStudent, batch: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
          <input
            type="number"
            placeholder="e.g., 1, 2, 3..."
            min="1"
            max="12"
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={newStudent.semester}
            onChange={(e) => setNewStudent({ ...newStudent, semester: e.target.value })}
          />
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-medium text-gray-700 mb-2">Personal Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              type="text"
              placeholder="Enter full name"
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={newStudent.name}
              onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
            <input
              type="text"
              placeholder="Enter roll number"
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={newStudent.rollNumber}
              onChange={(e) => setNewStudent({ ...newStudent, rollNumber: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              placeholder="Enter email address"
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={newStudent.email}
              onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="text"
              placeholder="Enter phone number"
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={newStudent.phone}
              onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// School Student Form Component
const SchoolStudentForm = ({ newStudent, setNewStudent }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Grade *</label>
          <input
            type="text"
            placeholder="e.g., 10th Grade, 12th Grade"
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            value={newStudent.grade}
            onChange={(e) => setNewStudent({ ...newStudent, grade: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Batch *</label>
          <input
            type="text"
            placeholder="e.g., 2024, 2023-2024"
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            value={newStudent.batch}
            onChange={(e) => setNewStudent({ ...newStudent, batch: e.target.value })}
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Section (Optional)</label>
        <input
          type="text"
          placeholder="e.g., A, B, Science"
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
          value={newStudent.section}
          onChange={(e) => setNewStudent({ ...newStudent, section: e.target.value })}
        />
      </div>

      <div className="border-t pt-4">
        <h3 className="font-medium text-gray-700 mb-2">Personal Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              type="text"
              placeholder="Enter full name"
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
              value={newStudent.name}
              onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
            <input
              type="text"
              placeholder="Enter roll number"
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
              value={newStudent.rollNumber}
              onChange={(e) => setNewStudent({ ...newStudent, rollNumber: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              placeholder="Enter email address"
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
              value={newStudent.email}
              onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="text"
              placeholder="Enter phone number"
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
              value={newStudent.phone}
              onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentManagement;