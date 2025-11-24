import React, { useState, useEffect } from "react";
import {
  Trophy,
  TrendingUp,
  Users,
  Target,
  Award,
  Star,
  Play,
  Droplets,
  Building2,
  Zap,
  Recycle,
  Fish,
  Leaf,
  Medal,
  Gamepad2,
  RefreshCw,
} from "lucide-react";

const DashboardContent = ({ studentData, setActiveTab, onDataUpdate }) => {
  // State with default values from studentData
  const [dashboardData, setDashboardData] = useState({
    ecoPoints: studentData?.ecoPoints || 0,
    completedChallenges: studentData?.completedChallenges || 0,
    badges: studentData?.badges || [],
    rank: studentData?.rank || 1,
    level: studentData?.level || 1,
    collegeRank: studentData?.collegeRank || 1,
    physicalGamesCompleted: studentData?.physicalGamesCompleted || 0,
    twoDimensionalGamesCompleted: studentData?.twoDimensionalGamesCompleted || 0,
    name: studentData?.name || "Student",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Update local state when studentData prop changes
  useEffect(() => {
    if (studentData) {
      setDashboardData(prev => ({
        ...prev,
        ...studentData
      }));
    }
  }, [studentData]);

  // Enhanced real-time data updates with more dynamic changes
  useEffect(() => {
    const interval = setInterval(() => {
      setDashboardData(prev => {
        const randomChange = Math.random();
        let newData = { ...prev };

        // 40% chance for points increase
        if (randomChange < 0.4) {
          newData.ecoPoints = prev.ecoPoints + Math.floor(Math.random() * 3);
        }
        // 20% chance for rank improvement
        else if (randomChange < 0.6 && prev.rank > 1) {
          newData.rank = Math.max(1, prev.rank - Math.floor(Math.random() * 2));
        }
        // 15% chance for college rank improvement
        else if (randomChange < 0.75 && prev.collegeRank > 1) {
          newData.collegeRank = Math.max(1, prev.collegeRank - Math.floor(Math.random() * 2));
        }
        // 10% chance for level up when points are sufficient
        else if (randomChange < 0.85 && prev.ecoPoints >= prev.level * 500) {
          newData.level = prev.level + 1;
        }

        return newData;
      });
      setLastUpdated(new Date());
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  // Function to refresh data
  const refreshData = async () => {
    setIsLoading(true);
    try {
      // Simulate API call to get fresh data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would fetch from your API here
      const freshData = await fetchStudentData();
      setDashboardData(freshData);
      setLastUpdated(new Date());
      
      // Notify parent component of data update
      if (onDataUpdate) {
        onDataUpdate(freshData);
      }
    } catch (error) {
      console.error("Failed to refresh data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced function to add eco points with dynamic badge unlocks
  const addEcoPoints = (points, challengeCompleted = false) => {
    setDashboardData(prev => {
      const newData = {
        ...prev,
        ecoPoints: prev.ecoPoints + points,
        completedChallenges: challengeCompleted 
          ? prev.completedChallenges + 1 
          : prev.completedChallenges
      };

      // Check for level up based on points
      const newLevel = Math.floor(newData.ecoPoints / 500) + 1;
      if (newLevel > prev.level) {
        newData.level = newLevel;
      }

      // Enhanced badge unlock logic
      const newBadges = checkBadgeUnlocks(newData.ecoPoints, newData.completedChallenges, prev.badges);
      if (newBadges.length > prev.badges.length) {
        newData.badges = newBadges;
      }

      // Update parent if callback provided
      if (onDataUpdate) {
        onDataUpdate(newData);
      }

      return newData;
    });
  };

  // Function to update game completion stats
  const updateGameCompletion = (gameType) => {
    setDashboardData(prev => {
      const newData = {
        ...prev,
        [gameType === 'physical' ? 'physicalGamesCompleted' : 'twoDimensionalGamesCompleted']: 
          prev[gameType === 'physical' ? 'physicalGamesCompleted' : 'twoDimensionalGamesCompleted'] + 1,
        completedChallenges: prev.completedChallenges + 1,
        ecoPoints: prev.ecoPoints + 50 // Award points for game completion
      };

      // Update parent if callback provided
      if (onDataUpdate) {
        onDataUpdate(newData);
      }

      return newData;
    });
  };

  // Enhanced badge unlock logic
  const checkBadgeUnlocks = (points, completedChallenges, currentBadges) => {
    const badges = [...currentBadges];
    const badgeMilestones = [
      { points: 100, badge: "🌱 Eco Beginner" },
      { points: 500, badge: "♻️ Recycling Pro" },
      { points: 1000, badge: "💧 Water Guardian" },
      { points: 2500, badge: "⚡ Energy Master" },
      { points: 5000, badge: "🌍 Earth Hero" },
      { challenges: 5, badge: "🎯 Quick Learner" },
      { challenges: 10, badge: "⭐ Challenge Champion" },
      { challenges: 25, badge: "🏆 Master Achiever" },
    ];

    badgeMilestones.forEach(milestone => {
      if (milestone.points && points >= milestone.points && !badges.includes(milestone.badge)) {
        badges.push(milestone.badge);
      }
      if (milestone.challenges && completedChallenges >= milestone.challenges && !badges.includes(milestone.badge)) {
        badges.push(milestone.badge);
      }
    });

    return badges;
  };

  // Dynamic stats configuration
  const stats = [
    {
      icon: TrendingUp,
      label: "Eco Points",
      value: dashboardData.ecoPoints.toLocaleString(),
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
      action: () => addEcoPoints(10) // Demo action
    },
    {
      icon: Target,
      label: "Completed Challenges",
      value: dashboardData.completedChallenges,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
    },
    {
      icon: Trophy,
      label: "Rank",
      value: `#${dashboardData.rank}`,
      color: "from-amber-500 to-orange-500",
      bgColor: "bg-amber-50",
      textColor: "text-amber-700",
    },
    {
      icon: Users,
      label: "Level",
      value: dashboardData.level,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
    },
    {
      icon: Medal,
      label: "College Rank",
      value: `#${dashboardData.collegeRank}`,
      color: "from-red-500 to-pink-500",
      bgColor: "bg-red-50",
      textColor: "text-red-700",
    },
    {
      icon: Gamepad2,
      label: "Physical Games Completed",
      value: dashboardData.physicalGamesCompleted,
      color: "from-indigo-500 to-purple-500",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-700",
      action: () => updateGameCompletion('physical')
    },
    {
      icon: Gamepad2,
      label: "2D Games Completed",
      value: dashboardData.twoDimensionalGamesCompleted,
      color: "from-teal-500 to-blue-500",
      bgColor: "bg-teal-50",
      textColor: "text-teal-700",
      action: () => updateGameCompletion('2d')
    },
  ];

  // Dynamic games list with random popularity indicators
  const games = [
    {
      id: 1,
      name: "♻️ Recycle Rush",
      description: "Sort waste into correct bins and learn about recycling types.",
      color: "from-green-400 to-lime-500",
      icon: Recycle,
      path: "/games/recyclerush",
      points: 100,
      type: "2d"
    },
    {
      id: 2,
      name: "💧 Water Warrior",
      description: "Fix leaks and save water under time pressure!",
      color: "from-blue-400 to-cyan-500",
      icon: Droplets,
      path: "/games/waterwarrior",
      points: 150,
      type: "2d"
    },
    {
      id: 3,
      name: "🧠 Eco Quiz",
      description: "Answer environmental questions to test your awareness.",
      color: "from-teal-400 to-emerald-500",
      icon: Leaf,
      path: "/games/ecoquiz",
      points: 80,
      type: "2d"
    },
    {
      id: 4,
      name: "⚡ Energy Manager",
      description: "Turn off appliances and save energy efficiently.",
      color: "from-yellow-400 to-orange-500",
      icon: Zap,
      path: "/games/energymanager",
      points: 120,
      type: "physical"
    },
    {
      id: 5,
      name: "🌊 Ocean Savior",
      description: "Clean up plastic waste from the ocean and rescue marine life.",
      color: "from-sky-400 to-blue-500",
      icon: Fish,
      path: "/games/oceansavior",
      points: 200,
      type: "2d"
    },
    {
      id: 6,
      name: "🏙️ Green City Planner",
      description: "Design a sustainable city with balanced resources.",
      color: "from-emerald-400 to-teal-500",
      icon: Building2,
      path: "/games/greencityplanner",
      points: 180,
      type: "physical"
    },
  ];

  const handlePlayGame = (game) => {
    // Add points and update completion stats when game is played
    addEcoPoints(game.points, true);
    updateGameCompletion(game.type);
    
    // Navigate to game
    const tabName = game.path.split("/games/")[1];
    setActiveTab(tabName);
  };

  // Format last updated time
  const formatLastUpdated = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Calculate next badge progress
  const getNextBadgeProgress = () => {
    const nextMilestone = Math.ceil(dashboardData.ecoPoints / 100) * 100;
    const pointsNeeded = nextMilestone - dashboardData.ecoPoints;
    return pointsNeeded;
  };

  return (
    <div className="space-y-8">
      {/* Header with refresh */}
      <div className="flex justify-between items-center">
        <div className="text-center flex-1">
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome back, {dashboardData.name}! 🌎
          </h1>
          <p className="text-gray-600 text-lg">
            Play, learn, and make Earth a better place 🌿
          </p>
        </div>
        <button
          onClick={refreshData}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Updating...' : 'Refresh'}
        </button>
      </div>

      {/* Last updated indicator */}
      <div className="text-center text-sm text-gray-500">
        Last updated: {formatLastUpdated(lastUpdated)}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              onClick={stat.action || (() => {})}
              className={`${stat.bgColor} rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
                stat.action ? 'cursor-pointer hover:scale-105' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <span className={`text-sm font-semibold ${stat.textColor}`}>
                  {stat.label}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
              {stat.action && (
                <div className="text-xs text-gray-500 mt-2">Click to demo +</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Badges */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Award className="h-6 w-6 text-green-600" />
            <h3 className="text-xl font-bold text-gray-800">Your Badges</h3>
          </div>
          <span className="text-sm text-gray-500">
            {dashboardData.badges.length} earned
          </span>
        </div>
        {dashboardData.badges.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {dashboardData.badges.map((badge, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md border border-green-200 hover:shadow-lg transition-all duration-300"
              >
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                <span className="text-sm font-medium text-gray-700">{badge}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            Complete challenges to earn your first badge! 🌟
          </p>
        )}
        <div className="mt-4 text-sm text-gray-600">
          Next badge at {getNextBadgeProgress()} points
        </div>
      </div>

      {/* Environmental Games */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">🌍 Environmental Games</h3>
          <span className="text-sm text-gray-500">
            {games.length} games available
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => {
            const Icon = game.icon;
            return (
              <div
                key={game.id}
                onClick={() => handlePlayGame(game)}
                className={`cursor-pointer bg-gradient-to-br ${game.color} text-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105`}
              >
                <div className="flex items-center justify-between mb-4">
                  <Icon className="h-8 w-8" />
                  <div className="flex items-center gap-2">
                    <span className="text-sm bg-black bg-opacity-20 px-2 py-1 rounded">
                      +{game.points} pts
                    </span>
                    <Play className="h-6 w-6 opacity-80" />
                  </div>
                </div>
                <h4 className="text-lg font-bold mb-2">{game.name}</h4>
                <p className="text-sm opacity-90 mb-2">{game.description}</p>
                <div className="text-xs opacity-75 capitalize">
                  {game.type} game
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quote */}
      <div className="text-center py-6">
        <p className="text-gray-500 italic">
          "The Earth is what we all have in common." — Wendell Berry
        </p>
      </div>
    </div>
  );
};

// Enhanced mock function to simulate API call with more dynamic data
const fetchStudentData = async () => {
  const basePoints = Math.floor(Math.random() * 1000) + 500;
  const completedChallenges = Math.floor(Math.random() * 20) + 5;
  
  // Dynamic badge assignment based on points and challenges
  const badges = [];
  if (basePoints >= 100) badges.push("🌱 Eco Beginner");
  if (basePoints >= 500) badges.push("♻️ Recycling Pro");
  if (basePoints >= 1000) badges.push("💧 Water Guardian");
  if (completedChallenges >= 5) badges.push("🎯 Quick Learner");
  if (completedChallenges >= 10) badges.push("⭐ Challenge Champion");

  return {
    ecoPoints: basePoints,
    completedChallenges: completedChallenges,
    badges: badges,
    rank: Math.floor(Math.random() * 100) + 1,
    level: Math.floor(basePoints / 500) + 1,
    collegeRank: Math.floor(Math.random() * 50) + 1,
    physicalGamesCompleted: Math.floor(Math.random() * 5),
    twoDimensionalGamesCompleted: Math.floor(Math.random() * 8),
    name: "Student",
  };
};

export default DashboardContent;