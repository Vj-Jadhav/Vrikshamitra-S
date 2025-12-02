// src/government/GovernmentHeader.jsx
import React from 'react';
import { Shield, Bell, Search } from 'lucide-react';

const GovernmentHeader = ({ adminData }) => {
  return (
    <header className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 shadow-2xl sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield size={36} />
            EcoLearn Government Portal
          </h1>
          <p className="text-blue-100 mt-1">
            {adminData.name} • {adminData.department}
          </p>
        </div>
        {/* <div className="flex gap-6 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white-400" size={20} />
            <input
              type="text"
              placeholder="Search institutes..."
              className="pl-10 pr-4 py-2 rounded-lg bg-blue-500 text-white placeholder-blue-200 border border-blue-400 focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>
          <button className="relative p-2 hover:bg-blue-500 rounded-lg transition-colors">
            <Bell size={24} />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
              3
            </span>
          </button>
        </div> */}
      </div>
    </header>
  );
};

export default GovernmentHeader;