import React, { useEffect, useState, useCallback } from "react";
import { Trophy, Leaf, Award, TrendingUp, Users, X, Calendar, Target, Activity, Star, Clock, MapPin, Download, FileText } from "lucide-react";
import axios from "axios";
import * as XLSX from 'xlsx'; // Install with: npm install xlsx

const StudentProgress = ({ studentData }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [studentActivities, setStudentActivities] = useState({});
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.get("http://localhost:5000/api/leaderboard");
      const sorted = data.sort((a, b) => b.ecoPoints - a.ecoPoints);
      setStudents(sorted);
    } catch (err) {
      console.error("Error fetching students:", err);
      setError("Failed to load student data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStudentActivities = async (studentId) => {
    try {
      setActivitiesLoading(true);
      const { data } = await axios.get(`http://localhost:5000/api/students/${studentId}/activities`);
      setStudentActivities(prev => ({
        ...prev,
        [studentId]: data
      }));
      return data;
    } catch (err) {
      console.error("Error fetching activities:", err);
      // Fallback to empty array if API fails
      return [];
    } finally {
      setActivitiesLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const getRankIcon = (rank) => {
    if (rank === 0) return <Award className="w-5 h-5 text-yellow-500" />;
    if (rank === 1) return <Award className="w-5 h-5 text-gray-400" />;
    if (rank === 2) return <Award className="w-5 h-5 text-amber-700" />;
    return <span className="w-5 h-5 flex items-center justify-center">{rank + 1}</span>;
  };

  const handleViewStudent = async (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
    
    // Fetch activities if not already loaded
    if (!studentActivities[student.id]) {
      await fetchStudentActivities(student.id);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
  };

  const getBadges = (points) => {
    if (points >= 500) return ["Eco Champion", "Green Warrior", "Planet Protector", "Sustainability Leader"];
    if (points >= 300) return ["Green Warrior", "Planet Protector", "Eco Ambassador"];
    if (points >= 150) return ["Planet Protector", "Eco Enthusiast"];
    if (points >= 50) return ["Eco Beginner"];
    return ["Getting Started"];
  };

  // Export to Excel
  const exportToExcel = (student, activities) => {
    // Prepare data for Excel
    const studentData = [
      ['Student Report', '', '', ''],
      ['Name:', student.name, 'School:', student.schoolName || 'N/A'],
      ['Grade:', student.grade || 'N/A', 'Total EcoPoints:', student.ecoPoints],
      ['Rank:', `#${students.findIndex(s => s.id === student.id) + 1}`, 'Report Date:', new Date().toLocaleDateString()],
      ['', '', '', ''],
      ['ACTIVITY HISTORY', '', '', ''],
      ['Date', 'Activity Type', 'Description', 'Points Earned']
    ];

    // Add activities
    activities.forEach(activity => {
      studentData.push([
        new Date(activity.date).toLocaleDateString(),
        activity.type?.charAt(0).toUpperCase() + activity.type?.slice(1) || 'General',
        activity.description,
        activity.points
      ]);
    });

    // Add summary
    studentData.push(['', '', '', '']);
    studentData.push(['SUMMARY', '', '', '']);
    studentData.push(['Total Activities:', activities.length, '', '']);
    studentData.push(['Total Points:', student.ecoPoints, '', '']);
    studentData.push(['Average Points per Activity:', Math.round(student.ecoPoints / activities.length), '', '']);

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(studentData);
    
    // Create workbook and add worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Student Report');

    // Generate Excel file
    XLSX.writeFile(wb, `EcoReport_${student.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Export to PDF (simplified version using window.print)
  const exportToPDF = (student, activities) => {
    const printWindow = window.open('', '_blank');
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Eco Report - ${student.name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { border-bottom: 2px solid #10B981; padding-bottom: 10px; margin-bottom: 20px; }
          .section { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #10B981; color: white; }
          .summary { background-color: #f0f9ff; padding: 15px; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Eco Activity Report</h1>
          <h2>${student.name}</h2>
          <p>School: ${student.schoolName || 'N/A'} | Grade: ${student.grade || 'N/A'} | Total Points: ${student.ecoPoints}</p>
          <p>Report Generated: ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="section">
          <h3>Activity History</h3>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Activity Type</th>
                <th>Description</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              ${activities.map(activity => `
                <tr>
                  <td>${new Date(activity.date).toLocaleDateString()}</td>
                  <td>${activity.type?.charAt(0).toUpperCase() + activity.type?.slice(1) || 'General'}</td>
                  <td>${activity.description}</td>
                  <td>${activity.points}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div class="section summary">
          <h3>Summary</h3>
          <p><strong>Total Activities:</strong> ${activities.length}</p>
          <p><strong>Total EcoPoints:</strong> ${student.ecoPoints}</p>
          <p><strong>Average Points per Activity:</strong> ${Math.round(student.ecoPoints / activities.length)}</p>
          <p><strong>Current Rank:</strong> #${students.findIndex(s => s.id === student.id) + 1}</p>
        </div>
        
        <div class="footer">
          <p><em>Generated by EcoTracker System</em></p>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  // Export to CSV
  const exportToCSV = (student, activities) => {
    const headers = ['Date', 'Activity Type', 'Description', 'Points Earned'];
    const csvData = activities.map(activity => [
      new Date(activity.date).toLocaleDateString(),
      activity.type?.charAt(0).toUpperCase() + activity.type?.slice(1) || 'General',
      `"${activity.description.replace(/"/g, '""')}"`, // Escape quotes for CSV
      activity.points
    ]);

    const csvContent = [
      `Student: ${student.name}`,
      `School: ${student.schoolName || 'N/A'}`,
      `Grade: ${student.grade || 'N/A'}`,
      `Total Points: ${student.ecoPoints}`,
      `Report Date: ${new Date().toLocaleDateString()}`,
      '',
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `EcoReport_${student.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalEcoPoints = students.reduce((sum, student) => sum + (student.ecoPoints || 0), 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <div className="text-red-500 mb-4">{error}</div>
        <button 
          onClick={fetchStudents}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header with Stats */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-green-100 p-3 rounded-2xl">
            <Trophy className="text-yellow-500 w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Student Progress Tracking</h2>
            <p className="text-gray-600">Track environmental contributions and achievements</p>
          </div>
        </div>
        
        <div className="flex gap-4 bg-green-50 p-4 rounded-2xl">
          <div className="text-center">
            <Users className="w-6 h-6 text-green-600 mx-auto mb-1" />
            <div className="text-2xl font-bold text-gray-800">{students.length}</div>
            <div className="text-sm text-gray-600">Students</div>
          </div>
          <div className="text-center">
            <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-1" />
            <div className="text-2xl font-bold text-gray-800">{totalEcoPoints}</div>
            <div className="text-sm text-gray-600">Total Points</div>
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white rounded-2xl border border-green-200 shadow-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-green-100 text-green-800">
            <tr>
              <th className="px-6 py-4 font-semibold">Rank</th>
              <th className="px-6 py-4 font-semibold">Student Name</th>
              <th className="px-6 py-4 font-semibold">School Name</th>
              <th className="px-6 py-4 font-semibold text-right">EcoPoints</th>
              <th className="px-6 py-4 font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-green-100">
            {students.map((student, index) => (
              <tr key={student.id} className="hover:bg-green-50 transition-colors duration-150">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {getRankIcon(index)}
                    {index < 3 && (
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {index === 0 ? 'Gold' : index === 1 ? 'Silver' : 'Bronze'}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <Leaf className="text-green-600 w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{student.name}</div>
                      {student.grade && (
                        <div className="text-sm text-gray-500">Grade {student.grade}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-gray-700">{student.schoolName || "Not specified"}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-right">
                    <div className="font-bold text-green-700 text-lg">{student.ecoPoints}</div>
                    <div className="text-sm text-gray-500">points</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center gap-2">
                    <button 
                      onClick={() => handleViewStudent(student)}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium"
                    >
                      View Details
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Student Details Modal */}
      {isModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-t-2xl text-white">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="bg-white bg-opacity-20 p-3 rounded-2xl">
                    <Leaf className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedStudent.name}</h2>
                    <p className="text-green-100">{selectedStudent.schoolName || "Not specified"}</p>
                  </div>
                </div>
                <button 
                  onClick={closeModal}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-green-50 p-4 rounded-2xl text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <span className="font-semibold text-gray-700">Rank</span>
                  </div>
                  <div className="text-3xl font-bold text-green-700">
                    #{students.findIndex(s => s.id === selectedStudent.id) + 1}
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-2xl text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-blue-500" />
                    <span className="font-semibold text-gray-700">EcoPoints</span>
                  </div>
                  <div className="text-3xl font-bold text-blue-700">
                    {selectedStudent.ecoPoints}
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-2xl text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Activity className="w-5 h-5 text-purple-500" />
                    <span className="font-semibold text-gray-700">Activities</span>
                  </div>
                  <div className="text-3xl font-bold text-purple-700">
                    {studentActivities[selectedStudent.id]?.length || 0}
                  </div>
                </div>
              </div>

              {/* Badges Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Earned Badges
                </h3>
                <div className="flex flex-wrap gap-2">
                  {getBadges(selectedStudent.ecoPoints).map((badge, index) => (
                    <span 
                      key={index}
                      className="bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 px-3 py-2 rounded-full text-sm font-medium border border-yellow-200"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recent Activities */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-600" />
                  Recent Activities
                  {activitiesLoading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
                  )}
                </h3>
                <div className="space-y-3">
                  {studentActivities[selectedStudent.id]?.length > 0 ? (
                    studentActivities[selectedStudent.id].map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="bg-green-100 p-2 rounded-full">
                            <MapPin className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">{activity.description}</div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Calendar className="w-3 h-3" />
                              {new Date(activity.date).toLocaleDateString()}
                              {activity.type && (
                                <>
                                  <span>•</span>
                                  <span className="capitalize">{activity.type}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">+{activity.points}</div>
                          <div className="text-xs text-gray-500">points</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Activity className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>No activities recorded yet</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Student Information */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Student Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Email:</span>
                    <span className="ml-2 text-gray-800">{selectedStudent.email || "Not provided"}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Grade Level:</span>
                    <span className="ml-2 text-gray-800">{selectedStudent.grade || "Not specified"}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Join Date:</span>
                    <span className="ml-2 text-gray-800">
                      {selectedStudent.joinDate ? new Date(selectedStudent.joinDate).toLocaleDateString() : "Unknown"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Status:</span>
                    <span className="ml-2 text-green-600 font-medium">Active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-2xl">
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <span className="text-sm text-gray-600">Export Report:</span>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => exportToCSV(selectedStudent, studentActivities[selectedStudent.id] || [])}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    CSV
                  </button>
                  <button 
                    onClick={() => exportToExcel(selectedStudent, studentActivities[selectedStudent.id] || [])}
                    className="flex items-center gap-2 px-4 py-2 border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Excel
                  </button>
                  <button 
                    onClick={() => exportToPDF(selectedStudent, studentActivities[selectedStudent.id] || [])}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-6 text-center text-gray-500 text-sm">
        <p>Updated just now • EcoPoints are awarded for environmental activities and achievements</p>
      </div>
    </div>
  );
};

export default StudentProgress;