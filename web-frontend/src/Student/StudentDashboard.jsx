import React, { useState, useEffect } from "react";
import SettingsContent from "./SettingsContent";

export default function StudentDashboard() {
  const [studentData, setStudentData] = useState({});

  useEffect(() => {
    // Get logged-in user from localStorage
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser && storedUser._id) {
      setStudentData(storedUser);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("user");
    window.location.assign("/login");
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-green-800">
        Student Dashboard
      </h1>

      {/* Pass studentData and setter to SettingsContent */}
      {studentData._id ? (
        <SettingsContent
          studentData={studentData}
          setStudentData={setStudentData}
          logout={logout}
          navigate={(path) => window.location.assign(path)}
        />
      ) : (
        <p>Loading your profile...</p>
      )}
    </div>
  );
}
