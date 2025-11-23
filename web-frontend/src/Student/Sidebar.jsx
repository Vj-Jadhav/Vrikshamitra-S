// src/components/Sidebar.jsx
import React, { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import {
  Home,
  Target,
  BookOpen,
  Trophy,
  Gift,
  Settings,
  LogOut,
  FileText,
  Menu,
  Bell,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Sidebar = (props) => {
  // Ensure we always have objects
  const {
    studentData: rawStudentData,
    user: rawUser,
    activeTab = "dashboard",
    setActiveTab,
    logout = () => {},
    navigate,
    notificationsCount = 0,
  } = props;

  const studentData = rawStudentData || {};
  const user = rawUser || {};

  const [openMobile, setOpenMobile] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setOpenMobile(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "challenges", label: "Challenges", icon: Target },
    { id: "learning", label: "Learning", icon: BookOpen },
    { id: "games", label: "Games", icon: Trophy },
    { id: "library", label: "Library", icon: FileText },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy },
    { id: "rewards", label: "Rewards", icon: Gift },
    { id: "event", label: "Event Calender", icon: Calendar },
  ];

  const safeSetTab = (id) => {
    if (typeof setActiveTab === "function") setActiveTab(id);
    else if (typeof navigate === "function") navigate(`/${id}`);
    if (window.innerWidth < 768) setOpenMobile(false);
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      if (typeof navigate === "function") navigate("/login");
    }
  };

  const getInitials = (name = "") => {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const panelVariants = {
    hidden: { x: -320, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 260, damping: 30 } },
    exit: { x: -320, opacity: 0, transition: { duration: 0.2 } },
  };

  const schoolDisplay = studentData?.schoolName || user?.schoolName || "No school";
  const displayName = studentData?.name || user?.name || "Student";

  return (
    <>
      {/* Mobile toggle */}
      <div className="fixed left-4 bottom-6 z-50 md:hidden">
        <button
          onClick={() => setOpenMobile(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg flex items-center justify-center"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex md:flex-col sticky top-0 h-screen bg-white border-r shadow-sm transition-width duration-200
          ${collapsed ? "w-20" : "w-64"}`}
      >
        <div className="p-4 border-b flex items-center gap-3">
          {studentData?.avatarUrl ? (
            <img src={studentData.avatarUrl} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-semibold">
              {getInitials(displayName)}
            </div>
          )}
          {!collapsed && (
            <div>
              <div className="font-semibold text-gray-800">{displayName}</div>
              <div className="text-xs text-gray-500">{schoolDisplay}</div>
            </div>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-auto p-3 space-y-2">
          {menuItems.map((it) => {
            const Icon = it.icon;
            const isActive = activeTab === it.id;
            return (
              <button
                key={it.id}
                onClick={() => safeSetTab(it.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg
                  ${isActive ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow" : "text-gray-700 hover:bg-gray-50"}`}
              >
                <Icon size={18} className={isActive ? "text-white" : "text-gray-600"} />
                {!collapsed && <span>{it.label}</span>}
              </button>
            );
          })}

          {/* Notifications */}
          <button
            onClick={() => safeSetTab("notifications")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg
              ${activeTab === "notifications" ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white" : "text-gray-700 hover:bg-gray-50"}`}
          >
            <Bell size={18} />
            {!collapsed && <span>Notifications</span>}
            {!collapsed && notificationsCount > 0 && (
              <span className="ml-auto inline-flex items-center justify-center w-6 h-6 bg-red-500 text-xs text-white rounded-full">
                {notificationsCount}
              </span>
            )}
          </button>
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t flex items-center gap-2">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            {!collapsed && "Collapse"}
          </button>

          <div className="ml-auto">
            <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100">
              <LogOut size={16} />
              {!collapsed && "Logout"}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {openMobile && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpenMobile(false)}
            />

            <motion.aside
              className="fixed left-0 top-0 bottom-0 z-50 w-72 bg-white"
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                  {studentData?.avatarUrl ? (
                    <img src={studentData.avatarUrl} alt="avatar" className="w-10 h-10 rounded-full" />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {getInitials(displayName)}
                    </div>
                  )}
                  <div>
                    <div className="font-semibold">{displayName}</div>
                    <div className="text-xs text-gray-500">{schoolDisplay}</div>
                  </div>
                </div>

                <button onClick={() => setOpenMobile(false)} className="p-2 rounded hover:bg-gray-100">
                  <X size={18} />
                </button>
              </div>

              <nav className="p-3 space-y-2">
                {menuItems.map((it) => {
                  const Icon = it.icon;
                  const isActive = activeTab === it.id;
                  return (
                    <button
                      key={it.id}
                      onClick={() => safeSetTab(it.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg
                        ${isActive ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white" : "text-gray-700 hover:bg-gray-50"}`}
                    >
                      <Icon size={18} />
                      {it.label}
                    </button>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
