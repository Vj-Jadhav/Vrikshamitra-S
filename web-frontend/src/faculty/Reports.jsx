import React, { useState, useEffect, useRef } from 'react';
import { FileText, Download, Printer, Share2, Loader } from 'lucide-react';
import axios from 'axios';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const StudentReport = () => {
  const [facultyName, setFacultyName] = useState('Dr. Rajesh Sharma');
  const [reportDate, setReportDate] = useState('December 15, 2024');
  const [schoolName, setSchoolName] = useState('');
  const [totalStudents, setTotalStudents] = useState(85);
  const [activeStudents, setActiveStudents] = useState(72);
  const [participationRate, setParticipationRate] = useState(84.7);
  const [averageCompletion, setAverageCompletion] = useState(78.3);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  // Performance data
  const [performanceData, setPerformanceData] = useState({
    learningModules: { assigned: 45, completed: 38, accuracy: 82 },
    challenges: { assigned: 28, completed: 22, accuracy: 75 },
    environmental: { assigned: 15, completed: 12, accuracy: 88 },
    tasks: { assigned: 32, completed: 26, accuracy: 79 }
  });

  const [facultyRemarks, setFacultyRemarks] = useState('Students are showing consistent improvement in programming concepts. Need to focus more on data structures and algorithms.');

  const reportRef = useRef();

  // Fetch school data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // Simulated API call - replace with your actual endpoint
        const response = await axios.get('http://localhost:5000/api/users/me');
        
        if (response.data && response.data.schoolName) {
          setSchoolName(response.data.schoolName);
        } else {
          setSchoolName('Bajaj Institute of Technology, Wardha'); // Fallback
        }
        
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Silent fallback - no error message shown to user
        setSchoolName('Bajaj Institute of Technology, Wardha');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${schoolName} - Student Progress Report`,
        text: `Student Progress Report generated on ${reportDate}`,
        url: window.location.href,
      });
    } else {
      alert('Share functionality is not supported in your browser. You can copy the link manually.');
    }
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${schoolName.replace(/\s+/g, '_')}_Student_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadCSV = () => {
    const csvContent = [
      ['Student Progress Report', '', '', ''],
      ['School:', schoolName, '', ''],
      ['Report Date:', reportDate, '', ''],
      ['Faculty:', facultyName, '', ''],
      ['', '', '', ''],
      ['Student Summary', '', '', ''],
      ['Total Students', totalStudents, '', ''],
      ['Active Students', activeStudents, '', ''],
      ['Participation Rate', `${participationRate}%`, '', ''],
      ['Average Completion', `${averageCompletion}%`, '', ''],
      ['', '', '', ''],
      ['Performance Breakdown', 'Assigned', 'Completed', 'Accuracy'],
      ['Learning Modules', performanceData.learningModules.assigned, performanceData.learningModules.completed, `${performanceData.learningModules.accuracy}%`],
      ['Challenges', performanceData.challenges.assigned, performanceData.challenges.completed, `${performanceData.challenges.accuracy}%`],
      ['Environmental', performanceData.environmental.assigned, performanceData.environmental.completed, `${performanceData.environmental.accuracy}%`],
      ['Tasks', performanceData.tasks.assigned, performanceData.tasks.completed, `${performanceData.tasks.accuracy}%`],
      ['', '', '', ''],
      ['Faculty Remarks', facultyRemarks, '', '']
    ];

    const csvString = csvContent.map(row => 
      row.map(field => `"${field}"`).join(',')
    ).join('\n');

    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${schoolName.replace(/\s+/g, '_')}_Report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const calculateCompletionRate = (completed, assigned) => {
    return assigned > 0 ? ((completed / assigned) * 100).toFixed(1) : '0.0';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin mx-auto text-emerald-600 mb-4" size={48} />
          <p className="text-gray-600 text-lg">Loading student report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Report Container */}
      <div ref={reportRef} className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg border border-gray-200">
        
        {/* Header Section */}
        <div className="border-b border-gray-300 p-8 bg-white rounded-t-lg">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {schoolName}
            </h1>
            <h2 className="text-2xl font-semibold text-emerald-700 mb-6">
              OVERALL STUDENT PROGRESS REPORT
            </h2>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-end gap-3 p-4 bg-gray-50 border-b">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Printer size={18} />
            Print
          </button>
          <button 
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Share2 size={18} />
            Share
          </button>
          <button 
            onClick={handleDownloadCSV}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download size={18} />
            Download CSV
          </button>
          <button 
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-emerald-400 transition-colors"
          >
            {downloading ? (
              <Loader className="animate-spin" size={18} />
            ) : (
              <Download size={18} />
            )}
            {downloading ? 'Generating PDF...' : 'Download PDF'}
          </button>
        </div>

        {/* Report Content */}
        <div className="p-8 space-y-8">
          
          {/* 1. Faculty Details */}
          <section>
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">1. Faculty Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Faculty Name</label>
                <input
                  type="text"
                  value={facultyName}
                  onChange={(e) => setFacultyName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <div className="p-2 bg-gray-50 border border-gray-300 rounded text-gray-700">
                  Computer Engineering
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Report Date</label>
                <input
                  type="text"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
          </section>

          {/* 2. Student Summary */}
          <section>
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">2. Student Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-700">{totalStudents}</div>
                <div className="text-sm text-blue-600">Total Students</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-700">{activeStudents}</div>
                <div className="text-sm text-green-600">Active Students</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="text-2xl font-bold text-orange-700">{participationRate}%</div>
                <div className="text-sm text-orange-600">Participation Rate</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-2xl font-bold text-purple-700">{averageCompletion}%</div>
                <div className="text-sm text-purple-600">Avg Completion</div>
              </div>
            </div>
          </section>

          {/* 3. Overall Performance Overview */}
          <section>
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">3. Overall Performance Overview</h3>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-700 leading-relaxed">
                Students show moderate participation and steady academic progress. Overall performance indicates 
                improving engagement and consistent learning behavior. The cohort demonstrates strong foundational 
                knowledge with areas for improvement in advanced topics.
              </p>
            </div>
          </section>

          {/* 4. Performance Breakdown */}
          <section>
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">4. Performance Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-3 text-left font-semibold">Category</th>
                    <th className="border border-gray-300 p-3 text-center font-semibold">Assigned</th>
                    <th className="border border-gray-300 p-3 text-center font-semibold">Completed</th>
                    <th className="border border-gray-300 p-3 text-center font-semibold">Completion Rate</th>
                    <th className="border border-gray-300 p-3 text-center font-semibold">Avg Accuracy</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-3 font-medium">Learning Modules</td>
                    <td className="border border-gray-300 p-3 text-center">{performanceData.learningModules.assigned}</td>
                    <td className="border border-gray-300 p-3 text-center">{performanceData.learningModules.completed}</td>
                    <td className="border border-gray-300 p-3 text-center text-blue-600 font-medium">
                      {calculateCompletionRate(performanceData.learningModules.completed, performanceData.learningModules.assigned)}%
                    </td>
                    <td className="border border-gray-300 p-3 text-center text-green-600 font-medium">
                      {performanceData.learningModules.accuracy}%
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-3 font-medium">Challenges</td>
                    <td className="border border-gray-300 p-3 text-center">{performanceData.challenges.assigned}</td>
                    <td className="border border-gray-300 p-3 text-center">{performanceData.challenges.completed}</td>
                    <td className="border border-gray-300 p-3 text-center text-blue-600 font-medium">
                      {calculateCompletionRate(performanceData.challenges.completed, performanceData.challenges.assigned)}%
                    </td>
                    <td className="border border-gray-300 p-3 text-center text-green-600 font-medium">
                      {performanceData.challenges.accuracy}%
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-3 font-medium">Environmental</td>
                    <td className="border border-gray-300 p-3 text-center">{performanceData.environmental.assigned}</td>
                    <td className="border border-gray-300 p-3 text-center">{performanceData.environmental.completed}</td>
                    <td className="border border-gray-300 p-3 text-center text-blue-600 font-medium">
                      {calculateCompletionRate(performanceData.environmental.completed, performanceData.environmental.assigned)}%
                    </td>
                    <td className="border border-gray-300 p-3 text-center text-green-600 font-medium">
                      {performanceData.environmental.accuracy}%
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-3 font-medium">Tasks</td>
                    <td className="border border-gray-300 p-3 text-center">{performanceData.tasks.assigned}</td>
                    <td className="border border-gray-300 p-3 text-center">{performanceData.tasks.completed}</td>
                    <td className="border border-gray-300 p-3 text-center text-blue-600 font-medium">
                      {calculateCompletionRate(performanceData.tasks.completed, performanceData.tasks.assigned)}%
                    </td>
                    <td className="border border-gray-300 p-3 text-center text-green-600 font-medium">
                      {performanceData.tasks.accuracy}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 5. Key Gaps Identified & 6. Strengths */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Key Gaps */}
            <section>
              <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">5. Key Gaps Identified</h3>
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    Need improvement in accuracy for complex problems
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    Irregular submission patterns observed
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    Difficulty in understanding advanced OOP concepts
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    Time management in practical examinations
                  </li>
                </ul>
              </div>
            </section>

            {/* Strengths */}
            <section>
              <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">6. Strengths</h3>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    Good engagement trend throughout semester
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    Significant improvement in problem-solving skills
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    Active participation in practical tasks
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    Strong collaborative learning environment
                  </li>
                </ul>
              </div>
            </section>
          </div>

          {/* 7. Faculty Remarks */}
          <section>
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">7. Faculty Remarks</h3>
            <textarea
              value={facultyRemarks}
              onChange={(e) => setFacultyRemarks(e.target.value)}
              rows="4"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-vertical"
              placeholder="Enter your remarks and observations about student performance..."
            />
          </section>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-300 p-6 bg-gray-50 rounded-b-lg">
          <div className="text-center text-sm text-gray-500">
            <p>Generated on {new Date().toLocaleDateString()} • {schoolName}</p>
            <p className="mt-1">Confidential - For Internal Use Only</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentReport;