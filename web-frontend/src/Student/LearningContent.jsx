import { useEffect, useState, useRef } from "react";
import axios from "axios";

const LearningContent = ({ userProfile, updateecoPoint }) => {
  const [learningModules, setLearningModules] = useState([]);
  const [activeModule, setActiveModule] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completedModules, setCompletedModules] = useState([]);
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [userEcoPoints, setUserEcoPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updatingPoints, setUpdatingPoints] = useState(false);
  const playerRef = useRef(null);
  const intervalRef = useRef(null);

  const API_BASE_URL =
    import.meta.env?.VITE_API_BASE_URL ||
    process.env?.REACT_APP_API_BASE_URL ||
    "http://localhost:5000";

  // Fetch user data (with fallback to localStorage if prop is missing)
  const fetchUserData = async () => {
    let finalUserProfile = userProfile;
    console.log("Initial userProfile prop:", userProfile); // Debug prop
    if (!finalUserProfile?._id) {
      const stored = localStorage.getItem("user");
      console.log("localStorage 'user':", stored); // Debug localStorage
      if (stored) {
        finalUserProfile = JSON.parse(stored);
        console.log("Using localStorage fallback:", finalUserProfile); // Confirm fallback
      }
    }

    console.log("Final User Profile:", finalUserProfile);
    if (!finalUserProfile?._id) {
      console.error("User ID not found - Prop:", userProfile, "Stored:", localStorage.getItem("user"));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userRes = await axios.get(`${API_BASE_URL}/api/users/${finalUserProfile._id}`);
      const points = userRes.data.ecoPoints || 0;
      setUserEcoPoints(points);
      localStorage.setItem("userEcoPoints", points);

      const completed = userRes.data.completedModules || [];
      setCompletedModules(completed.map(id => id.toString()));
      localStorage.setItem("completedModules", JSON.stringify(completed));
    } catch (err) {
      console.error("Error fetching user data:", err);
      // Fallback
      const fallbackPoints = localStorage.getItem("userEcoPoints") || 0;
      setUserEcoPoints(Number(fallbackPoints));
      const fallbackCompleted = JSON.parse(localStorage.getItem("completedModules")) || [];
      setCompletedModules(fallbackCompleted);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/modules/all`);
        setLearningModules(data);
      } catch (err) {
        console.error("Error fetching modules:", err);
      }
    };

    fetchModules();
    fetchUserData();

    // Auto-refresh user data every 30 seconds
    const interval = setInterval(fetchUserData, 30000);
    return () => clearInterval(interval);
  }, [userProfile?._id, API_BASE_URL]);

  // Load YouTube IFrame API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
  }, []);

  const handleStartLearning = (module) => {
    setActiveModule(module);
    setProgress(0);
    setIsCompleted(false);
    setCurrentTime(0);
    setVideoDuration(0);
  };

  // Initialize YouTube Player
  useEffect(() => {
    if (activeModule && window.YT && window.YT.Player) {
      const videoId = extractYouTubeId(activeModule.videoUrl);

      setTimeout(() => {
        try {
          playerRef.current = new window.YT.Player("youtube-player", {
            videoId: videoId,
            events: {
              onReady: onPlayerReady,
              onStateChange: onPlayerStateChange,
            },
          });
        } catch (error) {
          console.error("Error initializing YouTube player:", error);
        }
      }, 500);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (playerRef.current?.destroy) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          console.log("Player cleanup error:", e);
        }
      }
    };
  }, [activeModule]);

  const onPlayerReady = (event) => {
    const duration = event.target.getDuration();
    setVideoDuration(duration);
  };

  const onPlayerStateChange = (event) => {
    if (event.data === 1) startProgressTracking();
    else stopProgressTracking();
  };

  const startProgressTracking = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      if (playerRef.current?.getCurrentTime) {
        try {
          const current = playerRef.current.getCurrentTime();
          const duration = playerRef.current.getDuration();
          setCurrentTime(current);

          if (duration > 0) {
            const progressPercentage = (current / duration) * 100;
            setProgress(progressPercentage);

            if (progressPercentage >= 95 && !isCompleted) {
              setIsCompleted(true);
              stopProgressTracking();
            }
          }
        } catch (error) {
          console.error("Error tracking progress:", error);
        }
      }
    }, 1000);
  };

  const stopProgressTracking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Handle collecting points with direct database save
  const handleCollectPoints = async () => {
    let finalUserProfile = userProfile;
    if (!finalUserProfile?._id) {
      const stored = localStorage.getItem("user");
      if (stored) finalUserProfile = JSON.parse(stored);
    }

    const moduleId = activeModule?._id?.toString();
    console.log("Active Module ID:", moduleId);
    console.log("Completed Modules:", completedModules);
    console.log("User Profile ID:", finalUserProfile?._id);
    console.log("Is Module Completed:", completedModules.includes(moduleId));
    console.log("Is User ID Present:", !!finalUserProfile?._id);

    if (!activeModule || completedModules.includes(moduleId) || !finalUserProfile?._id) {
      alert("Error: Module already completed or user not found.");
      return;
    }

    setUpdatingPoints(true);
    try {
      // Calculate new total points
      const newTotalPoints = userEcoPoints + activeModule.ecoPoint;

      // Mark module as completed locally
      const newCompleted = [...completedModules, moduleId];

      // API call to update eco-points AND completedModules in database
      await axios.put(`${API_BASE_URL}/api/users/${finalUserProfile._id}`, {
        ecoPoints: newTotalPoints,
        completedModules: newCompleted, // Save to DB to persist across sessions
      });

      // Update local state and localStorage
      setUserEcoPoints(newTotalPoints);
      localStorage.setItem("userEcoPoints", newTotalPoints);
      setCompletedModules(newCompleted);
      localStorage.setItem("completedModules", JSON.stringify(newCompleted));

      // Update parent component (for global state/UI sync)
      if (updateecoPoint) updateecoPoint(activeModule.ecoPoint);

      alert(`🎉 You earned ${activeModule.ecoPoint} Eco-Points! Total: ${newTotalPoints}`);
      handleCloseModule();
    } catch (err) {
      console.error("Error updating eco-points:", err);
      alert("❌ Failed to collect points. Please try again.");
    } finally {
      setUpdatingPoints(false);
    }
  };

  const handleCloseModule = () => {
    stopProgressTracking();
    if (playerRef.current?.destroy) {
      try {
        playerRef.current.destroy();
      } catch (e) {
        console.log("Player cleanup error:", e);
      }
    }
    setActiveModule(null);
    setProgress(0);
    setIsCompleted(false);
    setCurrentTime(0);
    setVideoDuration(0);
  };

  const extractYouTubeId = (url) => {
    if (!url) return "";
    const shortMatch = url.match(/youtu\.be\/([^\?&]+)/);
    if (shortMatch) return shortMatch[1];
    const watchMatch = url.match(/[?&]v=([^&]+)/);
    if (watchMatch) return watchMatch[1];
    const embedMatch = url.match(/\/embed\/([^\?&]+)/);
    if (embedMatch) return embedMatch[1];
    const parts = url.split("/");
    return parts[parts.length - 1].split("?")[0];
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isCurrentModuleCompleted =
    activeModule && completedModules.includes(activeModule._id.toString());

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading learning modules... ⏳</p>
        </div>
      </div>
    );
  }

  // Active module view
  if (activeModule) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-5xl mx-auto">
          {/* Header with total eco-points */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {activeModule.title}
              </h2>
              <p className="text-gray-600">{activeModule.description}</p>
            </div>
            <div className="text-right">
              
            </div>
            <button
              onClick={handleCloseModule}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold px-4 py-2 hover:bg-gray-100 rounded-lg transition"
            >
              ✕
            </button>
          </div>

          {/* Video player */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
              <div id="youtube-player" className="absolute top-0 left-0 w-full h-full"></div>
            </div>
          </div>

          {/* Progress and collect button */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                <div className="flex items-center gap-3">
                  {videoDuration > 0 && (
                    <span className="text-xs text-gray-500">
                      {formatTime(currentTime)} / {formatTime(videoDuration)}
                    </span>
                  )}
                  <span className="text-sm font-bold text-blue-600">
                    {Math.round(progress)}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {isCurrentModuleCompleted
                  ? "✅ You have already completed this module"
                  : progress >= 95
                  ? "🎉 You've completed this module!"
                  : "Watch at least 95% of the video to unlock eco-points"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {activeModule.ecoPoint}
                </div>
                <div className="text-sm text-gray-600">Eco-Points</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">
                  {isCurrentModuleCompleted ? "✅" : isCompleted ? "✅" : "⏳"}
                </div>
                <div className="text-sm text-gray-600">
                  {isCurrentModuleCompleted
                    ? "Already Completed"
                    : isCompleted
                    ? "Completed"
                    : "In Progress"}
                </div>
              </div>
            </div>

            {isCurrentModuleCompleted ? (
              <button
                disabled
                className="w-full bg-gray-300 text-gray-600 font-bold py-4 rounded-lg cursor-not-allowed"
              >
                ✅ Already Collected Points
              </button>
            ) : isCompleted ? (
              <button
                onClick={handleCollectPoints}
                disabled={updatingPoints}
                className={`w-full font-bold py-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                  updatingPoints
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                }`}
              >
                {updatingPoints ? "⏳ Updating..." : `🎁 Collect ${activeModule.ecoPoint} Eco-Points`}
              </button>
            ) : (
              <button
                disabled
                className="w-full bg-gray-300 text-gray-600 font-bold py-4 rounded-lg cursor-not-allowed"
              >
                ⏳ Keep Watching... ({Math.round(progress)}%)
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default modules grid
  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-2xl shadow-xl p-8">
          <h2 className="text-4xl font-bold mb-3">📚 Learning Modules</h2>
          <p className="text-lg opacity-90">
            Expand your knowledge about sustainability and earn Eco-Points!
          </p>
          <div className="mt-4 flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-lg">
              <span className="font-semibold">
                {completedModules.length} / {learningModules.length} Completed
              </span>
            </div>
            
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {learningModules.length > 0 ? (
          learningModules.map((module) => {
            const isModuleCompleted = completedModules.includes(module._id.toString());
            const videoId = extractYouTubeId(module.videoUrl);

            return (
              <div
                key={module._id}
                className={`bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden ${
                  isModuleCompleted ? "ring-2 ring-green-400" : ""
                }`}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                    alt={module.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    {isModuleCompleted ? (
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        ✅ Completed
                      </span>
                    ) : (
                      <span className="bg-white/90 text-blue-600 px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        🎓 New
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="font-bold text-xl mb-3 text-gray-800">
                    {module.title}
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    {module.description}
                  </p>
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-semibold">
                      📹 Video
                    </span>
                    <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-semibold">
                      +{module.ecoPoint} Points
                    </span>
                  </div>
                  <button
                    onClick={() => handleStartLearning(module)}
                    className={`w-full font-semibold py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg ${
                      isModuleCompleted
                        ? "bg-green-100 text-green-700 border-2 border-green-300"
                        : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transform hover:-translate-y-0.5"
                    }`}
                  >
                    {isModuleCompleted ? "✓ Completed" : "▶ Start Learning"}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-20 text-gray-500">
            📚 Loading modules...
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningContent;
