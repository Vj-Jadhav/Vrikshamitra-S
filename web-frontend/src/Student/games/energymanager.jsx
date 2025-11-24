import React, { useState, useEffect } from "react";

export default function EnergyManager() {
  const [devices, setDevices] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [energy, setEnergy] = useState(100);

  const allDevices = [
    { name: "💡 Light Bulb", type: "off" },
    { name: "🖥️ Computer", type: "off" },
    { name: "📺 TV", type: "off" },
    { name: "🔌 Charger", type: "off" },
    { name: "❄️ AC", type: "off" },
    { name: "🔦 Lamp", type: "off" },
    { name: "🔊 Speaker", type: "off" },
  ];

  useEffect(() => {
    setDevices(allDevices);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameOver(true);
        }
        return prev - 1;
      });
    }, 1000);

    // dynamic difficulty
    let speed = 1500;
    const toggleInterval = setInterval(() => {
      speed = Math.max(700, speed - 100);
      setDevices((prev) =>
        prev.map((d) =>
          Math.random() > 0.5 ? { ...d, type: "on" } : { ...d, type: "off" }
        )
      );
    }, speed);

    return () => {
      clearInterval(timer);
      clearInterval(toggleInterval);
    };
  }, []);

  const handleClick = (index) => {
    if (gameOver) return;

    if (devices[index].type === "on") {
      setScore((prev) => prev + 5);
      setEnergy((prev) => Math.min(prev + 5, 100));
      const updated = [...devices];
      updated[index].type = "off";
      setDevices(updated);
      playSound("click");
    } else {
      setScore((prev) => (prev > 0 ? prev - 2 : 0));
      setEnergy((prev) => Math.max(prev - 10, 0));
      playSound("error");
    }
  };

  // ✅ Safe & compatible sound function
  const playSound = (type) => {
    try {
      const audio = new Audio(
        type === "click"
          ? "https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg"
          : "https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg"
      );
      audio.volume = 0.4;
      audio.play().catch(() => {});
    } catch (err) {
      console.warn("Audio play failed:", err);
    }
  };

  const restartGame = () => {
    setScore(0);
    setTimeLeft(30);
    setEnergy(100);
    setGameOver(false);
    setDevices(allDevices);
  };

  return (
    <div className="p-4 text-center max-w-lg mx-auto bg-gradient-to-br from-yellow-50 to-green-50 rounded-2xl shadow-lg border border-yellow-200">
      <h1 className="text-2xl font-bold text-yellow-700 mb-1">⚡ Energy Manager</h1>
      <p className="text-sm text-gray-600 mb-3">
        Turn off devices quickly to save energy before time runs out!
      </p>

      {!gameOver ? (
        <>
          <div className="mb-3 text-base font-semibold text-gray-700">
            ⏳ <span className="text-red-500">{timeLeft}s</span> | 💯{" "}
            <span className="text-green-600">{score}</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
            <div
              className="bg-green-500 h-3 rounded-full transition-all"
              style={{ width: `${(timeLeft / 30) * 100}%` }}
            ></div>
          </div>

          {/* Energy Meter */}
          <div className="w-full bg-yellow-100 rounded-full h-2 mb-3">
            <div
              className={`h-2 rounded-full transition-all ${
                energy > 60
                  ? "bg-green-500"
                  : energy > 30
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${energy}%` }}
            ></div>
          </div>

          {/* Devices */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {devices.map((device, index) => (
              <button
                key={index}
                onClick={() => handleClick(index)}
                className={`rounded-xl shadow-md py-3 px-2 border text-center transition-all duration-300 transform hover:scale-105 ${
                  device.type === "on"
                    ? "bg-yellow-200 hover:bg-yellow-300 border-yellow-400 animate-pulse"
                    : "bg-green-100 hover:bg-green-200 border-green-400"
                }`}
              >
                <span className="text-xl">{device.name}</span>
                <p
                  className={`mt-1 text-sm font-bold ${
                    device.type === "on" ? "text-yellow-700" : "text-green-700"
                  }`}
                >
                  {device.type === "on" ? "ON" : "OFF"}
                </p>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="bg-yellow-50 rounded-2xl shadow-md p-4 border border-yellow-200">
          <h2 className="text-xl font-bold text-gray-800 mb-1">⏰ Time’s Up!</h2>
          <p className="text-lg text-yellow-700 font-semibold mb-1">
            Final Score: {score}
          </p>
          {score >= 60 ? (
            <p className="text-green-600 font-medium">
              🌟 Amazing! You’re a Power Saver Hero!
            </p>
          ) : (
            <p className="text-amber-600 font-medium">
              💡 Keep practicing to improve your energy-saving skills!
            </p>
          )}
          <button
            onClick={restartGame}
            className="mt-4 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition-all"
          >
            🔁 Restart
          </button>
        </div>
      )}
    </div>
  );
}
