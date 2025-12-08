// src/pages/GovernmentDashboard.jsx
import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

import GovernmentHeader from "../government/GovernmentHeader";
import GovernmentSidebar from "../government/GovernmentSidebar";
import OverviewAnalytics from "../government/OverviewAnalytics";
import InstituteManagement from "../government/InstituteManagement";
import UserManagement from "../government/UserManagement";
import RegistrationAnalytics from "../government/RegistrationAnalytics";
import Reports from "../government/Reports";
import SystemSettings from "../government/SystemSettings";
import ChallengeManagement from "../government/ChallengeManagement";
import PlantDriveManagement from "../government/PlantDriveManagement"; // Import the new component

export default function GovernmentDashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("overview");

  const [decodedToken, setDecodedToken] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const tk = localStorage.getItem("token");
    setToken(tk);

    if (tk) {
      try {
        const payload = JSON.parse(atob(tk.split('.')[1]));
        console.log("Decoded payload:", payload);
        setDecodedToken(payload);
      } catch (err) {
        console.error("Failed to decode token:", err);
      }
    }
  }, []);

  const [adminData, setAdminData] = useState({
    name: user?.name || "Government Admin",
    department: user?.department || "Education Department",
    totalInstitutes: 0,
    totalUsers: 0,
    pendingApprovals: 0,
    pendingPlantDrives: 0, // Add this field
  });

  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [analyticsError, setAnalyticsError] = useState(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const fetchAdminAnalytics = async () => {
    try {
      setLoadingAnalytics(true);
      setAnalyticsError(null);

      // simulate network delay
      await new Promise(res => setTimeout(res, 500));

      const sampleAnalytics = {
        stats: {
          totalInstitutes: 42,
          activeInstitutes: 34,
          pendingApprovals: 6,
          pendingPlantDrives: 8, // Add this
          totalUsers: 3100,
          growthRate: 12,
          regionalDistribution: [
            { region: "North Region", count: 10 },
            { region: "South Region", count: 8 },
            { region: "East Region", count: 14 },
            { region: "West Region", count: 10 },
          ],
        },

        recentRegistrations: [
          {
            name: "Evergreen Technical Institute",
            location: "California, USA",
            status: "approved",
          },
          {
            name: "Mountain View Polytechnic",
            location: "Colorado, USA",
            status: "pending",
          },
          {
            name: "Riverbend College",
            location: "Oregon, USA",
            status: "pending",
          },
          {
            name: "Sunrise Academy",
            location: "Texas, USA",
            status: "rejected",
          },
        ],
      };

      setAnalytics(sampleAnalytics);

      setAdminData(prev => ({
        ...prev,
        totalInstitutes: sampleAnalytics.stats.totalInstitutes,
        totalUsers: sampleAnalytics.stats.totalUsers,
        pendingApprovals: sampleAnalytics.stats.pendingApprovals,
        pendingPlantDrives: sampleAnalytics.stats.pendingPlantDrives, // Update this
      }));

    } catch (err) {
      setAnalyticsError("Failed to load sample analytics");
    } finally {
      setLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    fetchAdminAnalytics();
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
            refresh={fetchAdminAnalytics}
          />
        );
      case "institutes":
        return <InstituteManagement />;
      case "users":
        return <UserManagement />;
      case "challenges":
        return <ChallengeManagement  
          token={token} 
          adminId={decodedToken?.id} 
          role={decodedToken?.role} 
        />;
      case "plant-drives": // Add this case
        return <PlantDriveManagement  
          token={token} 
          adminId={decodedToken?.id} 
          role={decodedToken?.role} 
        />;
      case "registrations":
        return <RegistrationAnalytics />;
      case "reports":
        return <Reports adminData={adminData} />;
      case "settings":
        return <SystemSettings />;
      default:
        return (
          <OverviewAnalytics
            analytics={analytics}
            loading={loadingAnalytics}
            error={analyticsError}
            refresh={fetchAdminAnalytics}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
      <GovernmentHeader adminData={adminData} />

      <div className="flex flex-1">
        <GovernmentSidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          adminData={adminData}
          onLogout={handleLogout}
        />

        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="container mx-auto max-w-7xl">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
}