/** @format */
import React from "react";
import {
  LayoutDashboard,
  Trophy,
  Users,
  BookOpen,
  Calendar,
  FileText,
  LogOut,
  Newspaper,
  GraduationCap,
  Library, // optional import if your icon set includes it
  FolderPlus, // used for "Add Module"
  Image as ImageIcon, // fallback for library if "Library" icon unavailable
} from "lucide-react";

const FacultySidebar = ({
  activeSection,
  setActiveSection,
  facultyData,
  onLogout,
}) => {
  const menuItems = [
    { id: "overview", icon: LayoutDashboard, label: "Dashboard Overview" },
    { id: "challenges", icon: Trophy, label: "Manage Challenges" },
    { id: "students", icon: Users, label: "Students Progress" },
    { id: "submissions", icon: FileText, label: "Submissions" },

    // 🆕 Updated menu item for your new Library Upload section
    {
      id: "library",
      icon: ImageIcon, // distinct icon for the content library
      label: "Library Uploads",
    },

    // Slightly changed icon to differentiate from library
    { id: "add-module", icon: FolderPlus, label: "Add Learning Module" },
    {
      id: "learning-content",
      icon: GraduationCap,
      label: "Learning Content",
    },
    { id: "blogs", icon: Newspaper, label: "Blogs" },
    { id: "events", icon: Calendar, label: "Event Calendar" },
    { id: "reports", icon: FileText, label: "Reports" },
  ];

  return (
    <aside className="w-72 bg-white shadow-2xl border-r-2 border-emerald-100 flex flex-col sticky top-0 h-screen">
      {/* Sidebar Header */}
      <div className="p-6 border-b-2 border-emerald-100">
        <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-xl border-2 border-emerald-200">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-xl">
            {facultyData.name?.split(" ").map((n) => n[0]).join("") || "FM"}
          </div>
          <div>
            <div className="font-bold text-gray-800">{facultyData.name}</div>
            <div className="text-sm text-gray-600">Faculty</div>
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
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg scale-105"
                    : "text-gray-700 hover:bg-emerald-50 hover:scale-102"
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
      <div className="p-4 border-t-2 border-emerald-100">
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

export default FacultySidebar;
