// src/pages/FacultyDashboard.jsx
import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { API } from "../utils/api";

import FacultyHeader from "../faculty/FacultyHeader";
import FacultySidebar from "../faculty/FacultySidebar";
import OverviewAnalytics from "../faculty/OverviewAnalytics";
import ManageChallenges from "../faculty/ManageChallenges";
import StudentTracking from "../faculty/StudentTracking";
import FacultySubmissions from "../faculty/FacultySubmissions";
import ContentLibrary from "../faculty/UploadLibrary";
import AddModule from "../faculty/AddModule";
import Blogs from "../faculty/Blogs";
import EventScheduler from "../faculty/EventScheduler";
import Reports from "../faculty/Reports";
import LearningContent from "../faculty/LearningContent";

export default function FacultyDashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("overview");

  const [facultyData, setFacultyData] = useState({
    name: user?.name || "Faculty Member",
    designation: user?.designation || "Faculty",
    school: user?.school || "Institute",
    totalStudents: 0,
    totalEcoPoints: 0,
    assignedClasses: [],
  });

  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [analyticsError, setAnalyticsError] = useState(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // FETCH analytics from backend
  const fetchFacultyAnalytics = async () => {
    if (!user || !user._id) return;
    try {
      setLoadingAnalytics(true);
      setAnalyticsError(null);
      const res = await API.get(`/faculty/${user._id}`);
      // expected: res.data = { totalStudents, totalEcoPoints, activeChallenges, participationRate, monthlyParticipation, topClasses, activityDistribution }
      setAnalytics(res.data);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setAnalyticsError(
        err.response?.data?.message || err.message || "Failed to load analytics"
      );
    } finally {
      setLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    fetchFacultyAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return (
          <OverviewAnalytics
            analytics={analytics}
            loading={loadingAnalytics}
            error={analyticsError}
            refresh={fetchFacultyAnalytics}
          />
        );
      case "challenges":
        return <ManageChallenges />;
      case "students":
        return <StudentTracking facultyData={facultyData} />;
      case "submissions":
        return <FacultySubmissions />;
      case "library":
        return <ContentLibrary userId={user?._id} />;
      case "add-module":
        return <AddModule />;
      case "blogs":
        return <Blogs facultyData={facultyData} />;
      case "events":
        return <EventScheduler />;
      case "reports":
        return <Reports facultyData={facultyData} />;
      case "learning-content":
        return <LearningContent userProfile={{ role: "faculty" }} />;
      default:
        return (
          <OverviewAnalytics
            analytics={analytics}
            loading={loadingAnalytics}
            error={analyticsError}
            refresh={fetchFacultyAnalytics}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 flex flex-col">
      <FacultyHeader facultyData={facultyData} />

      <div className="flex flex-1">
        <FacultySidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          facultyData={facultyData}
          onLogout={handleLogout}
        />

        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="container mx-auto max-w-7xl">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
}
