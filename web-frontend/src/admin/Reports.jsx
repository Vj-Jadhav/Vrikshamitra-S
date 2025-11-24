import React from "react";

export default function Reports({ users, challenges }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-xl font-bold text-slate-800 mb-6">Reports & Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 border border-slate-200 rounded-xl">
          <h3 className="font-semibold text-slate-800 mb-4">User Distribution</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Students</span>
              <span className="font-semibold text-slate-800">
                {users.filter(u => u.role === 'Student').length} users
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Teachers</span>
              <span className="font-semibold text-slate-800">
                {users.filter(u => u.role === 'Teacher').length} users
              </span>
            </div>
          </div>
        </div>
        <div className="p-6 border border-slate-200 rounded-xl">
          <h3 className="font-semibold text-slate-800 mb-4">Challenge Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Active</span>
              <span className="font-semibold text-slate-800">
                {challenges.filter(c => c.status === 'Active').length} challenges
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Pending</span>
              <span className="font-semibold text-slate-800">
                {challenges.filter(c => c.status === 'Pending').length} challenges
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Completed</span>
              <span className="font-semibold text-slate-800">
                {challenges.filter(c => c.status === 'Completed').length} challenges
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}