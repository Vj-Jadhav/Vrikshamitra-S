import React, { useState, useEffect } from 'react';
import { Trophy, Plus, Edit, Trash2, X, Users } from 'lucide-react';
import axios from 'axios';

const ManageChallenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    difficulty: 'Easy',
    duration: '',
    points: 0,
    status: 'Active',
    ageGroup: 'All Ages'
  });

  // Age group options
  const ageGroups = [
    'All Ages',
    'Kids (5-12)',
    'Teens (13-17)',
    'Adults (18-64)',
    'Seniors (65+)'
  ];

  // Get token helper
  const getToken = () => {
    // Check for direct token (from Login.jsx)
    const token = localStorage.getItem('token');
    if (token) return token;

    // Fallback for other contexts if needed
    const facultyInfo = localStorage.getItem('facultyInfo');
    return facultyInfo ? JSON.parse(facultyInfo).token : null;
  };

  const API_BASE_URL = "http://localhost:5000"; // Should potentially come from config/env

  // Fetch challenges on load
  const fetchChallenges = async () => {
    setLoading(true);
    setError('');
    try {
      const token = getToken();
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      const res = await axios.get(`${API_BASE_URL}/api/challenges`, config);
      setChallenges(res.data);
    } catch (err) {
      console.error('Fetch error:', err);
      // Handle 401 specifically?
      if (err.response?.status === 401) {
        setError('Unauthorized. Please login again.');
      } else {
        setError('Failed to load challenges. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  // Handle form input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Create or Edit challenge
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (editingChallenge) {
        await axios.put(`http://localhost:5000/api/challenges/${editingChallenge._id}`, form);
      } else {
        await axios.post('http://localhost:5000/api/challenges', form);
      }
      setShowModal(false);
      setForm({
        title: '',
        description: '',
        difficulty: 'Easy',
        duration: '',
        points: 0,
        status: 'Active',
        ageGroup: 'All Ages'
      });
      setEditingChallenge(null);
      fetchChallenges();
    } catch (err) {
      console.error('Submit error:', err);
      setError(`Failed to ${editingChallenge ? 'update' : 'create'} challenge: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Delete challenge with enhanced error handling
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this challenge?')) {
      return;
    }

    setDeletingId(id);
    setError('');

    try {
      const response = await axios.delete(`http://localhost:5000/api/challenges/${id}`);

      if (response.status === 200) {
        // Success - remove from local state immediately for better UX
        setChallenges(prev => prev.filter(challenge => challenge._id !== id));
        // Optional: Show success message
        console.log('Challenge deleted successfully');
      }
    } catch (err) {
      console.error('Delete error details:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });

      let errorMessage = 'Failed to delete challenge. ';

      if (err.response?.status === 404) {
        errorMessage += 'Challenge not found.';
      } else if (err.response?.status === 500) {
        errorMessage += 'Server error. Please try again.';
      } else if (err.code === 'NETWORK_ERROR' || err.message === 'Network Error') {
        errorMessage += 'Network error. Please check your connection and server.';
      } else {
        errorMessage += err.response?.data?.message || err.message;
      }

      setError(errorMessage);
      // Refresh the list to ensure consistency
      fetchChallenges();
    } finally {
      setDeletingId(null);
    }
  };

  // Alternative delete using fetch (uncomment if axios continues to have issues)
  /*
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this challenge?')) {
      return;
    }

    setDeletingId(id);
    setError('');

    try {
      const response = await fetch(`http://localhost:5000/api/challenges/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Delete successful:', result);
      // Remove from local state immediately
      setChallenges(prev => prev.filter(challenge => challenge._id !== id));
      
    } catch (err) {
      console.error('Delete failed:', err);
      setError('Delete failed: ' + err.message);
      // Refresh the list to ensure consistency
      fetchChallenges();
    } finally {
      setDeletingId(null);
    }
  };
  */

  // Open edit modal
  const handleEdit = (challenge) => {
    setEditingChallenge(challenge);
    setForm({
      title: challenge.title,
      description: challenge.description,
      difficulty: challenge.difficulty,
      duration: challenge.duration,
      points: challenge.points,
      status: challenge.status,
      ageGroup: challenge.ageGroup || 'All Ages'
    });
    setShowModal(true);
  };

  // Close modal and reset form
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingChallenge(null);
    setForm({
      title: '',
      description: '',
      difficulty: 'Easy',
      duration: '',
      points: 0,
      status: 'Active',
      ageGroup: 'All Ages'
    });
    setError('');
  };

  // Filter challenges by age group
  const [selectedAgeFilter, setSelectedAgeFilter] = useState('All Ages');

  const filteredChallenges = selectedAgeFilter === 'All Ages'
    ? challenges
    : challenges.filter(challenge => challenge.ageGroup === selectedAgeFilter);

  return (
    <div className="space-y-6 p-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Trophy className="text-emerald-600" size={28} />
          Manage Eco-Challenges
        </h2>
        <button
          onClick={() => setShowModal(true)}
          disabled={loading}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={20} />
          Create Challenge
        </button>
      </div>

      {/* Age Group Filter */}
      <div className="bg-white rounded-2xl p-4 border border-emerald-100">
        <div className="flex items-center gap-3 mb-3">
          <Users className="text-emerald-600" size={20} />
          <h3 className="font-semibold text-gray-800">Filter by Age Group</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {ageGroups.map((ageGroup) => (
            <button
              key={ageGroup}
              onClick={() => setSelectedAgeFilter(ageGroup)}
              disabled={loading}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedAgeFilter === ageGroup
                ? 'bg-emerald-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {ageGroup}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && !deletingId && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading challenges...</p>
        </div>
      )}

      {/* Challenges List */}
      {!loading && (
        <div className="grid gap-4">
          {filteredChallenges.map((challenge) => (
            <div key={challenge._id} className="bg-white rounded-2xl p-6 border-2 border-emerald-100 shadow-lg hover:shadow-xl transition-all">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-800">{challenge.title}</h3>
                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium flex items-center gap-1">
                      <Users size={14} />
                      {challenge.ageGroup}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{challenge.description}</p>
                  <div className="flex gap-4 text-sm flex-wrap">
                    <span className={`px-3 py-1 rounded-full ${challenge.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                      challenge.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                      {challenge.difficulty}
                    </span>
                    <span className="text-gray-600">⏱️ {challenge.duration}</span>
                    <span className="text-emerald-600 font-semibold">🌟 {challenge.points} points</span>
                    <span className={`px-3 py-1 rounded-full ${challenge.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                      {challenge.status}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(challenge)}
                    disabled={loading}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(challenge._id)}
                    disabled={deletingId === challenge._id || loading}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingId === challenge._id ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                    ) : (
                      <Trash2 size={20} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredChallenges.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-emerald-100">
          <Trophy className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No challenges found</h3>
          <p className="text-gray-500 mb-4">
            {selectedAgeFilter === 'All Ages'
              ? "No challenges created yet. Create your first challenge!"
              : `No challenges available for ${selectedAgeFilter}. Try creating one!`
            }
          </p>
          <button
            onClick={() => setShowModal(true)}
            disabled={loading}
            className="bg-emerald-500 text-white px-6 py-2 rounded-xl hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Challenge
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={handleCloseModal}
              disabled={loading}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-200 disabled:opacity-50"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold mb-4">{editingChallenge ? 'Edit Challenge' : 'Create Challenge'}</h3>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  placeholder="Challenge Title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  placeholder="Challenge Description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  rows="3"
                  disabled={loading}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                  <select
                    name="difficulty"
                    value={form.difficulty}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50"
                  >
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age Group</label>
                  <select
                    name="ageGroup"
                    value={form.ageGroup}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50"
                  >
                    {ageGroups.map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                  <input
                    type="text"
                    name="duration"
                    placeholder="e.g., 1 week"
                    value={form.duration}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
                  <input
                    type="number"
                    name="points"
                    placeholder="Points"
                    value={form.points}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50"
                >
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={loading}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-emerald-500 text-white px-6 py-3 rounded-xl hover:bg-emerald-600 transition-all disabled:opacity-50 font-semibold flex items-center justify-center gap-2"
                >
                  {loading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  {editingChallenge ? 'Update Challenge' : 'Create Challenge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageChallenges;