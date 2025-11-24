import React, { useEffect, useState } from "react";
import { Bell, Leaf, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

const Header = ({ activeTab, setActiveTab, notifications }) => {
  const navigate = useNavigate();
  const [ecoPoints, setEcoPoints] = useState(0);
  const [location, setLocation] = useState("Loading...");

  // Fetch EcoPoints from logged-in user in localStorage
  const fetchEcoPoints = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!storedUser?._id) return;

      const res = await axios.get(`${API_BASE_URL}/api/users/${storedUser._id}?t=${Date.now()}`);
      const points = res.data.ecoPoints || 0;
      setEcoPoints(points);
      localStorage.setItem("userEcoPoints", points);
    } catch (err) {
      const cachedPoints = localStorage.getItem("userEcoPoints");
      if (cachedPoints) setEcoPoints(Number(cachedPoints));
    }
  };

  useEffect(() => {
    fetchEcoPoints();

    // Optional: auto-refresh EcoPoints every 20s
    const interval = setInterval(fetchEcoPoints, 20000);
    return () => clearInterval(interval);
  }, []);

  // Optional: fetch location
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        setLocation(`${data.city}, ${data.country_name}`);
      } catch {
        setLocation("Unknown Location");
      }
    };
    fetchLocation();
  }, []);

  const handleBellClick = () => {
    if (typeof setActiveTab === "function") {
      setActiveTab("notifications");
    } else {
      navigate("/notifications");
    }
  };

  return (
    <header className="bg-white shadow-sm p-6 sticky top-0 z-10 mb-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {activeTab ? activeTab.charAt(0).toUpperCase() + activeTab.slice(1) : "Dashboard"}
          </h1>
          <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
            <MapPin size={16} className="text-green-600" />
            <span>{location}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full shadow-sm">
            <Leaf className="text-green-600" size={22} />
            <span className="font-bold text-lg text-green-700">{ecoPoints}</span>
            <span className="text-sm text-gray-600">EcoPoints</span>
          </div>

          <button
            className="relative p-2 hover:bg-gray-100 rounded-full"
            onClick={handleBellClick}
          >
            <Bell size={24} className="text-gray-600" />
            {notifications > 0 && (
              <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {notifications}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
