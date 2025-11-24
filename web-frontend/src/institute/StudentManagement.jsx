// src/institute/StudentManagement.jsx
import React, { useState, useEffect } from 'react';
import { Search, Plus, GraduationCap, Upload, Download } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { addStudentsBulk } from '../utils/api'; // helper to save students in bulk

const StudentManagement = ({ instituteId }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [csvData, setCsvData] = useState([]);
  const [uploadStatus, setUploadStatus] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockStudents = [
        {
          id: 1,
          name: "Alice Johnson",
          email: "alice.j@student.edu",
          phone: "+1-555-0201",
          grade: "10th Grade",
          rollNumber: "S001",
          joinDate: "2022-08-20",
          ecoPoints: 450,
          status: "active",
          batch: "2023",
          section: "A"
        },
        {
          id: 2,
          name: "Bob Smith",
          email: "bob.s@student.edu",
          phone: "+1-555-0202",
          grade: "11th Grade",
          rollNumber: "S002",
          joinDate: "2022-08-20",
          ecoPoints: 320,
          status: "active",
          batch: "2023",
          section: "B"
        }
      ];
      setStudents(mockStudents);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadStatus('Parsing file...');
    const fileExt = file.name.split('.').pop().toLowerCase();

    if (fileExt === 'csv') {
      // Parse CSV
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
      // Parse Excel
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

    const newStudents = csvData.map((row, index) => ({
      name: row['name'] || '',
      email: row['email'] || '',
      phone: row['phone'] || '',
      grade: row['grade'] || '',
      rollNumber: row['rollNumber'] || `S${String(students.length + index + 1).padStart(3, '0')}`,
      joinDate: row['joinDate'] || new Date().toISOString().split('T')[0],
      ecoPoints: parseInt(row['ecoPoints']) || 0,
      batch: row['batch'] || '',
      section: row['section'] || '',
      status: 'active'
    })).filter(student => student.name && student.email);

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
    const headers = ['name', 'email', 'phone', 'grade', 'rollNumber', 'batch', 'section'];
    const template = [headers.join(',')];
    const blob = new Blob(template, { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterGrade === '' || student.grade === filterGrade)
  );

  const grades = [...new Set(students.map(s => s.grade))];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Student Management</h1>
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
          <div className="flex gap-2">
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
            >
              <option value="">All Grades</option>
              {grades.map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
          </div>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
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
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.email}</div>
                    <div className="text-sm text-gray-500">{student.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">{student.grade}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{student.ecoPoints}</div>
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

        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <GraduationCap className="mx-auto text-gray-300 mb-4" size={48} />
            <div className="text-gray-500">No students found</div>
          </div>
        )}
      </div>

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
                  Supported formats: CSV, XLS, XLSX. Columns: name, email, phone, grade, rollNumber, batch, section
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

export default StudentManagement;
