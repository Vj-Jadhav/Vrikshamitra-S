// src/government/Reports.jsx
import React, { useState } from 'react';
import { Download, FileText, Calendar, Filter, Printer, Mail } from 'lucide-react';


const Reports = ({ adminData }) => {
  const [selectedReport, setSelectedReport] = useState('');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [format, setFormat] = useState('pdf');

  
//dummy 
const [history, setHistory] = useState([]);


  const reportTypes = [
    {
      id: 'institute-summary',
      name: 'Institute Summary Report',
      description: 'Complete overview of all registered institutes'
    },
    {
      id: 'user-activity',
      name: 'User Activity Report',
      description: 'Detailed user engagement and activity metrics'
    },
    {
      id: 'registration-trends',
      name: 'Registration Trends Report',
      description: 'Analysis of registration patterns over time'
    },
    {
      id: 'approval-statistics',
      name: 'Approval Statistics Report',
      description: 'Institute approval rates and processing times'
    },
    {
      id: 'regional-analysis',
      name: 'Regional Analysis Report',
      description: 'Geographical distribution and performance'
    },
    {
      id: 'system-usage',
      name: 'System Usage Report',
      description: 'Platform usage statistics and metrics'
    }
  ];

  // Simulated report builder (mock backend)
const createMockReportFile = async ({ type, format, dateRange }) => {
  const fileName = `${type}_${Date.now()}.${format === "excel" ? "xlsx" : format}`;
  const blobContent = `
    Report Type: ${type}
    Format: ${format}
    Date Range: ${dateRange.start} to ${dateRange.end}
    Generated: ${new Date().toLocaleString()}
    Admin: ${adminData?.name || "Unknown Admin"}

    ----- SAMPLE DATA -----
    This is mock report content. Replace with real backend data later.
  `;

  const blob = new Blob([blobContent], {
    type: "text/plain",
  });

  return { fileName, blob };
};


const generateReport = async () => {
  if (!selectedReport) {
    alert("Please select a report type");
    return;
  }

  console.log("Generating report...");

  const report = await createMockReportFile({
    type: selectedReport,
    format,
    dateRange,
  });

  // Download automatically
  const url = URL.createObjectURL(report.blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = report.fileName;
  link.click();
  URL.revokeObjectURL(url);

  // Add to history
  setHistory((prev) => [
    {
      name: selectedReport,
      format,
      date: new Date().toLocaleString(),
      fileName: report.fileName,
    },
    ...prev,
  ]);
};


//   const generateReport = () => {
//     if (!selectedReport) {
//       alert('Please select a report type');
//       return;
//     }
//     // Implement report generation logic
//     console.log('Generating report:', {
//       type: selectedReport,
//       format,
//       dateRange
//     });
//   };

//for dummy data testing
const generateReportFromQuick = async (type) => {
  const report = await createMockReportFile({
    type,
    format: "pdf",
    dateRange: { start: "-", end: "-" }
  });

  const url = URL.createObjectURL(report.blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = report.fileName;
  link.click();
  URL.revokeObjectURL(url);

  setHistory((prev) => [
    {
      name: type,
      format: "pdf",
      date: new Date().toLocaleString(),
      fileName: report.fileName,
    },
    ...prev,
  ]);
};


  const quickReports = [
    {
      name: 'Monthly Summary',
      description: 'Current month overview',
    //   action: () => console.log('Generate monthly summary')
    action: () => generateReportFromQuick("monthly-summary")

    },
    {
      name: 'Pending Approvals',
      description: 'Institutes awaiting review',
      action: () => console.log('Generate pending approvals report')
    },
    {
      name: 'Top Performing',
      description: 'Best performing institutes',
      action: () => console.log('Generate top performers report')
    },
    {
      name: 'System Health',
      description: 'Platform performance metrics',
      action: () => console.log('Generate system health report')
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Reports & Exports</h2>
        <div className="text-sm text-gray-600">
          Last generated: Today, 10:30 AM
        </div>
      </div>

      {/* Quick Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickReports.map((report, index) => (
          <button
            key={index}
            onClick={report.action}
            className="bg-white p-6 rounded-xl shadow-lg border-2 border-blue-100 hover:border-blue-300 transition-all text-left"
          >
            <FileText className="text-blue-500 mb-3" size={32} />
            <h3 className="font-bold text-gray-800 mb-2">{report.name}</h3>
            <p className="text-sm text-gray-600">{report.description}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Configuration */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg border-2 border-blue-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Generate Custom Report</h3>
          
          <div className="space-y-4">
            {/* Report Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Type
              </label>
              <select
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a report type</option>
                {reportTypes.map(report => (
                  <option key={report.id} value={report.id}>
                    {report.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Export Format
              </label>
              <div className="flex gap-4">
                {['pdf', 'excel', 'csv'].map((fmt) => (
                  <label key={fmt} className="flex items-center">
                    <input
                      type="radio"
                      value={fmt}
                      checked={format === fmt}
                      onChange={(e) => setFormat(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">{fmt.toUpperCase()}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={generateReport}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2"
              >
                <Download size={20} />
                Generate Report
              </button>
              <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-2 rounded-lg flex items-center gap-2">
                <Printer size={20} />
                Print Preview
              </button>
              <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-2 rounded-lg flex items-center gap-2">
                <Mail size={20} />
                Email Report
              </button>
            </div>
          </div>
        </div>

        {/* Report History */}
        {/* <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-blue-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Reports</h3>
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-gray-800">Institute Summary</span>
                  <span className="text-xs text-gray-500">2 days ago</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">Complete overview of all institutes</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">PDF • 2.4 MB</span>
                  <button className="text-blue-600 hover:text-blue-800 text-sm">
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div> */}
        {/* Report History */}
            <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-blue-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Reports</h3>

            {history.length === 0 ? (
                <p className="text-gray-500 text-sm">No reports generated yet.</p>
            ) : (
                <div className="space-y-3">
                {history.map((item, index) => (
                    <div key={index} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-gray-800">{item.name}</span>
                        <span className="text-xs text-gray-500">{item.date}</span>
                    </div>

                    <p className="text-sm text-gray-600 mb-2">{item.format.toUpperCase()} File</p>

                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">{item.fileName}</span>
                        <button
                        className="text-blue-600 hover:text-blue-800 text-sm"
                        onClick={() => {
                            const url = URL.createObjectURL(new Blob(["Mock content"]));
                            const link = document.createElement("a");
                            link.href = url;
                            link.download = item.fileName;
                            link.click();
                            URL.revokeObjectURL(url);
                        }}
                        >
                        Download
                        </button>
                    </div>
                    </div>
                ))}
                </div>
            )}
            </div>

      </div>

      {/* Report Types Grid */}
      <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-blue-100">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Available Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reportTypes.map((report) => (
            <div
              key={report.id}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-all cursor-pointer"
              onClick={() => setSelectedReport(report.id)}
            >
              <div className="flex items-center gap-3 mb-2">
                <FileText className="text-blue-500" size={20} />
                <h4 className="font-semibold text-gray-800">{report.name}</h4>
              </div>
              <p className="text-sm text-gray-600">{report.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reports;