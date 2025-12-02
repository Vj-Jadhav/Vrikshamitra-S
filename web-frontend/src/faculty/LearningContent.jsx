import { useEffect, useState, useRef } from "react";
import axios from "axios";

const LearningContent = ({ userProfile, updateecoPoint }) => {
  const [learningModules, setLearningModules] = useState([]);
  const [activeModule, setActiveModule] = useState(null);
  const [editingModule, setEditingModule] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoUrl: "",
    ecoPoint: "",
  });

  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completedModules, setCompletedModules] = useState([]);
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const playerRef = useRef(null);
  const intervalRef = useRef(null);

  const fetchModules = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/modules/all");
      setLearningModules(data);
    } catch (err) {
      console.error("Error fetching modules:", err);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

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
      stopProgressTracking();
      if (playerRef.current?.destroy) playerRef.current.destroy();
    };
  }, [activeModule]);

  const onPlayerReady = (event) => {
    setVideoDuration(event.target.getDuration());
  };

  const onPlayerStateChange = (event) => {
    if (event.data === 1) startProgressTracking();
    else stopProgressTracking();
  };

  const startProgressTracking = () => {
    stopProgressTracking();
    intervalRef.current = setInterval(() => {
      if (playerRef.current?.getCurrentTime) {
        const current = playerRef.current.getCurrentTime();
        const duration = playerRef.current.getDuration();
        setCurrentTime(current);
        if (duration > 0) {
          const progressPercentage = (current / duration) * 100;
          setProgress(progressPercentage);
          if (progressPercentage >= 97 && !isCompleted) {
            setIsCompleted(true);
            stopProgressTracking();
          }
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

  const handleCollectPoints = () => {
    if (updateecoPoint && activeModule) {
      updateecoPoint(activeModule.ecoPoint);
      setCompletedModules((prev) => [...prev, activeModule._id]);
      alert(`🎉 You earned ${activeModule.ecoPoint} Eco-Points!`);
      handleCloseModule();
    }
  };

  const handleCloseModule = () => {
    stopProgressTracking();
    if (playerRef.current?.destroy) playerRef.current.destroy();
    setActiveModule(null);
    setProgress(0);
    setIsCompleted(false);
  };

  const handleDeleteModule = async (id) => {
    if (!window.confirm("Are you sure you want to delete this module?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/modules/${id}`);
      await fetchModules();
      alert("🗑️ Module deleted successfully!");
    } catch (err) {
      console.error("Error deleting module:", err);
      alert("Failed to delete module.");
    }
  };

  const handleEditModule = (module) => {
    setEditingModule(module);
    setFormData({
      title: module.title,
      description: module.description,
      videoUrl: module.videoUrl,
      ecoPoint: module.ecoPoint,
    });
  };

  const handleUpdateModule = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:5000/api/modules/${editingModule._id}`,
        formData
      );
      await fetchModules();
      alert("✅ Module updated successfully!");
      setEditingModule(null);
    } catch (err) {
      console.error("Error updating module:", err);
      alert("Failed to update module.");
    }
  };

  const extractYouTubeId = (url) => {
    if (!url) return "";
    const patterns = [
      /youtu\.be\/([^\?&]+)/,
      /[?&]v=([^&]+)/,
      /\/embed\/([^\?&]+)/,
    ];
    for (const p of patterns) {
      const match = url.match(p);
      if (match) return match[1];
    }
    const parts = url.split("/");
    return parts[parts.length - 1].split("?")[0];
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // ✅ Edit Form
  if (editingModule) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-100 p-6">
        <form
          onSubmit={handleUpdateModule}
          className="bg-white p-8 rounded-xl shadow-lg max-w-lg w-full"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">✏️ Edit Module</h2>

          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Title"
            className="w-full border p-3 rounded mb-4"
          />

          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Description"
            className="w-full border p-3 rounded mb-4"
          />

          <input
            type="text"
            value={formData.videoUrl}
            onChange={(e) =>
              setFormData({ ...formData, videoUrl: e.target.value })
            }
            placeholder="Video URL"
            className="w-full border p-3 rounded mb-4"
          />

          <input
            type="number"
            value={formData.ecoPoint}
            onChange={(e) =>
              setFormData({ ...formData, ecoPoint: e.target.value })
            }
            placeholder="Eco Points"
            className="w-full border p-3 rounded mb-4"
          />

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setEditingModule(null)}
              className="bg-gray-400 text-white px-5 py-2 rounded hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ✅ Main Grid with improved cards
  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">📚 Learning Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {learningModules.map((module, index) => (
            <div
              key={module._id}
              className={`relative bg-white p-6 rounded-2xl shadow-md hover:shadow-2xl transition-all transform hover:-translate-y-1 border border-gray-100`}
            >
              <h3 className="font-bold text-xl mb-2 text-gray-900">
                {module.title}
              </h3>
              <p className="text-gray-600 mb-4 line-clamp-3">
                {module.description}
              </p>

              <p className="text-blue-500 font-semibold mb-2">
                🎯 {module.ecoPoint} Eco Points
              </p>

              {/* Student Progress Info */}
              {completedModules.includes(module._id) ? (
                <p className="text-green-600 font-semibold mb-3">
                  ✅ Completed Module {completedModules.length}
                </p>
              ) : (
                <p className="text-gray-400 italic mb-3">Not completed yet</p>
              )}

              {/* Faculty-only Actions */}
              {userProfile?.role === "faculty" && (
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => handleEditModule(module)}
                    className="bg-yellow-400 text-white px-3 py-1 rounded-md hover:bg-yellow-500 transition"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDeleteModule(module._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition"
                  >
                    🗑️ Delete
                  </button>
                </div>
              )}

              <button
                onClick={() => handleStartLearning(module)}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white w-full py-2 rounded-md shadow hover:from-green-600 hover:to-green-700 transition-all duration-200"
              >
                ▶ Start Learning
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LearningContent;
