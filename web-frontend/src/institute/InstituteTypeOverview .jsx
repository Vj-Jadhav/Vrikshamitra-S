// src/institute/InstituteTypeOverview.jsx
import React from 'react';
import { School, Building2, University, Users, BookOpen, GraduationCap } from 'lucide-react';

const InstituteTypeOverview = ({ instituteData, stats = {}, loading, error }) => {
  // Helper function to safely format values
  const formatValue = (value, isString = false) => {
    if (value === undefined || value === null) {
      return isString ? "N/A" : "0";
    }
    
    if (isString) {
      return value || "N/A";
    }
    
    // If it's already a string, return it
    if (typeof value === 'string') {
      return value;
    }
    
    // If it's a number, format it
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    
    // For arrays, return count
    if (Array.isArray(value)) {
      return value.length.toLocaleString();
    }
    
    return String(value);
  };

  const getInstituteSpecificStats = () => {
    // Safeguard stats
    const safeStats = stats || {};
    
    const baseStats = [
      {
        title: "Total Faculty",
        value: safeStats.totalFaculty || 0,
        icon: Users,
        color: "blue"
      },
      {
        title: "Total Students",
        value: safeStats.totalStudents || 0,
        icon: GraduationCap,
        color: "green"
      }
    ];

    // Safeguard instituteData
    const safeInstituteData = instituteData || {};

    switch (safeInstituteData.type) {
      case 'school':
        return [
          ...baseStats,
          {
            title: "Grade Levels",
            value: safeInstituteData.grades?.length || 0,
            icon: School,
            color: "orange",
            description: "Active Grades"
          },
          {
            title: "School Level",
            value: safeInstituteData.schoolLevel || "Not specified",
            icon: Building2,
            color: "purple",
            isString: true
          }
        ];
      
      case 'college':
        return [
          ...baseStats,
          {
            title: "Departments",
            value: safeInstituteData.departments?.length || 0,
            icon: Building2,
            color: "indigo",
            description: "Academic Departments"
          },
          {
            title: "Courses",
            value: safeInstituteData.courses?.length || 0,
            icon: BookOpen,
            color: "red",
            description: "Offered Courses"
          }
        ];
      
      case 'university':
        return [
          ...baseStats,
          {
            title: "Faculties",
            value: safeInstituteData.faculties?.length || 0,
            icon: University,
            color: "teal",
            description: "University Faculties"
          },
          {
            title: "Programs",
            value: safeInstituteData.programs?.length || 0,
            icon: BookOpen,
            color: "pink",
            description: "Degree Programs"
          }
        ];
      
      default:
        return baseStats;
    }
  };

  // Handle loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center text-red-600">
          <h3 className="font-semibold">Error Loading Data</h3>
        </div>
        <p className="text-red-700 mt-2">{error}</p>
      </div>
    );
  }

  const statsConfig = getInstituteSpecificStats();

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome back, {instituteData?.name || "Institute"}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here's what's happening with your eco-initiatives today.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsConfig.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: 'bg-blue-100 text-blue-600',
            green: 'bg-green-100 text-green-600',
            orange: 'bg-orange-100 text-orange-600',
            purple: 'bg-purple-100 text-purple-600',
            indigo: 'bg-indigo-100 text-indigo-600',
            red: 'bg-red-100 text-red-600',
            teal: 'bg-teal-100 text-teal-600',
            pink: 'bg-pink-100 text-pink-600'
          };

          return (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${colorClasses[stat.color] || 'bg-gray-100'}`}>
                  <Icon size={24} />
                </div>
                {stat.change && (
                  <span className={`text-sm font-semibold ${
                    stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {stat.change}
                  </span>
                )}
              </div>
              <div className="text-2xl font-bold text-gray-800 mb-1">
                {formatValue(stat.value, stat.isString)}
              </div>
              <div className="text-sm font-medium text-gray-600">{stat.title}</div>
              {stat.description && (
                <div className="text-xs text-gray-500 mt-1">{stat.description}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InstituteTypeOverview;