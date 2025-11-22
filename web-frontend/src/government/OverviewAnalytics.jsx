// src/government/OverviewAnalytics.jsx
import React from 'react';
import { Building, Users, CheckCircle, Clock, TrendingUp, MapPin } from 'lucide-react';

const OverviewAnalytics = ({ analytics, loading, error, refresh }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        <p>{error}</p>
        <button 
          onClick={refresh}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  const stats = analytics?.stats || {
    totalInstitutes: 0,
    activeInstitutes: 0,
    pendingApprovals: 0,
    totalUsers: 0,
    growthRate: 0,
    regionalDistribution: []
  };

  const recentRegistrations = analytics?.recentRegistrations || [];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Total Institutes</p>
              <h3 className="text-3xl font-bold text-gray-800">{stats.totalInstitutes}</h3>
            </div>
            <Building className="text-blue-500" size={32} />
          </div>
          <div className="mt-2 flex items-center text-sm text-green-500">
            <TrendingUp size={16} />
            <span className="ml-1">+{stats.growthRate}% this month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Active Institutes</p>
              <h3 className="text-3xl font-bold text-gray-800">{stats.activeInstitutes}</h3>
            </div>
            <CheckCircle className="text-green-500" size={32} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Pending Approvals</p>
              <h3 className="text-3xl font-bold text-gray-800">{stats.pendingApprovals}</h3>
            </div>
            <Clock className="text-orange-500" size={32} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Total Users</p>
              <h3 className="text-3xl font-bold text-gray-800">{stats.totalUsers}</h3>
            </div>
            <Users className="text-purple-500" size={32} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registrations */}
        <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-blue-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Registrations</h3>
          <div className="space-y-3">
            {recentRegistrations.map((institute, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Building size={20} className="text-blue-500" />
                  <div>
                    <p className="font-medium text-gray-800">{institute.name}</p>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <MapPin size={14} />
                      {institute.location}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  institute.status === 'approved' 
                    ? 'bg-green-100 text-green-800'
                    : institute.status === 'pending'
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {institute.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Regional Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-blue-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Regional Distribution</h3>
          <div className="space-y-3">
            {stats.regionalDistribution?.map((region, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{region.region}</span>
                  <span className="font-medium text-gray-800">{region.count} institutes</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${(region.count / stats.totalInstitutes) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewAnalytics;