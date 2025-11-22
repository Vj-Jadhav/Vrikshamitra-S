import React from 'react';

export default function StatsCard({ title, value, icon: Icon, color, change }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div
            className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center shadow-lg`}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
            {change}
          </span>
        </div>
        <p className="text-slate-600 text-sm font-medium mb-1">{title}</p>
        <p className="text-3xl font-bold text-slate-800">{value}</p>
      </div>
      <div className="h-1 bg-gradient-to-r from-slate-100 to-slate-200"></div>
    </div>
  );
}