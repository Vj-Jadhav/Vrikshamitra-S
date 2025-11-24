import React, { useState, useEffect } from "react";
import { 
  Gamepad2, Trophy, Leaf, Recycle, Droplets, 
  Wind, Zap, TreePine, Target, Clock, Star,
  RefreshCw, ChevronRight, Award
} from "lucide-react";

// Game 1: Carbon Footprint Quiz
const CarbonQuizGame = ({ onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const questions = [
    {
      question: "Which mode of transport has the lowest carbon footprint?",
      options: ["Car", "Bicycle", "Airplane", "Motorcycle"],
      correct: 1,
      points: 100
    },
    {
      question: "What percentage of household energy does heating/cooling use?",
      options: ["20%", "35%", "50%", "65%"],
      correct: 2,
      points: 100
    },
    {
      question: "Which diet has the smallest environmental impact?",
      options: ["Carnivore", "Omnivore", "Vegetarian", "Vegan"],
      correct: 3,
      points: 100
    },
    {
      question: "How much water can a leaky faucet waste per day?",
      options: ["5 liters", "20 liters", "50 liters", "100 liters"],
      correct: 3,
      points: 100
    },
    {
      question: "Which appliance uses the most energy when left on standby?",
      options: ["TV", "Game Console", "Microwave", "Laptop Charger"],
      correct: 1,
      points: 100
    }
  ];

  const handleAnswer = (index) => {
    setSelectedAnswer(index);
    if (index === questions[currentQuestion].correct) {
      setScore(score + questions[currentQuestion].points);
    }
    
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      } else {
        setShowResult(true);
      }
    }, 1000);
  };

  if (showResult) {
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
    const percentage = (score / totalPoints) * 100;
    
    return (
      <div className="text-center p-6">
        <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold mb-2">Quiz Complete!</h3>
        <p className="text-3xl font-bold text-green-600 mb-4">{score} points</p>
        <p className="text-gray-600 mb-4">
          You got {percentage.toFixed(0)}% correct!
        </p>
        <button
          onClick={() => onComplete(score)}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
        >
          Claim Rewards
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex justify-between items-center">
        <span className="text-sm text-gray-600">
          Question {currentQuestion + 1}/{questions.length}
        </span>
        <span className="text-sm font-semibold text-green-600">
          Score: {score}
        </span>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">
          {questions[currentQuestion].question}
        </h3>
        
        <div className="space-y-3">
          {questions[currentQuestion].options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={selectedAnswer !== null}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                selectedAnswer === null
                  ? "border-gray-200 hover:border-green-400 hover:bg-green-50"
                  : selectedAnswer === index
                  ? index === questions[currentQuestion].correct
                    ? "border-green-500 bg-green-100"
                    : "border-red-500 bg-red-100"
                  : index === questions[currentQuestion].correct
                  ? "border-green-500 bg-green-100"
                  : "border-gray-200 opacity-50"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Game 2: Waste Sorting Challenge
const WasteSortingGame = ({ onComplete }) => {
  const [items, setItems] = useState([]);
  const [currentItem, setCurrentItem] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const [itemsProcessed, setItemsProcessed] = useState(0);

  const wasteItems = [
    { name: "Plastic Bottle", type: "recycle", icon: "🍾" },
    { name: "Banana Peel", type: "compost", icon: "🍌" },
    { name: "Newspaper", type: "recycle", icon: "📰" },
    { name: "Apple Core", type: "compost", icon: "🍎" },
    { name: "Glass Jar", type: "recycle", icon: "🫙" },
    { name: "Food Scraps", type: "compost", icon: "🥗" },
    { name: "Aluminum Can", type: "recycle", icon: "🥫" },
    { name: "Coffee Grounds", type: "compost", icon: "☕" },
    { name: "Cardboard Box", type: "recycle", icon: "📦" },
    { name: "Egg Shells", type: "compost", icon: "🥚" },
    { name: "Broken Toy", type: "trash", icon: "🧸" },
    { name: "Styrofoam", type: "trash", icon: "📦" }
  ];

  useEffect(() => {
    setCurrentItem(wasteItems[Math.floor(Math.random() * wasteItems.length)]);
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && !gameOver) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setGameOver(true);
    }
  }, [timeLeft, gameOver]);

  const handleSort = (binType) => {
    if (currentItem.type === binType) {
      setScore(score + 50);
    } else {
      setScore(Math.max(0, score - 25));
    }
    
    setItemsProcessed(itemsProcessed + 1);
    setCurrentItem(wasteItems[Math.floor(Math.random() * wasteItems.length)]);
  };

  if (gameOver) {
    return (
      <div className="text-center p-6">
        <Recycle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold mb-2">Time's Up!</h3>
        <p className="text-3xl font-bold text-green-600 mb-2">{score} points</p>
        <p className="text-gray-600 mb-4">Items sorted: {itemsProcessed}</p>
        <button
          onClick={() => onComplete(score)}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
        >
          Claim Rewards
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <span className="text-sm font-semibold text-green-600">
          Score: {score}
        </span>
        <span className="text-sm text-gray-600 flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {timeLeft}s
        </span>
      </div>

      {currentItem && (
        <div className="mb-8 text-center">
          <div className="text-6xl mb-3">{currentItem.icon}</div>
          <h3 className="text-xl font-semibold">{currentItem.name}</h3>
          <p className="text-gray-600 mt-2">Sort this item into the correct bin!</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => handleSort("recycle")}
          className="p-6 bg-blue-100 border-2 border-blue-300 rounded-xl hover:bg-blue-200 transition-all"
        >
          <Recycle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <span className="text-sm font-semibold text-blue-800">Recycle</span>
        </button>
        
        <button
          onClick={() => handleSort("compost")}
          className="p-6 bg-green-100 border-2 border-green-300 rounded-xl hover:bg-green-200 transition-all"
        >
          <Leaf className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <span className="text-sm font-semibold text-green-800">Compost</span>
        </button>
        
        <button
          onClick={() => handleSort("trash")}
          className="p-6 bg-gray-100 border-2 border-gray-300 rounded-xl hover:bg-gray-200 transition-all"
        >
          <Target className="w-8 h-8 text-gray-600 mx-auto mb-2" />
          <span className="text-sm font-semibold text-gray-800">Trash</span>
        </button>
      </div>
    </div>
  );
};

// Game 3: Energy Saver Challenge
const EnergySaverGame = ({ onComplete }) => {
  const [energy, setEnergy] = useState(100);
  const [actions, setActions] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);

  const scenarios = [
    { text: "Turn off lights in empty room", impact: 10, correct: true },
    { text: "Leave TV on standby all night", impact: -15, correct: false },
    { text: "Use LED bulbs instead of incandescent", impact: 15, correct: true },
    { text: "Set AC to 18°C in summer", impact: -20, correct: false },
    { text: "Unplug chargers when not in use", impact: 8, correct: true },
    { text: "Leave refrigerator door open", impact: -12, correct: false },
    { text: "Use natural light during daytime", impact: 12, correct: true },
    { text: "Run dishwasher half full", impact: -10, correct: false },
  ];

  useEffect(() => {
    if (energy <= 0 || round > 8) {
      setGameOver(true);
    }
  }, [energy, round]);

  const handleAction = (action, isGood) => {
    const newEnergy = energy + action.impact;
    setEnergy(Math.max(0, Math.min(100, newEnergy)));
    
    if ((isGood && action.correct) || (!isGood && !action.correct)) {
      setScore(score + Math.abs(action.impact) * 10);
    }
    
    setActions([...actions, action.text]);
    setRound(round + 1);
  };

  const getCurrentScenario = () => {
    return scenarios[(round - 1) % scenarios.length];
  };

  if (gameOver) {
    return (
      <div className="text-center p-6">
        <Zap className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold mb-2">Game Complete!</h3>
        <p className="text-3xl font-bold text-green-600 mb-2">{score} points</p>
        <p className="text-gray-600 mb-4">
          Final Energy: {energy}%
        </p>
        <button
          onClick={() => onComplete(score)}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
        >
          Claim Rewards
        </button>
      </div>
    );
  }

  const scenario = getCurrentScenario();

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Energy Level</span>
          <span className="text-sm font-semibold">{energy}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className={`h-4 rounded-full transition-all ${
              energy > 60 ? "bg-green-500" : energy > 30 ? "bg-yellow-500" : "bg-red-500"
            }`}
            style={{ width: `${energy}%` }}
          ></div>
        </div>
      </div>

      <div className="mb-6 text-center">
        <span className="text-sm text-gray-600">Round {round}/8</span>
        <h3 className="text-xl font-semibold mt-2 mb-4">{scenario.text}</h3>
        <p className="text-gray-600">Is this a good energy-saving practice?</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => handleAction(scenario, true)}
          className="p-6 bg-green-100 border-2 border-green-300 rounded-xl hover:bg-green-200 transition-all"
        >
          <span className="text-2xl mb-2 block">✅</span>
          <span className="text-sm font-semibold text-green-800">Good Practice</span>
        </button>
        
        <button
          onClick={() => handleAction(scenario, false)}
          className="p-6 bg-red-100 border-2 border-red-300 rounded-xl hover:bg-red-200 transition-all"
        >
          <span className="text-2xl mb-2 block">❌</span>
          <span className="text-sm font-semibold text-red-800">Bad Practice</span>
        </button>
      </div>

      <div className="mt-6 text-center">
        <span className="text-sm font-semibold text-green-600">Score: {score}</span>
      </div>
    </div>
  );
};

// Game 4: Water Conservation Memory
const WaterMemoryGame = ({ onComplete }) => {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const cardPairs = [
    { id: 1, icon: "💧", name: "Water Drop" },
    { id: 2, icon: "🚿", name: "Shower" },
    { id: 3, icon: "🚰", name: "Tap" },
    { id: 4, icon: "🌊", name: "Ocean" },
    { id: 5, icon: "☔", name: "Rain" },
    { id: 6, icon: "🏊", name: "Pool" },
  ];

  useEffect(() => {
    const shuffled = [...cardPairs, ...cardPairs]
      .sort(() => Math.random() - 0.5)
      .map((card, index) => ({ ...card, uniqueId: index }));
    setCards(shuffled);
  }, []);

  useEffect(() => {
    if (matched.length === cardPairs.length * 2 && matched.length > 0) {
      setGameOver(true);
    }
  }, [matched]);

  useEffect(() => {
    if (flipped.length === 2) {
      const [first, second] = flipped;
      if (cards[first].id === cards[second].id) {
        setMatched([...matched, first, second]);
      }
      setTimeout(() => setFlipped([]), 1000);
      setMoves(moves + 1);
    }
  }, [flipped]);

  const handleCardClick = (index) => {
    if (flipped.length < 2 && !flipped.includes(index) && !matched.includes(index)) {
      setFlipped([...flipped, index]);
    }
  };

  if (gameOver) {
    const score = Math.max(1000 - (moves * 50), 200);
    return (
      <div className="text-center p-6">
        <Droplets className="w-16 h-16 text-blue-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold mb-2">Excellent Memory!</h3>
        <p className="text-3xl font-bold text-green-600 mb-2">{score} points</p>
        <p className="text-gray-600 mb-4">Completed in {moves} moves</p>
        <button
          onClick={() => onComplete(score)}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
        >
          Claim Rewards
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 text-center">
        <p className="text-sm text-gray-600">Moves: {moves}</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {cards.map((card, index) => (
          <button
            key={card.uniqueId}
            onClick={() => handleCardClick(index)}
            className={`aspect-square rounded-lg border-2 text-3xl transition-all ${
              flipped.includes(index) || matched.includes(index)
                ? "bg-blue-100 border-blue-300"
                : "bg-gray-100 border-gray-300 hover:bg-gray-200"
            }`}
          >
            {(flipped.includes(index) || matched.includes(index)) ? card.icon : "❓"}
          </button>
        ))}
      </div>
    </div>
  );
};

// Game 5: Tree Planting Clicker
const TreePlantingGame = ({ onComplete }) => {
  const [trees, setTrees] = useState(0);
  const [autoPlant, setAutoPlant] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setGameOver(true);
    }
  }, [timeLeft]);

  useEffect(() => {
    if (autoPlant > 0 && timeLeft > 0) {
      const interval = setInterval(() => {
        setTrees(t => t + autoPlant);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [autoPlant, timeLeft]);

  const plantTree = () => {
    setTrees(trees + 1);
  };

  const buyAutoPlanter = () => {
    if (trees >= 10) {
      setTrees(trees - 10);
      setAutoPlant(autoPlant + 1);
    }
  };

  if (gameOver) {
    const score = trees * 20;
    return (
      <div className="text-center p-6">
        <TreePine className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold mb-2">Forest Created!</h3>
        <p className="text-3xl font-bold text-green-600 mb-2">{score} points</p>
        <p className="text-gray-600 mb-4">You planted {trees} trees! 🌳</p>
        <button
          onClick={() => onComplete(score)}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
        >
          Claim Rewards
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 text-center">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-600 flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {timeLeft}s
          </span>
          <span className="text-sm font-semibold text-green-600">
            Auto: +{autoPlant}/s
          </span>
        </div>
        
        <div className="text-6xl mb-4">🌳</div>
        <p className="text-4xl font-bold text-green-600">{trees}</p>
        <p className="text-gray-600">Trees Planted</p>
      </div>

      <button
        onClick={plantTree}
        className="w-full p-8 bg-green-500 text-white rounded-xl text-2xl font-bold hover:bg-green-600 active:scale-95 transition-all mb-4"
      >
        🌱 Plant Tree
      </button>

      <button
        onClick={buyAutoPlanter}
        disabled={trees < 10}
        className={`w-full p-4 rounded-xl border-2 transition-all ${
          trees >= 10
            ? "bg-blue-100 border-blue-300 hover:bg-blue-200"
            : "bg-gray-100 border-gray-300 opacity-50 cursor-not-allowed"
        }`}
      >
        <span className="font-semibold">Buy Auto-Planter (10 trees)</span>
      </button>
    </div>
  );
};

// Game 6: Climate Quiz Race
const ClimateRaceGame = ({ onComplete }) => {
  const [position, setPosition] = useState(0);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const questions = [
    {
      q: "Main greenhouse gas?",
      options: ["O2", "CO2", "N2"],
      correct: 1
    },
    {
      q: "Renewable energy?",
      options: ["Coal", "Solar", "Gas"],
      correct: 1
    },
    {
      q: "Ocean level rising?",
      options: ["No", "Yes", "Same"],
      correct: 1
    },
    {
      q: "Polar ice?",
      options: ["Growing", "Melting", "Stable"],
      correct: 1
    },
    {
      q: "Best transport?",
      options: ["Car", "Bike", "Plane"],
      correct: 1
    },
    {
      q: "Saves energy?",
      options: ["LED", "Halogen", "Both"],
      correct: 0
    },
    {
      q: "Reduce plastic?",
      options: ["No", "Maybe", "Yes"],
      correct: 2
    }
  ];

  const handleAnswer = (index) => {
    if (index === questions[currentQ].correct) {
      setScore(score + 100);
      setPosition(position + 1);
    }
    
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setGameOver(true);
    }
  };

  if (gameOver) {
    return (
      <div className="text-center p-6">
        <Wind className="w-16 h-16 text-blue-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold mb-2">Race Complete!</h3>
        <p className="text-3xl font-bold text-green-600 mb-2">{score} points</p>
        <p className="text-gray-600 mb-4">Progress: {position}/{questions.length}</p>
        <button
          onClick={() => onComplete(score)}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
        >
          Claim Rewards
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Progress</span>
          <span className="text-sm font-semibold">{position}/{questions.length}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="h-3 bg-blue-500 rounded-full transition-all"
            style={{ width: `${(position / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="mb-6 text-center">
        <h3 className="text-xl font-semibold mb-4">{questions[currentQ].q}</h3>
        
        <div className="space-y-3">
          {questions[currentQ].options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              className="w-full p-4 bg-blue-100 border-2 border-blue-300 rounded-xl hover:bg-blue-200 transition-all font-semibold"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main Games Page Component
const GamesPage = ({ studentData }) => {
  const [selectedGame, setSelectedGame] = useState(null);
  const [totalPoints, setTotalPoints] = useState(0);
  const [gamesCompleted, setGamesCompleted] = useState([]);

  const games = [
    {
      id: "carbon-quiz",
      name: "Carbon Footprint Quiz",
      description: "Test your knowledge about carbon emissions and climate impact",
      icon: Trophy,
      color: "yellow",
      difficulty: "Easy",
      points: "500",
      component: CarbonQuizGame
    },
    {
      id: "waste-sorting",
      name: "Waste Sorting Challenge",
      description: "Sort waste items correctly before time runs out!",
      icon: Recycle,
      color: "blue",
      difficulty: "Medium",
      points: "800",
      component: WasteSortingGame
    },
    {
      id: "energy-saver",
      name: "Energy Saver Challenge",
      description: "Make smart choices to conserve energy",
      icon: Zap,
      color: "yellow",
      difficulty: "Medium",
      points: "700",
      component: EnergySaverGame
    },
    {
      id: "water-memory",
      name: "Water Conservation Memory",
      description: "Match water-related cards to improve your memory",
      icon: Droplets,
      color: "blue",
      difficulty: "Easy",
      points: "600",
      component: WaterMemoryGame
    },
    {
      id: "tree-planting",
      name: "Tree Planting Rush",
      description: "Plant as many trees as possible in 30 seconds!",
      icon: TreePine,
      color: "green",
      difficulty: "Easy",
      points: "600",
      component: TreePlantingGame
    },
    {
      id: "climate-race",
      name: "Climate Quiz Race",
      description: "Speed through climate questions to win the race",
      icon: Wind,
      color: "blue",
      difficulty: "Hard",
      points: "900",
      component: ClimateRaceGame
    }
  ];

  const handleGameComplete = (score) => {
    setTotalPoints(totalPoints + score);
    if (!gamesCompleted.includes(selectedGame)) {
      setGamesCompleted([...gamesCompleted, selectedGame]);
    }
    setSelectedGame(null);
  };

  const getColorClasses = (color) => {
    const colors = {
      yellow: "bg-yellow-100 border-yellow-300 text-yellow-700",
      blue: "bg-blue-100 border-blue-300 text-blue-700",
      green: "bg-green-100 border-green-300 text-green-700"
    };
    return colors[color] || colors.green;
  };

  if (selectedGame) {
    const game = games.find(g => g.id === selectedGame);
    const GameComponent = game.component;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setSelectedGame(null)}
            className="mb-4 text-gray-600 hover:text-gray-800 flex items-center gap-2"
          >
            ← Back to Games
          </button>
          
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <game.icon className="w-8 h-8" />
                <h2 className="text-2xl font-bold">{game.name}</h2>
              </div>
              <p className="text-green-100">{game.description}</p>
            </div>
            
            <GameComponent onComplete={handleGameComplete} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Gamepad2 className="text-green-600 w-10 h-10" />
            <h1 className="text-4xl font-bold text-gray-800">Eco Games Hub</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Learn about sustainability while having fun! Complete games to earn EcoPoints.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 border-2 border-green-200 shadow-sm">
            <div className="flex items-center gap-3">
              <Star className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Total Points Earned</p>
                <p className="text-2xl font-bold text-green-600">{totalPoints}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border-2 border-blue-200 shadow-sm">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Games Completed</p>
                <p className="text-2xl font-bold text-blue-600">{gamesCompleted.length}/{games.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border-2 border-purple-200 shadow-sm">
            <div className="flex items-center gap-3">
              <Leaf className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Current Level</p>
                <p className="text-2xl font-bold text-purple-600">{studentData?.level || "Eco Starter"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => {
            const isCompleted = gamesCompleted.includes(game.id);
            const IconComponent = game.icon;
            
            return (
              <div
                key={game.id}
                className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all overflow-hidden group"
              >
                {/* Game Header */}
                <div className={`p-6 ${getColorClasses(game.color)} border-b-2`}>
                  <div className="flex items-start justify-between mb-3">
                    <IconComponent className="w-10 h-10" />
                    {isCompleted && (
                      <div className="bg-green-500 text-white rounded-full px-2 py-1 text-xs font-semibold flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Completed
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{game.name}</h3>
                  <p className="text-sm opacity-90">{game.description}</p>
                </div>

                {/* Game Info */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Up to {game.points} pts</span>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      game.difficulty === "Easy" 
                        ? "bg-green-100 text-green-700"
                        : game.difficulty === "Medium"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {game.difficulty}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedGame(game.id)}
                    className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-blue-600 transition-all flex items-center justify-center gap-2 group-hover:scale-105"
                  >
                    {isCompleted ? "Play Again" : "Start Game"}
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Motivational Footer */}
        <div className="mt-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl p-8 text-white text-center shadow-lg">
          <h3 className="text-2xl font-bold mb-3">🌍 Keep Playing, Keep Learning!</h3>
          <p className="text-green-100 text-lg mb-4">
            Every game you complete helps you understand how to protect our planet better.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              <span>Earn Points</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              <span>Level Up</span>
            </div>
            <div className="flex items-center gap-2">
              <Leaf className="w-5 h-5" />
              <span>Save Earth</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamesPage;