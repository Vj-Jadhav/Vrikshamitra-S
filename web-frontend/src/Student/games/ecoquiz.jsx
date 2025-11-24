import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function EcoQuiz() {
  const allQuestions = [
    {
      question: "What is the best way to save electricity at home?",
      options: [
        "Keep lights on all the time",
        "Turn off lights when not needed",
        "Use many bulbs for more brightness",
        "Ignore electricity bills",
      ],
      correct: 1,
    },
    {
      question: "Which of these items can be recycled?",
      options: ["Plastic bottles", "Food waste", "Used tissues", "Soil"],
      correct: 0,
    },
    {
      question: "Planting trees helps to...",
      options: [
        "Increase pollution",
        "Reduce oxygen",
        "Absorb carbon dioxide",
        "Reduce rainfall",
      ],
      correct: 2,
    },
    {
      question: "Which transport is most eco-friendly?",
      options: ["Car", "Bus", "Bicycle", "Motorbike"],
      correct: 2,
    },
    {
      question: "What should you do with e-waste (old electronics)?",
      options: [
        "Throw it in normal garbage",
        "Burn it outside",
        "Send to e-waste collection center",
        "Bury it underground",
      ],
      correct: 2,
    },
    {
      question: "Which of these actions helps conserve water?",
      options: [
        "Leaving taps open",
        "Using bucket for bathing",
        "Washing car with pipe",
        "Ignoring leaks",
      ],
      correct: 1,
    },
  ];

  const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);

  const [questions, setQuestions] = useState(shuffleArray(allQuestions));
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [showConfetti, setShowConfetti] = useState(false);

  // Timer logic
  useEffect(() => {
    if (!showResult && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleAnswer(-1); // auto skip when time ends
    }
  }, [timeLeft, showResult]);

  const handleAnswer = (index) => {
    if (index === questions[currentQ].correct) {
      setScore((prev) => prev + 10);
    }

    const next = currentQ + 1;
    if (next < questions.length) {
      setCurrentQ(next);
      setTimeLeft(15);
    } else {
      setShowResult(true);
      if (score >= 30) setShowConfetti(true);
    }
  };

  const restartQuiz = () => {
    setQuestions(shuffleArray(allQuestions)); // shuffle for new order
    setCurrentQ(0);
    setScore(0);
    setShowResult(false);
    setTimeLeft(15);
    setShowConfetti(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-green-50 to-green-100 p-6">
      <h1 className="text-3xl font-extrabold text-green-700 mb-6 drop-shadow-md">
        🌿 Eco Awareness Quiz
      </h1>

      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-xl w-full border border-green-200 relative overflow-hidden">
        {/* Confetti effect */}
        {showConfetti && (
          <div className="absolute inset-0 text-5xl text-green-300 animate-bounce">
            🎉🎊
          </div>
        )}

        {!showResult ? (
          <>
            {/* Progress Bar */}
            <div className="w-full bg-green-100 rounded-full h-3 mb-5">
              <div
                className="bg-green-500 h-3 rounded-full transition-all"
                style={{
                  width: `${((currentQ + 1) / questions.length) * 100}%`,
                }}
              ></div>
            </div>

            {/* Timer */}
            <div className="flex justify-between mb-4">
              <p className="text-gray-600 text-sm">
                Question {currentQ + 1} / {questions.length}
              </p>
              <p
                className={`font-bold ${
                  timeLeft <= 5 ? "text-red-500" : "text-green-600"
                }`}
              >
                ⏰ {timeLeft}s
              </p>
            </div>

            {/* Question Section */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQ}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  {questions[currentQ].question}
                </h2>
                <div className="grid gap-3">
                  {questions[currentQ].options.map((option, i) => (
                    <button
                      key={i}
                      onClick={() => handleAnswer(i)}
                      className="w-full bg-green-50 hover:bg-green-100 border border-green-300 text-gray-700 font-medium px-4 py-2 rounded-xl shadow-sm hover:shadow-md transition-all"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              🎉 Quiz Completed!
            </h2>
            <p className="text-lg text-green-700 font-semibold mb-2">
              Your Score: {score} / {questions.length * 10}
            </p>

            {score >= 40 ? (
              <p className="text-green-600 text-lg">
                🌱 Excellent! You’re an Eco Expert!
              </p>
            ) : score >= 20 ? (
              <p className="text-amber-600 text-lg">
                🌿 Nice! You’re becoming an Eco Learner!
              </p>
            ) : (
              <p className="text-red-500 text-lg">
                🍂 Keep improving — small steps save nature!
              </p>
            )}

            <button
              onClick={restartQuiz}
              className="mt-6 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-md font-semibold transition-all"
            >
              🔄 Restart Quiz
            </button>
          </motion.div>
        )}
      </div>

      <p className="mt-6 text-sm text-gray-500 italic">
        🌎 Learn. Play. Protect the Earth.
      </p>
    </div>
  );
}
