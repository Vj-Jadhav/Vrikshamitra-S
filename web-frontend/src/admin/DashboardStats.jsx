import React from "react";
import { Users, Award, Target, TrendingUp } from "lucide-react";

export default function DashboardStats({ users, challenges, totalEcoPoints }) {
  const stats = [
    {
      title: "Total Students",
      value: users.filter(u => u.role === "Student").length,
      icon: Users,
      color: "from-emerald-500 to-teal-600",
      change: "+12%"
    },
    {
      title: "Total Teachers",
      value: users.filter(u => u.role === "Teacher").length,
      icon: Award,
      color: "from-blue-500 to-indigo-600",
      change: "+5%"
    },
    {
      title: "Active Challenges",
      value: challenges.filter(c => c.status === "Active").length,
      icon: Target,
      color: "from-purple-500 to-pink-600",
      change: "+8%"
    },
    {
      title: "Total EcoPoints",
      value: totalEcoPoints,
      icon: TrendingUp,
      color: "from-orange-500 to-red-600",
      change: "+23%"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  {stat.change}
                </span>
              </div>
              <p className="text-slate-600 text-sm font-medium mb-1">{stat.title}</p>
              <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity & Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Users</h3>
          <div className="space-y-3">
            {users.slice(0, 5).map(user => (
              <div key={user.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{user.name}</p>
                    <p className="text-sm text-slate-500">{user.role}</p>
                  </div>
                </div>
                {user.ecoPoints !== "-" && (
                  <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full text-sm font-medium">
                    {user.ecoPoints} pts
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Active Challenges</h3>
          <div className="space-y-3">
            {challenges.filter(c => c.status === "Active").slice(0, 5).map(challenge => (
              <div key={challenge.id} className="p-3 hover:bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-slate-800">{challenge.title}</p>
                  <span className="bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                    {challenge.points} pts
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-2">{challenge.description}</p>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>{challenge.participants} participants</span>
                  <span>Ends: {challenge.endDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}