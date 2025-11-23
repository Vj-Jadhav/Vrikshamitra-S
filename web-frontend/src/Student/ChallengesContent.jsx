import React, { useState, useEffect } from "react";
import { Trophy, RefreshCw, Upload, CheckCircle, Clock, AlertCircle } from "lucide-react";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

const StudentChallenges = ({ studentId }) => {
  const [challenges, setChallenges] = useState([]);
  const [completedIds, setCompletedIds] = useState([]);
  const [submittedIds, setSubmittedIds] = useState([]);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userEcoPoints, setUserEcoPoints] = useState(0);
  const [debugInfo, setDebugInfo] = useState({});

  // Convert any ID to string for consistent comparison
  const toIdString = (id) => {
    if (!id) return '';
    return id.toString ? id.toString() : String(id);
  };

  const fetchStudentData = async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const storedUser = JSON.parse(localStorage.getItem("user"));
      const finalStudentId = studentId || storedUser?._id;
      
      if (!finalStudentId) {
        console.error("Student ID not found");
        setLoading(false);
        setRefreshing(false);
        return;
      }

      console.log("🔄 Fetching student data for:", finalStudentId);

      // Fetch all data in parallel with cache busting
      const timestamp = Date.now();
      const [challengesRes, studentRes, submissionsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/challenges?t=${timestamp}`),
        axios.get(`${API_BASE_URL}/api/users/${finalStudentId}?t=${timestamp}`),
        axios.get(`${API_BASE_URL}/api/submissions/student/${finalStudentId}?t=${timestamp}`)
      ]);

      const activeChallenges = challengesRes.data.filter((c) => c.status === "Active");
      setChallenges(activeChallenges);

      // Get completed challenges from student data
      const completed = studentRes.data.completedChallenges || [];
      const completedStringIds = completed.map(id => toIdString(id));
      setCompletedIds(completedStringIds);

      // Get ecoPoints from student data
      const points = studentRes.data.ecoPoints || 0;
      setUserEcoPoints(points);

      // Get ALL submissions to properly track status
      const allSubmissions = submissionsRes.data?.submissions || submissionsRes.data || [];
      
      // Get submitted but pending/rejected challenges
      const submitted = allSubmissions
        .filter(sub => sub.status === "pending" || sub.status === "rejected")
        .map(sub => {
          const challengeId = sub.challengeId?._id || sub.challengeId;
          return toIdString(challengeId);
        });

      // Track approved submissions for debugging
      const approved = allSubmissions
        .filter(sub => sub.status === "approved")
        .map(sub => toIdString(sub.challengeId?._id || sub.challengeId));

      console.log("📊 Submission Status:", {
        total: allSubmissions.length,
        pending: submitted.length,
        approved: approved.length,
        completed: completedStringIds.length
      });

      setSubmittedIds(submitted);

      // Update debug info
      setDebugInfo({
        challenges: activeChallenges.length,
        completed: completedStringIds.length,
        submitted: submitted.length,
        approved: approved.length,
        points: points
      });

      // Update localStorage with current data
      localStorage.setItem("completedChallenges", JSON.stringify(completedStringIds));
      localStorage.setItem("submittedChallenges", JSON.stringify(submitted));
      localStorage.setItem("userEcoPoints", points.toString());
      
      console.log("✅ Data loaded - Completed:", completedStringIds.length, 
                  "Submitted:", submitted.length, "Points:", points);
      
    } catch (err) {
      console.error("❌ Error fetching data:", err);
      // Enhanced fallback to localStorage
      try {
        const fallbackCompleted = JSON.parse(localStorage.getItem("completedChallenges")) || [];
        const fallbackSubmitted = JSON.parse(localStorage.getItem("submittedChallenges")) || [];
        const fallbackPoints = localStorage.getItem("userEcoPoints") || 0;
        
        setCompletedIds(fallbackCompleted.map(id => toIdString(id)));
        setSubmittedIds(fallbackSubmitted.map(id => toIdString(id)));
        setUserEcoPoints(Number(fallbackPoints));
        
        setDebugInfo({
          challenges: challenges.length,
          completed: fallbackCompleted.length,
          submitted: fallbackSubmitted.length,
          approved: 0,
          points: fallbackPoints,
          error: "Using cached data"
        });
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
    
    // Auto-refresh every 20 seconds to check for approvals
    const interval = setInterval(() => {
      console.log("🔄 Auto-refreshing student data...");
      fetchStudentData();
    }, 20000);

    return () => clearInterval(interval);
  }, [studentId]);

  const refreshData = () => {
    fetchStudentData(true);
  };

  const forceRefresh = () => {
    // Clear local storage cache
    localStorage.removeItem("completedChallenges");
    localStorage.removeItem("submittedChallenges");
    localStorage.removeItem("userEcoPoints");
    
    // Force refresh from server
    fetchStudentData(true);
    
    setMessage("🔄 Cache cleared, fetching fresh data...");
    setTimeout(() => setMessage(""), 3000);
  };

  const handleAttempt = (challenge) => {
    const challengeId = toIdString(challenge._id);
    
    // Check if already completed
    if (completedIds.includes(challengeId)) {
      setMessage(`✅ You have already completed "${challenge.title}" and earned ${challenge.points} points!`);
      setTimeout(() => setMessage(""), 5000);
      return;
    }

    // Check if already submitted and pending
    if (submittedIds.includes(challengeId)) {
      setMessage(`⏳ You have already submitted "${challenge.title}". Waiting for teacher approval.`);
      setTimeout(() => setMessage(""), 5000);
      return;
    }
    
    setSelectedChallenge(challenge);
    setShowUpload(false);
    setFile(null);
  };

  const handleSubmitProof = async () => {
    if (!file) {
      alert("Please upload a proof file 📎");
      return;
    }

    if (!selectedChallenge || !selectedChallenge._id) {
      alert("Error: Challenge information is missing. Please try again.");
      closeModals();
      return;
    }

    const storedUser = JSON.parse(localStorage.getItem("user"));
    const finalStudentId = studentId || storedUser?._id;
    if (!finalStudentId) {
      alert("Student ID not found ❌");
      return;
    }

    const formData = new FormData();
    formData.append("studentId", finalStudentId);
    formData.append("challengeId", selectedChallenge._id);
    formData.append("file", file);

    setSubmitting(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/submissions`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 201) {
        alert("✅ Proof submitted successfully! Waiting for teacher approval.");
        
        // Add to submitted challenges (pending approval)
        const newSubmitted = [...submittedIds, toIdString(selectedChallenge._id)];
        setSubmittedIds(newSubmitted);
        localStorage.setItem("submittedChallenges", JSON.stringify(newSubmitted));

        closeModals();
        // Refresh data to ensure consistency
        setTimeout(() => fetchStudentData(true), 1000);
      }
    } catch (err) {
      console.error("❌ Error submitting proof:", err);
      if (err.response?.status === 400) {
        alert("📝 You have already submitted this challenge! Waiting for approval.");
        // Refresh to get current status
        fetchStudentData(true);
      } else {
        alert("❌ Upload failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getChallengeStatus = (challengeId) => {
    const id = toIdString(challengeId);
    
    if (completedIds.includes(id)) {
      return "completed";
    } else if (submittedIds.includes(id)) {
      return "submitted";
    } else {
      return "not_started";
    }
  };

  const getStatusBadge = (challenge) => {
    const status = getChallengeStatus(challenge._id);
    
    switch (status) {
      case "completed":
        return (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full font-semibold border border-emerald-300">
            <CheckCircle size={16} />
            <span>Completed</span>
          </div>
        );
      case "submitted":
        return (
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-semibold border border-blue-300">
            <Clock size={16} />
            <span>Under Review</span>
          </div>
        );
      default:
        return (
          <button
            onClick={() => handleAttempt(challenge)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors font-semibold"
          >
            <Upload size={16} />
            <span>Attempt Challenge</span>
          </button>
        );
    }
  };

  const closeModals = () => {
    setSelectedChallenge(null);
    setShowUpload(false);
    setFile(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading challenges... ⏳</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      {/* Header with Points */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Trophy className="text-emerald-600" size={28} />
            Eco-Challenges
          </h2>
          
        </div>
        <div className="flex gap-2">
          <button 
            onClick={refreshData}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 font-medium"
          >
            <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
          <button 
            onClick={forceRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 font-medium"
          >
            <AlertCircle size={18} />
            Force Refresh
          </button>
        </div>
      </div>

      {/* Success Message */}
      {completedIds.length > 0 && (
        <div className="p-4 rounded-lg bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200">
          <div className="flex items-center justify-center gap-3">
            <div className="bg-emerald-100 p-2 rounded-full">
              <Trophy className="text-emerald-600" size={20} />
            </div>
            <div className="text-center">
              <p className="text-emerald-700 font-semibold">
                🎉 Great job! You've completed {completedIds.length} challenge{completedIds.length !== 1 ? 's' : ''}
              </p>
              <p className="text-emerald-600 text-sm mt-1">
                Total points earned: <span className="font-bold">{userEcoPoints} 🌟</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {message && (
        <div className="p-4 text-center rounded-lg bg-emerald-100 text-emerald-700 font-medium border border-emerald-200">
          {message}
        </div>
      )}

      {/* Status Legend */}
      <div className="flex flex-wrap gap-4 justify-center text-sm bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex items-center gap-2 bg-emerald-50 px-3 py-2 rounded-lg">
          <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
          <span className="text-emerald-700 font-medium">Completed ({completedIds.length})</span>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-blue-700 font-medium">Submitted ({submittedIds.length})</span>
        </div>
        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
          <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
          <span className="text-gray-700 font-medium">Available ({challenges.length - completedIds.length - submittedIds.length})</span>
        </div>
      </div>

     

      {/* Challenges Grid */}
      <div className="grid gap-6">
        {challenges.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200">
            <div className="text-gray-300 text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold text-gray-500 mb-2">No Active Challenges Available</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Check back later for new eco-challenges! New challenges are added regularly to help you earn more points.
            </p>
          </div>
        ) : (
          challenges.map((challenge) => {
            const status = getChallengeStatus(challenge._id);
            const isCompleted = status === "completed";
            const isSubmitted = status === "submitted";
            const canAttempt = status === "not_started";
            
            return (
              <div
                key={challenge._id}
                className={`rounded-2xl p-6 border-2 shadow-lg transition-all duration-300 hover:shadow-xl ${
                  isCompleted 
                    ? "bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200" 
                    : isSubmitted 
                    ? "bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">
                          {challenge.title}
                          {isCompleted && " 🎉"}
                          {isSubmitted && " ⏳"}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                          {challenge.description}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <span className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-full text-sm font-bold shadow-sm">
                          🌟 {challenge.points} points
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 mb-4">
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-semibold ${
                          challenge.difficulty === "Easy"
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : challenge.difficulty === "Medium"
                            ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                            : "bg-red-100 text-red-700 border border-red-200"
                        }`}
                      >
                        {challenge.difficulty}
                      </span>
                      <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold border border-gray-200">
                        ⏱️ {challenge.duration}
                      </span>
                      {challenge.category && (
                        <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold border border-purple-200">
                          {challenge.category}
                        </span>
                      )}
                    </div>
                    
                    {/* Status Message */}
                    {isCompleted && (
                      <div className="p-4 bg-emerald-100 border border-emerald-200 rounded-xl">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="text-emerald-600 flex-shrink-0" size={20} />
                          <div>
                            <p className="text-emerald-700 font-semibold">
                              Challenge completed! You earned {challenge.points} points.
                            </p>
                            <p className="text-emerald-600 text-sm mt-1">
                              Great work! Your submission was approved by the teacher.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    {isSubmitted && (
                      <div className="p-4 bg-blue-100 border border-blue-200 rounded-xl">
                        <div className="flex items-center gap-3">
                          <Clock className="text-blue-600 flex-shrink-0" size={20} />
                          <div>
                            <p className="text-blue-700 font-semibold">
                              Submission under review
                            </p>
                            <p className="text-blue-600 text-sm mt-1">
                              Waiting for teacher approval. You'll receive {challenge.points} points upon approval.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    {canAttempt && (
                      <div className="p-4 bg-gray-100 border border-gray-200 rounded-xl">
                        <div className="flex items-center gap-3">
                          <Upload className="text-gray-600 flex-shrink-0" size={20} />
                          <div>
                            <p className="text-gray-700 font-semibold">
                              Ready to attempt!
                            </p>
                            <p className="text-gray-600 text-sm mt-1">
                              Click "Attempt Challenge" to submit your proof and earn {challenge.points} points.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="lg:text-right flex-shrink-0">
                    {getStatusBadge(challenge)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Description Modal */}
      {selectedChallenge && !showUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-bold text-2xl text-gray-800">{selectedChallenge.title}</h3>
            </div>
            
            <div className="p-6">
              <p className="text-gray-600 mb-6 leading-relaxed">{selectedChallenge.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="font-semibold text-gray-700 text-sm mb-1">Points Reward</div>
                  <div className="text-emerald-600 font-bold text-lg">🌟 {selectedChallenge.points}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="font-semibold text-gray-700 text-sm mb-1">Difficulty</div>
                  <div className={
                    selectedChallenge.difficulty === "Easy" ? "text-green-600 font-semibold" :
                    selectedChallenge.difficulty === "Medium" ? "text-yellow-600 font-semibold" : "text-red-600 font-semibold"
                  }>
                    {selectedChallenge.difficulty}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="font-semibold text-gray-700 text-sm mb-1">Duration</div>
                  <div className="text-gray-600 font-semibold">{selectedChallenge.duration}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="font-semibold text-gray-700 text-sm mb-1">Category</div>
                  <div className="text-gray-600 font-semibold">{selectedChallenge.category || "General"}</div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowUpload(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 font-semibold transition-colors shadow-sm"
                >
                  <Upload size={18} />
                  Upload Proof
                </button>
                <button
                  onClick={closeModals}
                  className="px-6 py-3 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {selectedChallenge && showUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-bold text-xl text-gray-800">
                Upload Proof for: {selectedChallenge.title}
              </h3>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Upload PDF Proof *
                </label>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full border-2 border-dashed border-gray-300 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Only PDF files are accepted. Maximum file size: 10MB
                </p>
                
                {file && (
                  <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="bg-emerald-100 p-2 rounded-full">
                        <CheckCircle className="text-emerald-600" size={16} />
                      </div>
                      <div>
                        <p className="text-emerald-700 font-medium">
                          {file.name}
                        </p>
                        <p className="text-emerald-600 text-sm">
                          Size: {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <div className="flex justify-center gap-3">
                <button
                  onClick={handleSubmitProof}
                  disabled={!file || submitting}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-colors ${
                    file && !submitting
                      ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm" 
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      Submit Proof
                    </>
                  )}
                </button>

                <button
                  onClick={() => setShowUpload(false)}
                  disabled={submitting}
                  className="px-6 py-3 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 disabled:opacity-50 font-semibold transition-colors"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentChallenges;