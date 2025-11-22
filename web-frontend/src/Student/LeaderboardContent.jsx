import React, { useEffect, useState, useMemo } from "react";
import { Trophy, Leaf, Medal } from "lucide-react";
import axios from "axios";

// API configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

// Loading skeleton component
const LoadingSkeleton = () => (
  <div className="space-y-3">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="animate-pulse flex items-center space-x-4 p-3">
        <div className="rounded-full bg-gray-200 h-6 w-6"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </div>
    ))}
  </div>
);

// Rank badge component
const RankBadge = ({ rank }) => {
  if (rank === 1) return <Medal className="text-yellow-500 w-5 h-5" />;
  if (rank === 2) return <Medal className="text-gray-400 w-5 h-5" />;
  if (rank === 3) return <Medal className="text-orange-500 w-5 h-5" />;
  return <span className="text-sm font-medium w-5 text-center">{rank}</span>;
};

const LeaderboardContent = ({ studentData }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await api.get("/leaderboard");
        setLeaderboard(data);
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Failed to load leaderboard data. Please try again later.";
        setError(errorMessage);
        console.error("Leaderboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaderboard();
  }, []);

  // Memoized computations
  const { sortedLeaderboard, currentStudentRank, currentStudent } = useMemo(() => {
    const sorted = [...leaderboard].sort((a, b) => b.ecoPoints - a.ecoPoints);
    const currentIndex = sorted.findIndex(s => s.name === studentData?.name);
    
    return {
      sortedLeaderboard: sorted,
      currentStudentRank: currentIndex !== -1 ? currentIndex + 1 : null,
      currentStudent: currentIndex !== -1 ? sorted[currentIndex] : null
    };
  }, [leaderboard, studentData?.name]);

  const otherStudents = useMemo(() => 
    sortedLeaderboard.filter(s => s.name !== studentData?.name),
    [sortedLeaderboard, studentData?.name]
  );

  if (loading) return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <Trophy className="text-yellow-500 w-8 h-8" />
        <h2 className="text-2xl font-bold text-gray-800">Eco Leaderboard</h2>
      </div>
      <LoadingSkeleton />
    </div>
  );

  if (error) return (
    <div className="p-6">
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
        <p className="text-red-700">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Trophy className="text-yellow-500 w-8 h-8" />
        <h2 className="text-2xl font-bold text-gray-800">Eco Leaderboard</h2>
      </div>

      <p className="text-gray-600 mb-6">
        🏆 See the top students making a difference for our planet! Earn more{" "}
        <span className="text-green-600 font-semibold">EcoPoints</span> to climb the ranks.
      </p>

      {/* Leaderboard Table */}
      <div className="bg-white rounded-2xl border border-green-200 shadow-md overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-green-100 text-green-700 uppercase text-sm font-semibold">
            <tr>
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3 text-right">EcoPoints</th>
            </tr>
          </thead>
          <tbody>
            {otherStudents.length > 0 ? (
              otherStudents.map((student, index) => {
                const rank = index + 1;
                return (
                  <tr key={student.id || student.name} className="border-t hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <RankBadge rank={rank} />
                      </div>
                    </td>
                    <td className="px-4 py-3 flex items-center gap-2">
                      <Leaf className="text-green-500 w-4 h-4" />
                      <span className="truncate">{student.name}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-green-700">
                      {student.ecoPoints.toLocaleString()} pts
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="3" className="px-4 py-8 text-center text-gray-500">
                  No leaderboard data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Current Student Summary */}
      {currentStudent && (
        <div className="mt-6 bg-green-50 rounded-xl p-5 border border-green-100 text-center">
          <p className="text-green-700 font-medium">
            🌱 {studentData.name}, your rank is{" "}
            <span className="font-bold">{currentStudentRank}</span> and you have{" "}
            <span className="font-bold">{currentStudent.ecoPoints.toLocaleString()} EcoPoints</span>! 
            Keep going! 💪
          </p>
        </div>
      )}
    </div>
  );
};

export default LeaderboardContent;