import React from "react";
import {
  LayoutDashboard,
  UserCog,
  ListTodo,
  Trophy,
  FileText,
  LogOut
} from "lucide-react";

export default function AdminSidebar({ activeTab, onTabChange, onLogout, user }) {
  const navItems = [
    { id: "dashboard", name: "Dashboard", icon: LayoutDashboard },
    { id: "manage-users", name: "Manage Users", icon: UserCog },
    { id: "manage-challenges", name: "Manage Challenges", icon: ListTodo },
    { id: "leaderboard", name: "Leaderboard", icon: Trophy },
    { id: "reports", name: "Reports", icon: FileText }
  ];

  return (
    <aside className="w-72 bg-white border-r border-slate-200 shadow-sm flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">E</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">EcoQuest</h2>
            <p className="text-xs text-slate-500">Admin Panel</p>
          </div>
        </div>
      </div>

      <nav className="p-4 flex-1 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onTabChange(item.id)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center space-x-3 ${
                  activeTab === item.id
                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-200">
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg hover:bg-red-50 transition-colors text-red-600 border border-red-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}