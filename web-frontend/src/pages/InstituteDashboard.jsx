// src/pages/InstituteDashboard.jsx
import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { API } from "../utils/api";

import InstituteHeader from "../institute/InstituteHeader";
import InstituteSidebar from "../institute/InstituteSidebar";
import InstituteOverview from "../institute/InstituteTypeOverview ";
import FacultyManagement from "../institute/FacultyManagement";
import StudentManagement from "../institute/StudentManagement";
import ChallengeManagement from "../institute/ChallengeManagement";
import ChallengeSubmissions from "../institute/ChallengeSubmissions";
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
    // Type-specific data
    schoolLevel: user?.schoolLevel || "",
    grades: user?.grades || [],
    departments: user?.departments || [],
    faculties: user?.faculties || [],
    programs: user?.programs || []
  });

  const [stats, setStats] = useState({
    totalFaculty: 0,
    totalStudents: 0,
    activeUsers: 0,
    totalEcoPoints: 0,
    participationRate: 0,
    recentActivity: []
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Fetch institute statistics
  const fetchInstituteStats = async () => {
    if (!user || !user._id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await API.get(`/institute/${user._id}/stats`);
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching institute stats:", err);
      setError(err.response?.data?.message || "Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  // Get token from localStorage
  const token = localStorage.getItem("token");

  if (token) {
    console.log("Token:", token);

    // If it's a JWT, you can also decode its payload
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log("Decoded payload:", payload);
      
    } catch (err) {
      console.error("Failed to decode token:", err);
    }
  } else {
    console.log("No token found in localStorage");
  }
}, []);

  useEffect(() => {
    fetchInstituteStats();
    // Initialize institute data from user context
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
        programs: user.programs || []
      });
    }
  }, [user]);

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return (
          <InstituteOverview
            instituteData={instituteData}
            stats={stats}
            loading={loading}
            error={error}
            // refresh={fetchInstituteStats}
          />
        );
      case "faculty":
        return <FacultyManagement instituteId={user?._id} />; 
      case "students":
        return <StudentManagement instituteId={user?._id} />;
       case "challenges": // NEW
        return <ChallengeManagement instituteId={user?._id} instituteData={instituteData} />;
      case "submissions": // NEW
        return <ChallengeSubmissions instituteId={user?._id} />;
    //   case "analytics":
    //     return <AnalyticsDashboard instituteData={instituteData} stats={stats} />;
    //   case "reports":
    //     return <Reports instituteData={instituteData} />;
    //   case "settings":
    //     return <InstituteSettings instituteData={instituteData} />;
      default:
        return (
          <InstituteOverview
            instituteData={instituteData}
            stats={stats}
            loading={loading}
            error={error}
            // refresh={fetchInstituteStats}
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
          <div className="container mx-auto max-w-7xl">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
