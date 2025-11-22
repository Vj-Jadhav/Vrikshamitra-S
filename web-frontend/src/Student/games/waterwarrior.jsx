import React, { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";

export default function WaterWarrior() {
  const [waterLevel, setWaterLevel] = useState(100);
  const [message, setMessage] = useState("💧 Spot and stop water wastage!");
  const [score, setScore] = useState(0);
  const [activities, setActivities] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [level, setLevel] = useState("Beginner");

  const allActivities = [
    { id: 1, name: "Tap running while brushing", isWasting: true },
    { id: 2, name: "Rainwater harvesting", isWasting: false },
    { id: 3, name: "Fixing a leaking tap", isWasting: false },
    { id: 4, name: "Watering plants at noon", isWasting: true },
    { id: 5, name: "Using bucket for bath", isWasting: false },
    { id: 6, name: "Car wash using pipe", isWasting: true },
    { id: 7, name: "Turning off tap while washing dishes", isWasting: false },
    { id: 8, name: "Overwatering garden daily", isWasting: true },
    { id: 9, name: "Collecting rainwater in tank", isWasting: false },
    { id: 10, name: "Leaving tap dripping", isWasting: true },
  ];

  const shuffleArray = (arr) => arr.sort(() => Math.random() - 0.5);

  useEffect(() => {
    setActivities(shuffleArray(allActivities).slice(0, 5));
  }, []);

  useEffect(() => {
    if (score < 30) setLevel("Beginner 💧");
    else if (score < 60) setLevel("Protector 🌿");
    else if (score < 90) setLevel("Hero 🌊");
    else setLevel("Legend 🏆");
  }, [score]);

  const handleChoice = (activity, choice) => {
    if (gameOver) return;

    if (
      (choice === "save" && !activity.isWasting) ||
      (choice === "stop" && activity.isWasting)
    ) {
      setScore((s) => s + 10);
      setWaterLevel((prev) => Math.min(prev + 8, 120));
      setMessage(`✅ Great! ${activity.name} saves water!`);
    } else {
      setScore((s) => s - 5);
      setWaterLevel((prev) => Math.max(prev - 12, 0));
      setMessage(`💦 Oops! ${activity.name} wastes water!`);
    }

    setActivities((prev) => prev.filter((a) => a.id !== activity.id));
  };

  useEffect(() => {
    if (waterLevel <= 0) {
      setGameOver(true);
      setMessage("💔 You ran out of water! Try again!");
    } else if (waterLevel >= 120) {
      setGameOver(true);
      setMessage("🌊 Amazing! You’re a Water Legend!");
      triggerConfetti();
    } else if (activities.length === 0 && !gameOver) {
      setGameOver(true);
      setMessage("🌱 Round Complete! You did great!");
    }
  }, [waterLevel, activities]);

  const restartGame = () => {
    setWaterLevel(100);
    setScore(0);
    setGameOver(false);
    setActivities(shuffleArray(allActivities).slice(0, 5));
    setMessage("💧 Spot and stop water wastage!");
  };

  // 🎉 Confetti effect
  const triggerConfetti = () => {
    const duration = 2000;
    const end = Date.now() + duration;
    (function frame() {
      const colors = ["#4FD1C5", "#60A5FA", "#34D399", "#FBBF24"];
      const confetti = document.createElement("div");
      confetti.style.position = "fixed";
      confetti.style.left = Math.random() * 100 + "vw";
      confetti.style.top = "-10px";
      confetti.style.width = "10px";
      confetti.style.height = "10px";
      confetti.style.backgroundColor =
        colors[Math.floor(Math.random() * colors.length)];
      confetti.style.borderRadius = "50%";
      confetti.style.opacity = 0.8;
      confetti.style.animation = `fall ${Math.random() * 2 + 2}s linear forwards`;
      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 3000);
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-100 via-teal-100 to-green-100 p-8">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl border border-blue-200 p-10 relative overflow-hidden">
        {/* 💧 Title */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-extrabold text-blue-700 drop-shadow-sm">
            💦 Water Warrior
          </h1>
          <p className="text-gray-600 mt-2 text-lg">{message}</p>
        </div>

        {/* 🌊 Tank with Animation */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative h-56 w-40 border-4 border-blue-400 rounded-2xl overflow-hidden bg-blue-50 shadow-inner">
            <div
              className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-blue-500 to-blue-300 transition-all duration-700 ease-in-out"
              style={{ height: `${Math.max(0, Math.min(100, waterLevel))}%` }}
            ></div>
            <div className="absolute top-2 w-full text-center font-bold text-blue-800">
              {waterLevel.toFixed(0)}%
            </div>
          </div>
          <div className="mt-3 text-blue-800 font-semibold">
            🌟 Level: {level}
          </div>
        </div>

        {/* 🌿 Score and Progress */}
        <div className="text-center mb-4">
          <div className="text-xl font-bold text-blue-700">
            Score: {score}
          </div>
          <div className="w-full bg-blue-100 rounded-full h-3 mt-2">
            <div
              className="bg-blue-500 h-3 rounded-full transition-all"
              style={{ width: `${(score / 100) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* 🚿 Activity Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="p-5 bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl shadow-lg border border-blue-200 hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <p className="font-medium text-gray-800 mb-4 text-center text-lg">
                {activity.name}
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => handleChoice(activity, "stop")}
                  className="bg-red-100 text-red-600 px-5 py-2 rounded-xl font-semibold hover:bg-red-200 shadow-sm hover:shadow-md transition"
                >
                  🚫 Stop
                </button>
                <button
                  onClick={() => handleChoice(activity, "save")}
                  className="bg-green-100 text-green-600 px-5 py-2 rounded-xl font-semibold hover:bg-green-200 shadow-sm hover:shadow-md transition"
                >
                  💧 Save
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 🎮 Restart / Game Over */}
        {gameOver && (
          <div className="text-center mt-6">
            <p className="text-xl font-bold text-blue-700 mb-3 animate-pulse">
              {waterLevel <= 0
                ? "💔 Game Over!"
                : waterLevel >= 120
                ? "🌊 Water Legend!"
                : "✅ Round Complete!"}
            </p>
            <button
              onClick={restartGame}
              className="flex items-center gap-2 mx-auto bg-blue-600 text-white px-6 py-3 rounded-full shadow-md hover:bg-blue-700 hover:shadow-lg transition"
            >
              <RefreshCw className="w-5 h-5" /> Restart Game
            </button>
          </div>
        )}
      </div>

      {/* 🌱 Footer Quote */}
      <p className="mt-8 text-gray-600 italic text-sm text-center max-w-lg">
        “Every drop you save today adds life to tomorrow.” 💧
      </p>

      {/* 🌈 Animation CSS */}
      <style>{`
        @keyframes fall {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
