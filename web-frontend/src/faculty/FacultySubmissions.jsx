import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

const STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

const STATUS_COLORS = {
  pending: { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700" },
  approved: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700" },
  rejected: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700" }
};

const FacultySubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingIds, setProcessingIds] = useState(new Set());
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [feedback, setFeedback] = useState({});

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${API_BASE_URL}/api/submissions`);
      
      const submissionsData = res.data.submissions || res.data;
      setSubmissions(submissionsData || []);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to fetch submissions";
      setError(errorMessage);
      console.error("Error fetching submissions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  // Run migration to fix users
  const runMigration = async () => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/submissions/migrate-users`);
      alert(`✅ ${res.data.message}`);
      fetchSubmissions();
    } catch (err) {
      alert("❌ Migration failed: " + (err.response?.data?.message || err.message));
    }
  };

  const handleApprove = async (id) => {
    try {
      setProcessingIds(prev => new Set(prev).add(id));

      const res = await axios.patch(
        `${API_BASE_URL}/api/submissions/${id}/approve`,
        { 
          feedback: feedback[id] || "Good job! Submission approved." 
        }
      );

      if (res.data.success) {
        setSubmissions(prev =>
          prev.map(s => (s._id === id ? { ...s, ...res.data.submission } : s))
        );

        setFeedback(prev => {
          const newFeedback = { ...prev };
          delete newFeedback[id];
          return newFeedback;
        });

        alert(`✅ ${res.data.message}`);
      }
    } catch (err) {
      console.error("Error approving submission:", err);
      const errorMessage = err.response?.data?.message || "Failed to approve submission.";
      alert(`❌ ${errorMessage}`);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleReject = async (id) => {
    if (!feedback[id] || feedback[id].trim() === "") {
      alert("Please provide feedback before rejecting the submission.");
      return;
    }

    try {
      setProcessingIds(prev => new Set(prev).add(id));

      const res = await axios.patch(
        `${API_BASE_URL}/api/submissions/${id}/reject`,
        { 
          feedback: feedback[id] 
        }
      );

      if (res.data.success) {
        setSubmissions(prev =>
          prev.map(s => (s._id === id ? { ...s, ...res.data.submission } : s))
        );

        setFeedback(prev => {
          const newFeedback = { ...prev };
          delete newFeedback[id];
          return newFeedback;
        });

        alert(`✅ ${res.data.message}`);
      }
    } catch (err) {
      console.error("Error rejecting submission:", err);
      const errorMessage = err.response?.data?.message || "Failed to reject submission.";
      alert(`❌ ${errorMessage}`);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleFeedbackChange = (id, value) => {
    setFeedback(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const getFileUrl = (submission) => {
    if (submission.fileUrl) return submission.fileUrl;
    if (submission.filePath) {
      let cleanPath = submission.filePath.replace(/\\/g, "/");
      cleanPath = cleanPath.replace(/^\/?uploads\//, "uploads/");
      return `${API_BASE_URL}/${cleanPath}`;
    }
    return `${API_BASE_URL}/api/submissions/download/${submission._id}`;
  };

  const handleViewProof = async (submission) => {
    const fileUrl = getFileUrl(submission);
    try {
      const response = await fetch(fileUrl, { method: 'HEAD' });
      if (response.ok) {
        window.open(fileUrl, '_blank');
      } else {
        window.open(`${API_BASE_URL}/api/submissions/download/${submission._id}`, '_blank');
      }
    } catch {
      window.open(`${API_BASE_URL}/api/submissions/download/${submission._id}`, '_blank');
    }
  };

  const filteredSubmissions = submissions.filter(sub => {
    const matchesFilter = filter === 'all' || sub.status === filter;
    const matchesSearch = 
      sub.studentId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.challengeId?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.studentId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.studentId?.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status) => STATUS_COLORS[status] || STATUS_COLORS.pending;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading submissions... ⏳</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-red-600 font-semibold">Error: {error}</p>
          <button 
            onClick={fetchSubmissions}
            className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Student Submissions</h2>
        <div className="flex gap-2">
          <button 
            onClick={runMigration}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors text-sm"
          >
            🔧 Fix Users
          </button>
          <button 
            onClick={fetchSubmissions}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-white rounded-lg shadow-sm border">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by student name, email, roll number, or challenge title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
          <div className="text-2xl font-bold text-blue-600">{submissions.length}</div>
          <div className="text-gray-600">Total Submissions</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {submissions.filter(s => s.status === STATUS.PENDING).length}
          </div>
          <div className="text-gray-600">Pending Review</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
          <div className="text-2xl font-bold text-emerald-600">
            {submissions.filter(s => s.status === STATUS.APPROVED).length}
          </div>
          <div className="text-gray-600">Approved</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
          <div className="text-2xl font-bold text-red-600">
            {submissions.filter(s => s.status === STATUS.REJECTED).length}
          </div>
          <div className="text-gray-600">Rejected</div>
        </div>
      </div>

      {filteredSubmissions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
          <div className="text-gray-400 text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            {submissions.length === 0 ? "No submissions yet." : "No submissions match your filters."}
          </h3>
          <p className="text-gray-500">
            {submissions.length === 0 
              ? "Students haven't submitted any work yet." 
              : "Try adjusting your search or filter criteria."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredSubmissions.map((sub) => {
            const statusColor = getStatusColor(sub.status);
            const isProcessing = processingIds.has(sub._id);
            
            return (
              <div
                key={sub._id}
                className={`p-6 rounded-xl border-2 shadow-sm transition-all hover:shadow-md ${statusColor.bg} ${statusColor.border}`}
              >
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold text-gray-800">
                        {sub.challengeId?.title || "Untitled Challenge"}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColor.text} ${statusColor.bg.replace('50', '100')}`}>
                        {sub.status?.toUpperCase() || "PENDING"}
                      </span>
                    </div>

                    {sub.challengeId?.points && (
                      <p className="text-sm text-gray-600">
                        Points: <span className="font-semibold text-emerald-600">{sub.challengeId.points}</span>
                      </p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div><span className="font-semibold text-gray-700">Student:</span> {sub.studentId?.name || "Unknown"}</div>
                      <div><span className="font-semibold text-gray-700">Email:</span> {sub.studentId?.email || "-"}</div>
                      {sub.studentId?.rollNumber && <div><span className="font-semibold text-gray-700">Roll No:</span> {sub.studentId.rollNumber}</div>}
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div><span className="font-semibold">Submitted:</span> {sub.uploadedAt ? new Date(sub.uploadedAt).toLocaleString() : "Unknown"}</div>
                      {sub.reviewedAt && <div><span className="font-semibold">Reviewed:</span> {new Date(sub.reviewedAt).toLocaleDateString()}</div>}
                    </div>

                    {sub.feedback && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                        <span className="font-semibold text-gray-700">Feedback:</span> <span className="text-gray-600">{sub.feedback}</span>
                      </div>
                    )}

                    {/* Feedback Input for Pending Submissions */}
                    {sub.status === STATUS.PENDING && (
                      <div className="mt-3">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Feedback (Required for rejection):
                        </label>
                        <textarea
                          value={feedback[sub._id] || ""}
                          onChange={(e) => handleFeedbackChange(sub._id, e.target.value)}
                          placeholder="Enter feedback for the student..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          rows="2"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => handleViewProof(sub)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors text-center font-medium"
                    >
                      👁️ View Proof
                    </button>

                    {sub.status === STATUS.PENDING && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(sub._id)}
                          disabled={isProcessing}
                          className={`flex-1 px-4 py-2 bg-emerald-500 text-white rounded-md text-sm hover:bg-emerald-600 transition-colors font-medium ${
                            isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {isProcessing ? '⏳' : '✓'} Approve
                        </button>
                        <button
                          onClick={() => handleReject(sub._id)}
                          disabled={isProcessing}
                          className={`flex-1 px-4 py-2 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 transition-colors font-medium ${
                            isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {isProcessing ? '⏳' : '✗'} Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FacultySubmissions;