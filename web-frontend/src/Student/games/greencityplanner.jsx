import React, { useState } from "react";

const GreenCityPlanner = () => {
  const [energy, setEnergy] = useState(50);
  const [green, setGreen] = useState(50);
  const [water, setWater] = useState(50);
  const [message, setMessage] = useState("Plan your eco-friendly city!");

  const actions = [
    {
      name: "Build Solar Plant ☀️",
      change: { energy: +15, green: +5, water: -5 },
      info: "Clean energy source, but uses some water for maintenance.",
    },
    {
      name: "Plant Trees 🌳",
      change: { green: +20, energy: -5, water: -5 },
      info: "Increases greenery and air quality.",
    },
    {
      name: "Construct Apartments 🏢",
      change: { energy: -10, green: -15, water: -10 },
      info: "Increases housing but reduces green cover.",
    },
    {
      name: "Build Rainwater Harvesting 💧",
      change: { water: +20, green: +5 },
      info: "Saves water and supports the ecosystem.",
    },
    {
      name: "Open Recycling Center ♻️",
      change: { green: +10, energy: +5 },
      info: "Reduces waste and boosts clean production.",
    },
  ];

  const handleAction = (action) => {
    setEnergy((prev) => Math.min(100, Math.max(0, prev + action.change.energy || 0)));
    setGreen((prev) => Math.min(100, Math.max(0, prev + action.change.green || 0)));
    setWater((prev) => Math.min(100, Math.max(0, prev + action.change.water || 0)));

    setMessage(action.info);
  };

  const overallScore = Math.round((energy + green + water) / 3);
  const status =
    overallScore > 80
      ? "🌈 Excellent Sustainable City!"
      : overallScore > 60
      ? "🌿 Good City! A few improvements needed."
      : overallScore > 40
      ? "⚡ Average City — try balancing resources better."
      : "🚨 Unsustainable! Rebuild with eco-friendly steps.";

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-green-100 to-emerald-200 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-green-800 mb-4">🏙️ Green City Planner</h1>
      <p className="text-gray-700 mb-6 text-center max-w-xl">{message}</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8 text-center">
        <div className="bg-white p-4 rounded-xl shadow-md">
          <h3 className="font-semibold text-gray-600">Energy</h3>
          <div className="text-2xl font-bold text-yellow-600">{energy}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-md">
          <h3 className="font-semibold text-gray-600">Green Cover</h3>
          <div className="text-2xl font-bold text-green-600">{green}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-md">
          <h3 className="font-semibold text-gray-600">Water</h3>
          <div className="text-2xl font-bold text-blue-600">{water}</div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => handleAction(action)}
            className="bg-green-600 text-white px-4 py-3 rounded-xl hover:bg-green-700 transition-all shadow-md"
          >
            {action.name}
          </button>
        ))}
      </div>

      {/* Overall Result */}
      <div className="bg-white rounded-xl p-6 shadow-lg text-center w-full md:w-1/2">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">City Sustainability Score</h2>
        <div className="text-4xl font-bold text-green-700 mb-2">{overallScore}</div>
        <p className="text-gray-700">{status}</p>
      </div>
    </div>
  );
};

export default GreenCityPlanner;
