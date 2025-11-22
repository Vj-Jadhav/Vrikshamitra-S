import React from "react";
import { Search, Plus, Edit2, Trash2 } from "lucide-react";

export default function ChallengeManagement({
  challenges,
  searchTerm,
  filterStatus,
  onSearchChange,
  onFilterStatusChange,
  onAddChallenge,
  onEditChallenge,
  onDeleteChallenge
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Manage Challenges</h2>
            <p className="text-sm text-slate-500 mt-1">Create and manage eco-challenges</p>
          </div>
          <button
            onClick={onAddChallenge}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:shadow-md transition-shadow"
          >
            <Plus className="w-4 h-4" />
            <span>New Challenge</span>
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="p-6 border-b border-slate-200 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search challenges..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => onFilterStatusChange(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {/* Challenges Grid */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {challenges.map((challenge) => (
          <div key={challenge.id} className="border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-slate-800 text-lg">{challenge.title}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  challenge.status === 'Active' 
                    ? 'bg-green-100 text-green-800'
                    : challenge.status === 'Completed'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {challenge.status}
                </span>
              </div>
              <p className="text-slate-600 text-sm mb-4">{challenge.description}</p>
              <div className="flex justify-between items-center text-sm text-slate-500 mb-4">
                <span>{challenge.participants} participants</span>
                <span>Ends: {challenge.endDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">
                  {challenge.points} points
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEditChallenge(challenge)}
                    className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteChallenge(challenge.id)}
                    className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}