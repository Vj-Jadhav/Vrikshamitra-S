import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function OceanSavior() {
  const [items, setItems] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(40);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("");
  const [achievement, setAchievement] = useState("");
  const [combo, setCombo] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);

  const wasteItems = ["🪣", "🧴", "🍾", "🥤", "🧃", "🩴", "🪶"];
  const fishItems = ["🐠", "🐟", "🐡", "🦈", "🐬", "🐙"];
  const oceanTips = [
    "Avoid single-use plastics 🌍",
    "Use reusable bottles ♻️",
    "Join beach clean-up drives 🧹",
    "Support marine life conservation 🐋",
    "Reduce water pollution 💧",
  ];

  // 🎵 Sound Effects
  const playSound = (type) => {
    try {
      const soundMap = {
        success: "https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg",
        error: "https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg",
        gameover: "https://actions.google.com/sounds/v1/cartoon/metal_twang.ogg",
        bonus: "https://actions.google.com/sounds/v1/cartoon/airhorn.ogg",
        milestone50: "https://actions.google.com/sounds/v1/cartoon/pop.ogg",
        milestone100: "https://actions.google.com/sounds/v1/cartoon/clang.ogg",
        milestone150: "https://actions.google.com/sounds/v1/cartoon/boing.ogg",
      };
      const audio = new Audio(soundMap[type]);
      audio.volume = 0.4;
      audio.play().catch(() => {});
    } catch (err) {
      console.warn("Audio play failed:", err);
    }
  };

  // 🎮 Generate floating items
  const generateItems = () => {
    const newItems = [];
    for (let i = 0; i < 6; i++) {
      const isTrash = Math.random() > 0.5;
      newItems.push({
        id: Math.random(),
        symbol: isTrash
          ? wasteItems[Math.floor(Math.random() * wasteItems.length)]
          : fishItems[Math.floor(Math.random() * fishItems.length)],
        type: isTrash ? "trash" : "fish",
        left: Math.random() * 85 + "%",
        top: Math.random() * 60 + "%",
      });
    }
    setItems(newItems);
  };

  // 🌊 Start game
  useEffect(() => {
    if (showInstructions) return; // Wait until instructions are closed
    generateItems();
    const moveInterval = setInterval(generateItems, 1200);

    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t === 1) {
          clearInterval(timer);
          clearInterval(moveInterval);
          setGameOver(true);
          playSound("gameover");
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      clearInterval(moveInterval);
      clearInterval(timer);
    };
  }, [showInstructions]);

  // 🐚 Handle clicks
  const handleClick = (item) => {
    if (item.type === "trash") {
      const points = 10 + combo * 2;
      setScore((prev) => {
        const newScore = prev + points;

        // Milestone sounds
        if (newScore >= 50 && prev < 50) playSound("milestone50");
        if (newScore >= 100 && prev < 100) playSound("milestone100");
        if (newScore >= 150 && prev < 150) playSound("milestone150");

        return newScore;
      });

      setCombo((c) => {
        const newCombo = c + 1;
        if (newCombo >= 5) playSound("bonus"); // Bonus for high combo
        return newCombo;
      });
      setMessage(`✅ Great! +${points} points`);
      playSound("success");
    } else {
      setScore((prev) => (prev > 0 ? prev - 5 : 0));
      setCombo(0);
      setMessage("⚠️ Oops! You touched a fish!");
      playSound("error");
    }
  };

  // 🏆 Achievements
  useEffect(() => {
    if (score >= 150) setAchievement("🌊 Ocean Guardian! You’re saving the seas!");
    else if (score >= 100) setAchievement("🐬 Marine Protector! Great job!");
    else if (score >= 50) setAchievement("🌱 Eco Learner! Keep it up!");
  }, [score]);

  // 🔄 Restart
  const restartGame = () => {
    setScore(0);
    setCombo(0);
    setTimeLeft(40);
    setGameOver(false);
    setMessage("");
    setAchievement("");
    setShowInstructions(true);
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto bg-gradient-to-b from-sky-200 via-blue-300 to-blue-500 overflow-hidden rounded-3xl shadow-2xl border border-blue-200 p-6 text-center min-h-[500px]">
      <h1 className="text-3xl font-extrabold text-blue-900 drop-shadow mb-2">
        🌊 Ocean Savior
      </h1>
      <p className="text-blue-50 text-base font-medium mb-3">
        Clean the ocean by removing waste — avoid marine animals!
      </p>

      {/* 🧭 Instructions Modal */}
      {showInstructions && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 bg-blue-900/80 backdrop-blur-sm flex flex-col justify-center items-center text-white rounded-3xl p-8 z-20"
        >
          <h2 className="text-2xl font-bold mb-3">How to Play 🕹️</h2>
          <ul className="text-left text-lg mb-4 space-y-2">
            <li>💧 Tap on trash items to clean the ocean.</li>
            <li>🐠 Avoid touching fish — it reduces your score!</li>
            <li>🔥 Get combo bonuses for quick hits.</li>
            <li>⏰ You have 40 seconds — do your best!</li>
          </ul>
          <button
            onClick={() => setShowInstructions(false)}
            className="mt-3 px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold rounded-full shadow-md transition-all"
          >
            Start Cleaning 🌍
          </button>
        </motion.div>
      )}

      {!gameOver && !showInstructions ? (
        <>
          {/* Status Bar */}
          <div className="flex justify-between items-center bg-blue-800/40 backdrop-blur-md rounded-full px-6 py-2 mb-4 text-white font-semibold shadow-inner">
            <span>⏰ Time: <span className="text-yellow-300">{timeLeft}s</span></span>
            <span>💯 Score: <span className="text-green-200">{score}</span></span>
            <span>🔥 Combo: {combo}</span>
          </div>

          {/* Floating items */}
          <div className="relative w-full h-[350px] overflow-hidden">
            <AnimatePresence>
              {items.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => handleClick(item)}
                  className="absolute text-5xl transition-transform hover:scale-125 duration-200 select-none"
                  style={{ left: item.left, top: item.top }}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  {item.symbol}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>

          {/* Message */}
          {message && (
            <motion.div
              key={message}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 bg-white/70 text-blue-900 font-semibold rounded-xl shadow-md py-2 px-4 inline-block"
            >
              {message}
            </motion.div>
          )}
        </>
      ) : (
        !showInstructions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-blue-50 rounded-3xl shadow-xl p-6 border border-blue-200 mt-4"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-3">🏁 Game Over!</h2>
            <p className="text-lg text-blue-700 font-semibold mb-2">
              Final Score: {score}
            </p>
            {achievement && (
              <p className="text-green-600 text-lg mb-3">{achievement}</p>
            )}
            <p className="text-sm text-gray-600 italic mb-3">
              💡 {oceanTips[Math.floor(Math.random() * oceanTips.length)]}
            </p>

            <button
              onClick={restartGame}
              className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full shadow-md transition-all"
            >
              🔁 Play Again
            </button>
          </motion.div>
        )
      )}

      {/* Decorative animated wave */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-blue-800 to-transparent opacity-70"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      ></motion.div>

      <p className="mt-5 text-blue-50 text-sm italic">
        🌍 Every click helps keep the ocean blue and full of life.
      </p>
    </div>
  );
}
