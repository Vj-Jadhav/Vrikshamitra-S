import React from "react";

export default function Leaderboard({ users }) {
  const leaderboard = users
    .filter(u => u.role === "Student")
    .sort((a, b) => (b.ecoPoints || 0) - (a.ecoPoints || 0))
    .slice(0, 10);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-800">Student Leaderboard</h2>
        <p className="text-sm text-slate-500 mt-1">Top performing students by EcoPoints</p>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {leaderboard.map((student, index) => (
            <div key={student.id} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                  index === 0 ? 'bg-yellow-500' :
                  index === 1 ? 'bg-gray-400' :
                  index === 2 ? 'bg-orange-500' : 'bg-slate-400'
                }`}>
                  {index + 1}
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {student.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-slate-800">{student.name}</p>
                  <p className="text-sm text-slate-500">{student.email}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-slate-800">{student.ecoPoints} pts</p>
                <p className="text-sm text-slate-500">EcoPoints</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}