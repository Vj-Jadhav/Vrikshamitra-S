// src/pages/GovernmentDashboard.jsx
import React, { useState, useContext, useEffect, useCallback, useMemo } from "react";
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
import PlantDriveManagement from "../government/PlantDriveManagement";
import NGOManagement from "../government/NGOManagement";

export default function GovernmentDashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("overview");

  const [decodedToken, setDecodedToken] = useState(null);
  const [token, setToken] = useState(null);

  // Decode token safely
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
        // Clear invalid token
        localStorage.removeItem("token");
        navigate("/login");
      }
    } else {
      // No token found, redirect to login
      navigate("/login");
    }
  }, [navigate]);

  const [adminData, setAdminData] = useState({
    name: user?.name || "Government Admin",
    department: user?.department || "Education Department",
    totalInstitutes: 0,
    totalUsers: 0,
    pendingApprovals: 0,
    pendingPlantDrives: 0,
  });

  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [analyticsError, setAnalyticsError] = useState(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Use useCallback to memoize the fetch function
  const fetchAdminAnalytics = useCallback(async () => {
    if (!user?._id) return;

    try {
      setLoadingAnalytics(true);
      setAnalyticsError(null);

      // TODO: Replace with actual API call
      // const response = await fetch('/api/government/analytics', {
      //   headers: {
      //     'Authorization': `Bearer ${token}`
      //   }
      // });
      // const data = await response.json();

      // Simulate network delay
      await new Promise(res => setTimeout(res, 500));

      const sampleAnalytics = {
        stats: {
          totalInstitutes: 42,
          activeInstitutes: 34,
          pendingApprovals: 6,
          pendingPlantDrives: 8,
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
            id: 1,
            name: "Evergreen Technical Institute",
            location: "California, USA",
            status: "approved",
            date: "2024-01-15",
          },
          {
            id: 2,
            name: "Mountain View Polytechnic",
            location: "Colorado, USA",
            status: "pending",
            date: "2024-01-14",
          },
          {
            id: 3,
            name: "Riverbend College",
            location: "Oregon, USA",
            status: "pending",
            date: "2024-01-13",
          },
          {
            id: 4,
            name: "Sunrise Academy",
            location: "Texas, USA",
            status: "rejected",
            date: "2024-01-12",
          },
        ],
        lastUpdated: new Date().toISOString(),
      };

      setAnalytics(sampleAnalytics);

      setAdminData(prev => ({
        ...prev,
        totalInstitutes: sampleAnalytics.stats.totalInstitutes,
        totalUsers: sampleAnalytics.stats.totalUsers,
        pendingApprovals: sampleAnalytics.stats.pendingApprovals,
        pendingPlantDrives: sampleAnalytics.stats.pendingPlantDrives,
      }));

    } catch (err) {
      console.error("Failed to load analytics:", err);
      setAnalyticsError("Failed to load dashboard analytics. Please try again.");
    } finally {
      setLoadingAnalytics(false);
    }
  }, [user?._id, token]);

  useEffect(() => {
    fetchAdminAnalytics();
  }, [fetchAdminAnalytics]);

  // Memoize the rendered content to prevent unnecessary re-renders
  const renderedContent = useMemo(() => {
    const contentProps = {
      token,
      adminId: decodedToken?.id,
      role: decodedToken?.role,
    };

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
        return <InstituteManagement {...contentProps} />;
      case "users":
        return <UserManagement {...contentProps} />;
      case "challenges":
        return <ChallengeManagement {...contentProps} />;
      case "plant-drives":
        return <PlantDriveManagement {...contentProps} />;
      case "ngo-approvals":
        return <NGOManagement token={token} />;
      case "registrations":
        return <RegistrationAnalytics {...contentProps} />;
      case "reports":
        return <Reports {...contentProps} adminData={adminData} />;
      case "settings":
        return <SystemSettings {...contentProps} />;
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
  }, [activeSection, analytics, loadingAnalytics, analyticsError, fetchAdminAnalytics, token, decodedToken, adminData]);

  // Show loading state while checking token
  if (!token && !decodedToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

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

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          <div className="container mx-auto max-w-7xl">
            {renderedContent}
          </div>
        </main>
      </div>
    </div>
  );
}