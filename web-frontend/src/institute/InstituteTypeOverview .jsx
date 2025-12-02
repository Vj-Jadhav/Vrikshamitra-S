// src/institute/InstituteTypeOverview.jsx
import React from 'react';
import { School, Building2, University, Users, BookOpen, GraduationCap } from 'lucide-react';

const InstituteTypeOverview = ({ instituteData, stats }) => {
  const getInstituteSpecificStats = () => {
    const baseStats = [
      {
        title: "Total Faculty",
        value: stats.totalFaculty,
        icon: Users,
        color: "blue"
      },
      {
        title: "Total Students",
        value: stats.totalStudents,
        icon: GraduationCap,
        color: "green"
      }
    ];

    switch (instituteData.type) {
      case 'school':
        return [
          ...baseStats,
          {
            title: "Grade Levels",
            value: instituteData.grades?.length || 0,
            icon: School,
            color: "orange",
            description: "Active Grades"
          },
          {
            title: "School Level",
            value: instituteData.schoolLevel,
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
            value: instituteData.departments?.length || 0,
            icon: Building2,
            color: "indigo",
            description: "Academic Departments"
          },
          {
            title: "Courses",
            value: instituteData.courses?.length || 0,
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
            value: instituteData.faculties?.length || 0,
            icon: University,
            color: "teal",
            description: "University Faculties"
          },
          {
            title: "Programs",
            value: instituteData.programs?.length || 0,
            icon: BookOpen,
            color: "pink",
            description: "Degree Programs"
          }
        ];
      
      default:
        return baseStats;
    }
  };

  const statsConfig = getInstituteSpecificStats();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsConfig.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                <Icon className={`text-${stat.color}-600`} size={24} />
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
              {stat.isString ? stat.value : stat.value.toLocaleString()}
            </div>
            <div className="text-sm font-medium text-gray-600">{stat.title}</div>
            {stat.description && (
              <div className="text-xs text-gray-500 mt-1">{stat.description}</div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default InstituteTypeOverview;