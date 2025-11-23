// src/institute/InstituteSidebar.jsx
import React from "react";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Building,
  BarChart3,
  Settings,
  FileText,
  LogOut,
  School,
  Network, 
  Target, // NEW
  Send // NEW
} from "lucide-react";

const InstituteSidebar = ({
  activeSection,
  setActiveSection,
  instituteData,
  onLogout,
}) => {
  const menuItems = [
    { id: "overview", icon: LayoutDashboard, label: "Dashboard Overview" },
    { id: "faculty", icon: Users, label: "Faculty Management" },
    { id: "students", icon: GraduationCap, label: "Student Management" },
    { id: "structure", icon: Network, label: "Department Structure" },
    { id: "challenges", icon: Target, label: "Challenges" }, // NEW
    { id: "submissions", icon: Send, label: "My Submissions" }, // NEW
    { id: "analytics", icon: BarChart3, label: "Analytics" },
    { id: "reports", icon: FileText, label: "Reports" },
    { id: "settings", icon: Settings, label: "Institute Settings" },
  ];

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

 return (
    <aside className="w-72 bg-white shadow-2xl border-r-2 border-blue-100 flex flex-col sticky top-0 h-screen">
      {/* Sidebar Header */}
      <div className="p-6 border-b-2 border-blue-100">
        <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border-2 border-blue-200">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xl">
            {getInitials(instituteData.name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-gray-800 truncate">{instituteData.name}</div>
            <div className="text-sm text-gray-600 capitalize">{instituteData.type}</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg scale-105"
                    : "text-gray-700 hover:bg-blue-50 hover:scale-102"
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t-2 border-blue-100">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all font-medium"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default InstituteSidebar;