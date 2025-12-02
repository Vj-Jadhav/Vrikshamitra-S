// Enhanced InstituteHeader.jsx
import React from 'react';
import { Building2, Users, GraduationCap, Award, School, University } from 'lucide-react';

const InstituteHeader = ({ instituteData, stats }) => {
  const getInstituteTypeIcon = (type) => {
    switch (type) {
      case 'school':
        return <School size={24} />;
      case 'college':
        return <Building2 size={24} />;
      case 'university':
        return <University size={24} />;
      default:
        return <Building2 size={24} />;
    }
  };

  const getInstituteSpecificStats = () => {
    const baseStats = [
      {
        title: "Faculty",
        value: stats.totalFaculty,
        icon: Users,
      },
      {
        title: "Students", 
        value: stats.totalStudents,
        icon: GraduationCap,
      },
      {
        title: "Eco Points",
        value: stats.totalEcoPoints,
        icon: Award,
      }
    ];

    switch (instituteData.type) {
      case 'school':
        return [
          ...baseStats,
          {
            title: "Grades",
            value: instituteData.grades?.length || 0,
            icon: School,
          }
        ];
      case 'college':
        return [
          ...baseStats,
          {
            title: "Departments",
            value: instituteData.departments?.length || 0,
            icon: Building2,
          }
        ];
      case 'university':
        return [
          ...baseStats,
          {
            title: "Faculties", 
            value: instituteData.faculties?.length || 0,
            icon: University,
          }
        ];
      default:
        return baseStats;
    }
  };

  const headerStats = getInstituteSpecificStats();

  return (
    <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 shadow-2xl sticky top-0 z-50">
      <div className="container mx-auto">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              {getInstituteTypeIcon(instituteData.type)}
              {instituteData.name}
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm capitalize">
                {instituteData.type}
              </span>
              {instituteData.schoolLevel && (
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                  {instituteData.schoolLevel}
                </span>
              )}
              {instituteData.universityAffiliated && (
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                  Affiliated to {instituteData.universityAffiliated}
                </span>
              )}
              <span className="text-blue-100">
                Est. {instituteData.establishedYear}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {headerStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                  <Icon className="mx-auto mb-1" size={20} />
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-blue-100">{stat.title}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};

export default InstituteHeader;