// src/government/GovernmentSidebar.jsx
import React from "react";
import {
  LayoutDashboard,
  Building,
  Users,
  TrendingUp,
  FileText,
  LogOut,
  Settings,
  Shield,
  Clock,
  Crosshair,
  TreePine  // New icon for plant drives
} from "lucide-react";

const GovernmentSidebar = ({
  activeSection,
  setActiveSection,
  adminData,
  onLogout,
}) => {
  const menuItems = [
    { id: "overview", icon: LayoutDashboard, label: "Dashboard Overview" },
    { id: "institutes", icon: Building, label: "Institute Management" },
    { id: "users", icon: Users, label: "User Management" },
    { id: "challenges", icon: Crosshair, label: "Challenge Management" },
    { id: "plant-drives", icon: TreePine, label: "Plant Drive Management" }, // New item
    { id: "registrations", icon: TrendingUp, label: "Registration Analytics" },
    { id: "reports", icon: FileText, label: "Reports & Exports" },
    { id: "settings", icon: Settings, label: "System Settings" },
  ];

  return (
    <aside className="w-72 bg-white shadow-2xl border-r-2 border-blue-100 flex flex-col sticky top-0 h-screen">
      {/* Sidebar Header */}
      <div className="p-6 border-b-2 border-blue-100">
        <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-xl border-2 border-blue-200">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-xl">
            <Shield size={24} />
          </div>
          <div>
            <div className="font-bold text-gray-800">{adminData.name}</div>
            <div className="text-sm text-gray-600">Government Admin</div>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Total Institutes</span>
            <span className="font-bold text-blue-600">{adminData.totalInstitutes}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Pending Plant Drives</span>
            <span className="font-bold text-orange-500 flex items-center gap-1">
              <Clock size={14} />
              {adminData.pendingPlantDrives || 0}
            </span>
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

export default GovernmentSidebar;