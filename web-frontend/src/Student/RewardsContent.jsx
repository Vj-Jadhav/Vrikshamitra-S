import React, { useEffect, useState } from "react";
import { Leaf, Gift, Trophy, Star } from "lucide-react";

const RewardsContent = () => {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const totalBadges = 10; // You can change this based on total available badges

  // Simulate fetching data from backend
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        // Simulating API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Example response (you’ll replace this with your API later)
        const response = {
          name: "Mahima Umak",
          ecoPoints: 250,
          badges: ["Eco Starter", "Climate Hero", "Tree Saver", "Water Warrior"],
        };

        setStudentData(response);
      } catch (error) {
        console.error("Error fetching student data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-400 border-t-transparent"></div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="text-center text-red-500">
        Failed to load student rewards data.
      </div>
    );
  }

  const progress = (studentData.badges.length / totalBadges) * 100;

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="flex items-center gap-3 mb-4">
        <Trophy className="text-green-600 w-7 h-7" />
        <h2 className="text-2xl font-bold text-gray-800">
          Rewards & Achievements
        </h2>
      </div>

      <p className="text-gray-600 mb-6">
        Hello <span className="font-semibold text-green-700">{studentData.name}</span>! 🌿  
        You are doing well.  
        Keep completing challenges to unlock more badges and rewards!
      </p>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm font-medium mb-2">
          <span>Reward Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-3 bg-green-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Badge Section */}
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Star className="text-yellow-500 w-5 h-5" /> Your Earned Badges
      </h3>

      {studentData.badges.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {studentData.badges.map((badge, index) => (
            <div
              key={index}
              className="bg-white border border-green-200 rounded-2xl p-4 text-center hover:shadow-lg transition-transform hover:scale-105"
            >
              <Leaf className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-gray-800 font-medium">{badge}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 italic">
          No badges yet — complete modules to start earning!
        </p>
      )}

      {/* Bonus Rewards */}
      <div className="mt-8 bg-green-50 rounded-xl p-5 border border-green-100">
        <div className="flex items-center gap-3 mb-2">
          <Gift className="text-green-600 w-6 h-6" />
          <h4 className="text-lg font-semibold text-green-700">Bonus Rewards</h4>
        </div>
        <p className="text-gray-600 text-sm">
          🎁 Reach new milestones to unlock surprise eco-gifts, certificates, and leaderboard positions!
        </p>
      </div>
    </div>
  );
};

export default RewardsContent;
