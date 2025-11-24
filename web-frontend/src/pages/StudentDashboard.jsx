import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { API } from "../utils/api";

import Sidebar from "../Student/Sidebar";
import Header from "../Student/Header";

// 🌿 Main Sections
import DashboardContent from "../Student/DashboardContent";
import ChallengesContent from "../Student/ChallengesContent";
import LearningContent from "../Student/LearningContent";
import Games from "../Student/GamesPage.jsx";
import LibraryContent from "../Student/LibraryContent.jsx";
import LeaderboardContent from "../Student/LeaderboardContent";
import RewardsContent from "../Student/RewardsContent";
import SettingsContent from "../Student/SettingsContent";

// 🎮 Environmental Games
import RecycleRush from "../Student/games/recyclerush.jsx";
import WaterWarrior from "../Student/games/waterwarrior";
import EcoQuiz from "../Student/games/ecoquiz";
import EnergyManager from "../Student/games/energymanager";
import OceanSavior from "../Student/games/oceansavior";
import GreenCityPlanner from "../Student/games/greencityplanner";

export default function StudentDashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // 🌱 Dashboard state
  const [activeTab, setActiveTab] = useState("dashboard");
  const [notifications, setNotifications] = useState(0);

  // ✅ Dynamic backend states
  const [studentData, setStudentData] = useState({});
  const [challenges, setChallenges] = useState([]);
  const [learningModules, setLearningModules] = useState([]);
  const [library, setLibrary] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [gamesProgress, setGamesProgress] = useState({});

  // 🔹 Fetch student profile dynamically
  const fetchStudentData = async () => {
    try {
      const res = await API.get(`/students/${user._id}`);
      setStudentData(res.data);
      setNotifications(res.data.notifications || 0);
    } catch (err) {
      console.error("Error fetching student data:", err);
    }
  };

  // 🔹 Fetch challenges dynamically
  const fetchChallenges = async () => {
    try {
      const res = await API.get("/challenges");
      setChallenges(res.data);
    } catch (err) {
      console.error("Error fetching challenges:", err);
    }
  };

  // 🔹 Fetch learning modules dynamically
  const fetchLearningModules = async () => {
    try {
      const res = await API.get("/learning-modules");
      setLearningModules(res.data);
    } catch (err) {
      console.error("Error fetching learning modules:", err);
    }
  };

  // 🔹 Fetch library content dynamically
  const fetchLibraryContent = async () => {
    try {
      const res = await API.get("/content");
      setLibrary(res.data);
    } catch (err) {
      console.error("Error fetching library content:", err);
    }
  };

  // 🔹 Fetch leaderboard dynamically
  const fetchLeaderboard = async () => {
    try {
      const res = await API.get("/leaderboard");
      setLeaderboard(res.data);
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
    }
  };

  // 🔹 Fetch rewards dynamically
  const fetchRewards = async () => {
    try {
      const res = await API.get("/rewards");
      setRewards(res.data);
    } catch (err) {
      console.error("Error fetching rewards:", err);
    }
  };

  // 🔹 Fetch games progress dynamically
  const fetchGamesProgress = async () => {
    try {
      const res = await API.get(`/students/${user._id}/games-progress`);
      setGamesProgress(res.data);
    } catch (err) {
      console.error("Error fetching games progress:", err);
    }
  };

  // ✅ Fetch all data on mount
  useEffect(() => {
    if (user?._id) {
      fetchStudentData();
      fetchChallenges();
      fetchLearningModules();
      fetchLibraryContent();
      fetchLeaderboard();
      fetchRewards();
      fetchGamesProgress();
    }
  }, [user]);

  // 🧭 Dynamic content rendering
  const renderContent = () => {
    const contentProps = {
      studentData,
      challenges,
      learningModules,
      library,
      leaderboard,
      rewards,
      gamesProgress,
      setActiveTab,
      navigate,
    };

    switch (activeTab) {
      case "dashboard":
        return <DashboardContent {...contentProps} />;
      case "challenges":
        return <ChallengesContent {...contentProps} />;
      case "learning":
        return <LearningContent {...contentProps} />;
      case "games":
        return <Games {...contentProps} />;
      case "library":
        return <LibraryContent {...contentProps} />;
      case "leaderboard":
        return <LeaderboardContent {...contentProps} />;
      case "rewards":
        return <RewardsContent {...contentProps} />;
      case "settings":
        return <SettingsContent {...contentProps} logout={logout} navigate={navigate} />;

      // 🎮 Games
      case "recyclerush":
        return <RecycleRush {...contentProps} />;
      case "waterwarrior":
        return <WaterWarrior {...contentProps} />;
      case "ecoquiz":
        return <EcoQuiz {...contentProps} />;
      case "energymanager":
        return <EnergyManager {...contentProps} />;
      case "oceansavior":
        return <OceanSavior {...contentProps} />;
      case "greencityplanner":
        return <GreenCityPlanner {...contentProps} />;

      default:
        return (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Content Not Found
            </h2>
            <button
              onClick={() => setActiveTab("dashboard")}
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Sidebar */}
      <Sidebar
        studentData={studentData}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        logout={logout}
        navigate={navigate}
        user={user} // pass AuthContext user as fallback
      />

      {/* Main Area */}
      <main className="flex-1 overflow-auto p-6">
        <Header
          activeTab={activeTab}
          ecoPoints={studentData.ecoPoints || 0}
          studentData={studentData}
          user={user} // fallback for schoolName if needed
        />

        <div className="bg-white rounded-xl shadow-lg p-6 transition-all min-h-[500px]">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
