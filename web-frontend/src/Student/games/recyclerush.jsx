import React, { useState, useEffect } from "react";
import { RefreshCw, Trophy, Clock } from "lucide-react";

// 🗑️ Waste Items
const itemsData = [
  { id: 1, name: "Plastic Bottle", type: "plastic" },
  { id: 2, name: "Newspaper", type: "paper" },
  { id: 3, name: "Banana Peel", type: "organic" },
  { id: 4, name: "Tin Can", type: "metal" },
  { id: 5, name: "Cardboard Box", type: "paper" },
  { id: 6, name: "Aluminum Foil", type: "metal" },
  { id: 7, name: "Plastic Bag", type: "plastic" },
  { id: 8, name: "Apple Core", type: "organic" },
];

// 🪣 Bins
const bins = [
  { id: "plastic", label: "Plastic Bin 🧴" },
  { id: "paper", label: "Paper Bin 📄" },
  { id: "metal", label: "Metal Bin 🪙" },
  { id: "organic", label: "Organic Bin 🍌" },
];

export default function RecycleRush() {
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("Drag the items into correct bins!");
  const [remaining, setRemaining] = useState(itemsData);
  const [timer, setTimer] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const [soundsReady, setSoundsReady] = useState(false);

  // ✅ Preload sounds safely (only play after user interaction)
  const correctSound = new Audio("/sounds/correct.mp3");
  const wrongSound = new Audio("/sounds/wrong.mp3");

  useEffect(() => {
    const enableSounds = () => setSoundsReady(true);
    window.addEventListener("click", enableSounds, { once: true });
    return () => window.removeEventListener("click", enableSounds);
  }, []);

  // ⏱ Timer Countdown
  useEffect(() => {
    if (timer > 0 && !gameOver && remaining.length > 0) {
      const countdown = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(countdown);
    } else if (timer === 0) {
      setGameOver(true);
      setMessage("⏰ Time’s up! Try again to improve your sorting speed!");
    }
  }, [timer, gameOver, remaining]);

  // 🎯 Handle Drop Logic
  const handleDrop = (binType, item) => {
    if (!item || !item.type) return;

    if (item.type === binType) {
      if (soundsReady) correctSound.play().catch(() => {});
      const newScore = score + 10;
      const newRemaining = remaining.filter((i) => i.id !== item.id);
      setScore(newScore);
      setRemaining(newRemaining);
      setMessage(`✅ Correct! ${item.name} belongs in the ${binType} bin.`);
      setProgress(((itemsData.length - newRemaining.length) / itemsData.length) * 100);

      if (newRemaining.length === 0) {
        setGameOver(true);
        setMessage("🎉 Great job! You sorted all items correctly!");
      }
    } else {
      if (soundsReady) wrongSound.play().catch(() => {});
      setScore(score - 5);
      setMessage(
        `❌ Oops! ${item.name} doesn't belong in the ${binType} bin. It goes in the ${item.type} bin.`
      );
    }
  };

  // 🔁 Restart Game
  const restartGame = () => {
    setScore(0);
    setTimer(60);
    setGameOver(false);
    setRemaining(itemsData);
    setMessage("Drag the items into correct bins!");
    setProgress(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl p-8 border border-green-200">
        {/* 🌍 Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-green-700">
            ♻️ Recycle Rush
          </h1>
          <p className="text-gray-600">{message}</p>
        </div>

        {/* 🧮 Stats */}
        <div className="flex justify-around mb-4 text-gray-700">
          <div className="flex items-center gap-2 font-medium">
            <Trophy className="text-amber-500" /> Score: {score}
          </div>
          <div className="flex items-center gap-2 font-medium">
            <Clock className="text-blue-500" /> Time Left: {timer}s
          </div>
        </div>

        {/* 📊 Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
          <div
            className="bg-green-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* 🗑️ Waste Items */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {remaining.map((item) => (
            <div
              key={item.id}
              draggable={!gameOver}
              onDragStart={(e) =>
                e.dataTransfer.setData("item", JSON.stringify(item))
              }
              className="bg-green-100 text-green-800 px-4 py-2 rounded-lg shadow-md cursor-grab hover:bg-green-200 transition-transform transform hover:-translate-y-1"
            >
              {item.name}
            </div>
          ))}
        </div>

        {/* 🗳️ Bins */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {bins.map((bin) => (
            <div
              key={bin.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                const dropped = e.dataTransfer.getData("item");
                if (dropped) handleDrop(bin.id, JSON.parse(dropped));
              }}
              className="p-6 border-2 border-green-400 rounded-2xl bg-green-50 hover:bg-green-100 transition-all shadow-sm text-center"
            >
              <p className="font-semibold text-green-800">{bin.label}</p>
            </div>
          ))}
        </div>

        {/* 🎯 Game End */}
        {gameOver && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-green-700 mb-2">
              {remaining.length === 0 ? "🌟 Excellent!" : "Game Over! Try Again!"}
            </h2>
            <p className="text-gray-600 mb-4">
              Final Score: <span className="font-semibold">{score}</span>
            </p>
            <button
              onClick={restartGame}
              className="flex items-center gap-2 mx-auto bg-green-500 text-white px-6 py-2 rounded-full shadow-md hover:bg-green-600 transition-all"
            >
              <RefreshCw className="w-4 h-4" /> Restart Game
            </button>
          </div>
        )}
      </div>

      {/* 🌱 Quote */}
      <p className="mt-6 text-gray-500 italic text-sm">
        “Small acts, when multiplied by millions, can transform the world.”
      </p>
    </div>
  );
}
