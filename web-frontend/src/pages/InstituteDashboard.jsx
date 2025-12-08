// src/pages/InstituteDashboard.jsx
import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { API } from "../utils/api";

import InstituteHeader from "../institute/InstituteHeader";
import InstituteSidebar from "../institute/InstituteSidebar";
import InstituteTypeOverview from "../institute/InstituteTypeOverview ";
import FacultyManagement from "../institute/FacultyManagement";
import StudentManagement from "../institute/StudentManagement";
import ChallengeManagement from "../institute/ChallengeManagement";
import ChallengeSubmissions from "../institute/ChallengeSubmissions";
import InstituteEventCreation from "../institute/InstituteEventCreation";
import InstitutePlantDrive from "../institute/InstitutePlantDrive";
// import AnalyticsDashboard from "../institute/AnalyticsDashboard";
// import InstituteSettings from "../institute/InstituteSettings";
// import Reports from "../institute/Reports";

export default function InstituteDashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("overview");

  const [instituteData, setInstituteData] = useState({
    name: user?.instituteName || "Institute",
    type: user?.instituteType || "school",
    email: user?.email || "",
    address: user?.address || "",
    phone: user?.phone || "",
    website: user?.website || "",
    establishedYear: user?.establishedYear || "",
    totalStudents: user?.totalStudents || 0,
    schoolLevel: user?.schoolLevel || "",
    grades: user?.grades || [],
    departments: user?.departments || [],
    faculties: user?.faculties || [],
    programs: user?.programs || [],
  });

  const [stats, setStats] = useState({
    totalFaculty: 0,
    totalStudents: 0,
    activeUsers: 0,
    totalEcoPoints: 0,
    participationRate: 0,
    recentActivity: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const fetchInstituteStats = async () => {
    if (!user || !user._id) return;

    try {
      setLoading(true);
      setError(null);

      const res = await API.get(`/institute/${user._id}/assignment-stats`);

      setStats(res.data);
    } catch (err) {
      console.error("Error fetching institute stats:", err);
      setError(err.response?.data?.message || "Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  // In InstituteDashboard.jsx, add this check:
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Better token validation
    try {
      const parts = token.split(".");
      if (parts.length !== 3) {
        console.error("Invalid token format");
        logout();
        return;
      }
      const payload = JSON.parse(atob(parts[1]));
      console.log("User role:", payload.role);
      console.log("User ID:", payload.id);
    } catch (err) {
      console.error("Invalid token:", err);
      logout();
    }
  }, []);

  useEffect(() => {
    fetchInstituteStats();
    if (user) {
      setInstituteData({
        name: user.instituteName || "Institute",
        type: user.instituteType || "school",
        email: user.email || "",
        address: user.address || "",
        phone: user.phone || "",
        website: user.website || "",
        establishedYear: user.establishedYear || "",
        totalStudents: user.totalStudents || 0,
        schoolLevel: user.schoolLevel || "",
        grades: user.grades || [],
        departments: user.departments || [],
        faculties: user.faculties || [],
        programs: user.programs || [],
      });
    }
  }, [user]);

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return (
          <InstituteTypeOverview // Now using the correct component name
            instituteData={instituteData}
            stats={stats}
            loading={loading}
            error={error}
          />
        );
      case "faculty":
        return <FacultyManagement instituteId={user?._id} />;
      case "students":
        return <StudentManagement instituteId={user?._id} />;
      case "challenges":
        return (
          <ChallengeManagement
            instituteId={user?._id}
            instituteData={instituteData}
          />
        );
      case "submissions":
        return <ChallengeSubmissions instituteId={user?._id} />;
      case "events":
        return <InstituteEventCreation />;
      case "plant_drives":
        return <InstitutePlantDrive instituteId={user?._id} />;

      default:
        return (
          <InstituteTypeOverview // Also fixed here
            instituteData={instituteData}
            stats={stats}
            loading={loading}
            error={error}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
      <InstituteHeader instituteData={instituteData} stats={stats} />

      <div className="flex flex-1">
        <InstituteSidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          instituteData={instituteData}
          onLogout={handleLogout}
        />

        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="container mx-auto max-w-7xl">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
}
