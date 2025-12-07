import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { saveAs } from 'file-saver';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

const STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

const STATUS_CONFIG = {
  pending: {
    label: "PENDING REVIEW",
    color: "text-yellow-700",
    bg: "bg-yellow-100",
    border: "border-yellow-300",
    icon: "⏳"
  },
  approved: {
    label: "APPROVED",
    color: "text-emerald-700",
    bg: "bg-emerald-100",
    border: "border-emerald-300",
    icon: "✅"
  },
  rejected: {
    label: "REJECTED",
    color: "text-red-700",
    bg: "bg-red-100",
    border: "border-red-300",
    icon: "❌"
  }
};

const FacultySubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingIds, setProcessingIds] = useState(new Set());
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [feedback, setFeedback] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    cloudinaryCount: 0
  });

  const CLOUDINARY_CLOUD_NAME = "your-cloud-name"; // Replace with your Cloudinary cloud name

  const getToken = () => {
    return localStorage.getItem('token');
  };

  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getToken();

      if (!token) {
        setError("Please login to view submissions");
        setLoading(false);
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      const res = await axios.get(`${API_BASE_URL}/api/submissions`, config);

      const submissionsData = res.data.submissions || res.data;
      setSubmissions(submissionsData || []);

      // Calculate stats
      const statsData = {
        total: submissionsData.length,
        pending: submissionsData.filter(s => s.status === STATUS.PENDING).length,
        approved: submissionsData.filter(s => s.status === STATUS.APPROVED).length,
        rejected: submissionsData.filter(s => s.status === STATUS.REJECTED).length,
        cloudinaryCount: submissionsData.filter(s => s.cloudinaryUrl).length
      };
      setStats(statsData);

    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to fetch submissions";
      setError(errorMessage);
      console.error("Error fetching submissions:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleApprove = async (id) => {
    try {
      setProcessingIds(prev => new Set(prev).add(id));

      const token = getToken();
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      const res = await axios.patch(
        `${API_BASE_URL}/api/submissions/${id}/approve`,
        {
          feedback: feedback[id]?.trim() || "Good job! Submission approved."
        },
        config
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
    const feedbackText = feedback[id]?.trim();
    if (!feedbackText) {
      alert("Please provide feedback before rejecting the submission.");
      return;
    }

    try {
      setProcessingIds(prev => new Set(prev).add(id));

      const token = getToken();
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      const res = await axios.patch(
        `${API_BASE_URL}/api/submissions/${id}/reject`,
        {
          feedback: feedbackText
        },
        config
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

  const getOptimizedImageUrl = (submission) => {
    // Priority 1: Check for local image URL provided by backend
    if (submission.imageUrl) {
      return submission.imageUrl.startsWith("http") ? submission.imageUrl : `${API_BASE_URL}${submission.imageUrl}`;
    }

    // Priority 2: Check for Cloudinary URL
    if (submission.cloudinaryUrl) {
      const cloudinaryUrl = submission.cloudinaryUrl;
      // Use efficient transformation if possible
      if (cloudinaryUrl.includes('/upload/')) {
        const parts = cloudinaryUrl.split('/upload/');
        return `${parts[0]}/upload/w_1200,h_800,c_fill,q_auto,f_auto/${parts[1]}`;
      }
      return cloudinaryUrl;
    }

    // Use placeholder or broken image
    return "https://via.placeholder.com/600x400?text=No+Proof+Image";
  };

  const getThumbnailUrl = (submission) => {
    // Priority 1: Check for local image URL
    if (submission.imageUrl) {
      return submission.imageUrl.startsWith("http") ? submission.imageUrl : `${API_BASE_URL}${submission.imageUrl}`;
    }

    if (submission.thumbnailUrl) {
      return submission.thumbnailUrl;
    }

    if (submission.cloudinaryUrl) {
      const cloudinaryUrl = submission.cloudinaryUrl;
      if (cloudinaryUrl.includes('/upload/')) {
        const parts = cloudinaryUrl.split('/upload/');
        return `${parts[0]}/upload/w_300,h_200,c_fill/${parts[1]}`;
      }
      return cloudinaryUrl;
    }

    return "https://via.placeholder.com/300x200?text=Proof";
  };

  const handleViewProof = async (submission) => {
    const imageUrl = getOptimizedImageUrl(submission);

    // Open image in modal
    setSelectedImage({
      url: imageUrl,
      submission: submission
    });
  };

  const handleDownloadImage = async (submission) => {
    try {
      const imageUrl = getOptimizedImageUrl(submission);
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      const fileName = `submission_${submission.studentId?.name || 'student'}_${submission._id}.${submission.imageFormat || 'jpg'}`;
      saveAs(blob, fileName);

      alert(`✅ Image downloaded as ${fileName}`);
    } catch (error) {
      console.error("Download error:", error);
      alert("❌ Failed to download image");
    }
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  const filteredSubmissions = submissions.filter(sub => {
    const matchesFilter = filter === 'all' || sub.status === filter;

    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      sub.studentId?.name?.toLowerCase().includes(searchLower) ||
      sub.challengeId?.title?.toLowerCase().includes(searchLower) ||
      sub.studentId?.email?.toLowerCase().includes(searchLower) ||
      sub.studentId?.rollNumber?.toLowerCase().includes(searchLower) ||
      sub.challengeTitle?.toLowerCase().includes(searchLower) ||
      sub.studentName?.toLowerCase().includes(searchLower);

    return matchesFilter && matchesSearch;
  });

  const formatFileSize = (bytes) => {
    if (!bytes) return "Unknown";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleExportCSV = () => {
    const csvHeaders = [
      "Student Name",
      "Student Email",
      "Roll Number",
      "Challenge Title",
      "Points",
      "Status",
      "Submitted At",
      "Reviewed At",
      "Feedback",
      "Cloudinary URL"
    ];

    const csvRows = submissions.map(sub => [
      sub.studentId?.name || sub.studentName || "N/A",
      sub.studentId?.email || sub.studentEmail || "N/A",
      sub.studentId?.rollNumber || "N/A",
      sub.challengeId?.title || sub.challengeTitle || "N/A",
      sub.points || "0",
      sub.status || "pending",
      formatDate(sub.uploadedAt),
      formatDate(sub.reviewedAt),
      sub.feedback || "",
      sub.cloudinaryUrl || ""
    ]);

    const csvContent = [
      csvHeaders.join(","),
      ...csvRows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `submissions_${new Date().toISOString().split('T')[0]}.csv`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full animate-ping"></div>
            </div>
          </div>
          <div>
            <p className="text-gray-600 font-medium">Loading submissions</p>
            <p className="text-gray-400 text-sm">Fetching from Cloudinary...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Submissions</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchSubmissions}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📋 Student Submissions</h1>
          <p className="text-gray-600 mt-1">
            Review and manage student challenge submissions
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors font-medium flex items-center gap-2"
            title="Export all submissions to CSV"
          >
            📥 Export CSV
          </button>
          <button
            onClick={fetchSubmissions}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Submissions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">📄</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Review</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">⏳</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Approved</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.approved}</p>
            </div>
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">❌</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Cloudinary Storage</p>
              <p className="text-2xl font-bold text-indigo-600">{stats.cloudinaryCount}</p>
            </div>
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4 4 0 003 15z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by student name, email, roll number, or challenge..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="all">📋 All Submissions</option>
              <option value="pending">⏳ Pending Review</option>
              <option value="approved">✅ Approved</option>
              <option value="rejected">❌ Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Submissions List */}
      {filteredSubmissions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📝</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {submissions.length === 0 ? "No submissions yet" : "No matching submissions"}
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {submissions.length === 0
              ? "Students haven't submitted any work for review yet."
              : "Try adjusting your search or filter criteria."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSubmissions.map((sub) => {
            const statusConfig = STATUS_CONFIG[sub.status] || STATUS_CONFIG.pending;
            const isProcessing = processingIds.has(sub._id);
            const thumbnailUrl = getThumbnailUrl(sub);

            return (
              <div
                key={sub._id}
                className={`bg-white rounded-xl border-2 ${statusConfig.border} shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden`}
              >
                <div className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-5">
                    {/* Left Column - Submission Info */}
                    <div className="flex-1 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {sub.challengeId?.title || sub.challengeTitle || "Untitled Challenge"}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.color} ${statusConfig.bg}`}>
                              {statusConfig.icon} {statusConfig.label}
                            </span>
                            {sub.cloudinaryUrl && (
                              <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium flex items-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                Cloudinary
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-emerald-600">
                            +{sub.points || sub.challengeId?.points || 0}
                          </div>
                          <div className="text-sm text-gray-500">Points</div>
                        </div>
                      </div>

                      {/* Student Info */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <span className="text-blue-600">👤</span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {sub.studentId?.name || sub.studentName || "Unknown Student"}
                              </div>
                              <div className="text-xs text-gray-500">Student</div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                              <span className="text-green-600">✉️</span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {sub.studentId?.email || sub.studentEmail || "No email"}
                              </div>
                              <div className="text-xs text-gray-500">Email</div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                              <span className="text-purple-600">#️⃣</span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {sub.studentId?.rollNumber || "N/A"}
                              </div>
                              <div className="text-xs text-gray-500">Roll Number</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">📅</span>
                          <span>Submitted: {formatDate(sub.uploadedAt)}</span>
                        </div>
                        {sub.reviewedAt && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">👁️</span>
                            <span>Reviewed: {formatDate(sub.reviewedAt)}</span>
                          </div>
                        )}
                      </div>

                      {/* Feedback */}
                      {sub.feedback && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-sm font-medium text-gray-700 mb-1">Faculty Feedback:</div>
                          <div className="text-gray-600 text-sm">{sub.feedback}</div>
                        </div>
                      )}

                      {/* Feedback Input for Pending */}
                      {sub.status === STATUS.PENDING && (
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            📝 Review Feedback (Required for rejection):
                          </label>
                          <textarea
                            value={feedback[sub._id] || ""}
                            onChange={(e) => handleFeedbackChange(sub._id, e.target.value)}
                            placeholder="Provide constructive feedback for the student..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm min-h-[80px]"
                            rows="3"
                          />
                        </div>
                      )}
                    </div>

                    {/* Right Column - Actions & Thumbnail */}
                    <div className="lg:w-80 space-y-4">
                      {/* Image Thumbnail */}
                      <div
                        className="relative rounded-lg overflow-hidden cursor-pointer group"
                        onClick={() => handleViewProof(sub)}
                      >
                        <img
                          src={thumbnailUrl}
                          alt={`Proof by ${sub.studentName}`}
                          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='14' fill='%239ca3af' text-anchor='middle' dy='.3em'%3EImage not available%3C/text%3E%3C/svg%3E";
                          }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                          <div className="bg-white bg-opacity-90 rounded-full p-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                            <span className="text-lg">👁️</span>
                          </div>
                        </div>
                        {sub.cloudinaryUrl && (
                          <div className="absolute top-2 right-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded-full">
                            ☁️
                          </div>
                        )}
                      </div>

                      {/* Image Info */}
                      <div className="text-sm text-gray-600 space-y-1">
                        {sub.imageFormat && (
                          <div className="flex justify-between">
                            <span>Format:</span>
                            <span className="font-medium">{sub.imageFormat.toUpperCase()}</span>
                          </div>
                        )}
                        {sub.imageSize && (
                          <div className="flex justify-between">
                            <span>Size:</span>
                            <span className="font-medium">{formatFileSize(sub.imageSize)}</span>
                          </div>
                        )}
                        {sub.imageDimensions && (
                          <div className="flex justify-between">
                            <span>Dimensions:</span>
                            <span className="font-medium">
                              {sub.imageDimensions.width} × {sub.imageDimensions.height}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-3">
                        <button
                          onClick={() => handleViewProof(sub)}
                          className="w-full px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View Full Proof
                        </button>

                        <button
                          onClick={() => handleDownloadImage(sub)}
                          className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download Image
                        </button>

                        {sub.status === STATUS.PENDING && (
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={() => handleApprove(sub._id)}
                              disabled={isProcessing}
                              className={`px-4 py-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium flex items-center justify-center gap-2 ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                              {isProcessing ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  Processing...
                                </>
                              ) : (
                                <>
                                  ✅ Approve
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleReject(sub._id)}
                              disabled={isProcessing}
                              className={`px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium flex items-center justify-center gap-2 ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                              {isProcessing ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  Processing...
                                </>
                              ) : (
                                <>
                                  ❌ Reject
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Submission Proof - {selectedImage.submission.studentName}
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedImage.submission.challengeTitle}
                </p>
              </div>
              <button
                onClick={closeImageModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 max-h-[70vh] overflow-auto">
              <img
                src={selectedImage.url}
                alt="Full submission proof"
                className="w-full h-auto rounded-lg shadow-lg"
                onError={(e) => {
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Crect width='800' height='600' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='16' fill='%239ca3af' text-anchor='middle' dy='.3em'%3EImage failed to load%3C/text%3E%3C/svg%3E";
                }}
              />
            </div>

            <div className="p-4 border-t flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {selectedImage.submission.cloudinaryUrl && (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    <span>Stored on Cloudinary</span>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleDownloadImage(selectedImage.submission)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </button>
                <button
                  onClick={closeImageModal}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Info */}
      {submissions.length > 0 && (
        <div className="text-center text-sm text-gray-500 pt-4 border-t">
          <p>Showing {filteredSubmissions.length} of {submissions.length} submissions</p>
          <p className="mt-1">
            {stats.cloudinaryCount} images stored securely on Cloudinary
          </p>
        </div>
      )}
    </div>
  );
};

export default FacultySubmissions;