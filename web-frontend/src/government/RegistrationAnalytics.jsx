// src/government/RegistrationAnalytics.jsx
import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Building, Calendar, Download, Filter } from 'lucide-react';
import { API } from "../utils/api";

const RegistrationAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

//   const fetchAnalytics = async () => {
//     try {
//       const res = await API.get(`/government/analytics/registrations?range=${timeRange}`);
//       setAnalytics(res.data);
//     } catch (error) {
//       console.error('Error fetching analytics:', error);
//     } finally {
//       setLoading(false);
//     }
//   };


const fetchAnalytics = async () => {
  try {
    setLoading(true);

    // Simulate API delay
    await new Promise((res) => setTimeout(res, 600));

    // --- MOCK ANALYTICS DATA ---
    const sample = {
      totalRegistrations: 482,
      growthRate: 14,
      approvalRate: 76,
      avgProcessingTime: 5,

      userGrowth: {
        previous: 3100,
        current: 3540,
      },

      timeline: [
        { date: "2025-01-01", count: 32 },
        { date: "2025-01-02", count: 48 },
        { date: "2025-01-03", count: 51 },
        { date: "2025-01-04", count: 40 },
        { date: "2025-01-05", count: 27 },
        { date: "2025-01-06", count: 38 },
        { date: "2025-01-07", count: 60 },
      ],

      instituteTypes: [
        { name: "Technical Colleges", count: 120, percentage: 38, color: "#3B82F6" },
        { name: "Polytechnics", count: 80, percentage: 25, color: "#10B981" },
        { name: "Training Institutes", count: 95, percentage: 20, color: "#F59E0B" },
        { name: "Others", count: 60, percentage: 17, color: "#8B5CF6" },
      ],

      regionalStats: [
        { name: "North Region", institutes: 42, users: 1200, growth: 12, activeRate: 78 },
        { name: "South Region", institutes: 38, users: 950, growth: 8, activeRate: 72 },
        { name: "East Region", institutes: 50, users: 1100, growth: -3, activeRate: 68 },
        { name: "West Region", institutes: 46, users: 980, growth: 5, activeRate: 74 },
      ],
    };

    setAnalytics(sample);
  } catch (error) {
    console.error("Error loading mock analytics:", error);
  } finally {
    setLoading(false);
  }
};

  const exportData = () => {
    // Implement export functionality
    console.log('Exporting analytics data...');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const { timeline, instituteTypes, regionalStats, userGrowth } = analytics || {};

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Registration Analytics</h2>
        <div className="flex gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
          <button
            onClick={exportData}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Download size={20} />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Total Registrations</p>
              <h3 className="text-3xl font-bold text-gray-800">{analytics?.totalRegistrations || 0}</h3>
            </div>
            <Building className="text-blue-500" size={32} />
          </div>
          <div className="mt-2 flex items-center text-sm text-green-500">
            <TrendingUp size={16} />
            <span className="ml-1">+{analytics?.growthRate || 0}% growth</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Active Users</p>
              <h3 className="text-3xl font-bold text-gray-800">{userGrowth?.current || 0}</h3>
            </div>
            <Users className="text-green-500" size={32} />
          </div>
          <div className="mt-2 text-sm text-gray-600">
            From {userGrowth?.previous || 0} last period
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Approval Rate</p>
              <h3 className="text-3xl font-bold text-gray-800">{analytics?.approvalRate || 0}%</h3>
            </div>
            <TrendingUp className="text-purple-500" size={32} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Avg. Processing Time</p>
              <h3 className="text-3xl font-bold text-gray-800">{analytics?.avgProcessingTime || 0}d</h3>
            </div>
            <Calendar className="text-orange-500" size={32} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration Timeline */}
        <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-blue-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Registration Timeline</h3>
          <div className="space-y-3">
            {timeline?.map((item, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.date}</span>
                  <span className="font-medium text-gray-800">{item.count} registrations</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ 
                      width: `${(item.count / Math.max(...timeline.map(t => t.count))) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Institute Types Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-blue-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Institute Types</h3>
          <div className="space-y-4">
            {instituteTypes?.map((type, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{type.name}</span>
                  <span className="font-medium text-gray-800">{type.count} ({type.percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full" 
                    style={{ 
                      width: `${type.percentage}%`,
                      backgroundColor: type.color || '#3B82F6'
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Regional Statistics */}
      <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-blue-100">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Regional Statistics</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Region</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Institutes</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Users</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Growth</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Active Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {regionalStats?.map((region, index) => (
                <tr key={index}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{region.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{region.institutes}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{region.users}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`flex items-center gap-1 ${
                      region.growth >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <TrendingUp size={14} />
                      {region.growth}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{region.activeRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RegistrationAnalytics;