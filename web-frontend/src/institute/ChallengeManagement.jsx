// src/institute/ChallengeManagement.jsx - UPDATED
import React, { useState, useEffect } from 'react';
import { Search, Filter, Target, CheckCircle, Clock, AlertCircle, Users, Calendar, FileText, Plus, BookOpen } from 'lucide-react';
import { API,getChallenges } from "../utils/api";


const ChallengeManagement = ({ instituteId, instituteData }) => {
  const [challenges, setChallenges] = useState([]);
  const [governmentChallenges, setGovernmentChallenges] = useState([]); // NEW
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false); // NEW
  const [submissionData, setSubmissionData] = useState({
    description: '',
    documents: [],
    photos: []
  });
  const [newChallengeData, setNewChallengeData] = useState({ // NEW
    governmentChallengeId: '',
    customTitle: '',
    description: '',
    startDate: '',
    targetCompletionDate: '',
    assignedFaculty: '',
    targetStudents: 0,
    budget: '',
    additionalNotes: ''
  });

  useEffect(() => {
    fetchChallenges();
    fetchGovernmentChallenges(); // NEW
  }, [instituteId]);

  const fetchChallenges = async () => {
  try {
    setLoading(true);

    // Fetch all challenges from backend
    const res = await getChallenges(); // Axios call
    const allChallenges = res.data; // assuming API returns array of challenges

    // Optionally, tag challenges by source
    const challengesWithSource = allChallenges.map(ch => ({
      ...ch,
      source: ch.createdByRole === "government" ? "government" : "institute",
      instituteStatus: ch.instituteStatus || "not-started",
      studentParticipation: ch.studentParticipation || 0,
      progress: ch.progress || 0,
      submissionDeadline: ch.submissionDeadline || ch.deadline,
    }));

    // Set main challenges state
    setChallenges(challengesWithSource);

    // Optionally set government challenges separately
    setGovernmentChallenges(challengesWithSource.filter(ch => ch.source === "government"));

  } catch (error) {
    console.error("Error fetching challenges:", error);
  } finally {
    setLoading(false);
  }
};

  // NEW: Fetch government challenges for dropdown


const fetchGovernmentChallenges = async () => {
  try {
    const res = await getChallenges(); // call the API helper
    setGovernmentChallenges(res.data); // assuming the response has the array in res.data
  } catch (error) {
    console.error('Error fetching government challenges:', error);
  }
};


  // NEW: Handle creating new challenge from government template
  const handleCreateChallenge = async () => {
    if (!newChallengeData.governmentChallengeId) {
      alert('Please select a government challenge');
      return;
    }

    try {
      const selectedGovChallenge = governmentChallenges.find(
        challenge => challenge._id === newChallengeData.governmentChallengeId
      );

      const newChallenge = {
        ...selectedGovChallenge,
        _id: `inst_${Date.now()}`,
        instituteStatus: 'not-started',
        studentParticipation: 0,
        progress: 0,
        source: 'government',
        customTitle: newChallengeData.customTitle || selectedGovChallenge.title,
        description: newChallengeData.description || selectedGovChallenge.description,
        startDate: newChallengeData.startDate,
        targetCompletionDate: newChallengeData.targetCompletionDate,
        assignedFaculty: newChallengeData.assignedFaculty,
        targetStudents: newChallengeData.targetStudents,
        budget: newChallengeData.budget,
        additionalNotes: newChallengeData.additionalNotes
      };

      // Add to local state immediately
      setChallenges(prev => [newChallenge, ...prev]);
      
      // Reset form and close modal
      setNewChallengeData({
        governmentChallengeId: '',
        customTitle: '',
        description: '',
        startDate: '',
        targetCompletionDate: '',
        assignedFaculty: '',
        targetStudents: 0,
        budget: '',
        additionalNotes: ''
      });
      setShowCreateModal(false);

      alert('Challenge created successfully! You can now start working on it.');

    } catch (error) {
      console.error('Error creating challenge:', error);
      alert('Failed to create challenge. Please try again.');
    }
  };

  // NEW: Handle creating custom institute challenge
  const handleCreateCustomChallenge = async () => {
    if (!newChallengeData.customTitle || !newChallengeData.description) {
      alert('Please provide title and description for the custom challenge');
      return;
    }

    try {
      const customChallenge = {
        _id: `custom_${Date.now()}`,
        title: newChallengeData.customTitle,
        description: newChallengeData.description,
        category: 'custom',
        priority: 'optional',
        status: 'active',
        deadline: newChallengeData.targetCompletionDate,
        requirements: newChallengeData.additionalNotes || 'Custom institute challenge',
        resources: '',
        mandatory: false,
        instituteStatus: 'not-started',
        studentParticipation: 0,
        progress: 0,
        source: 'institute',
        startDate: newChallengeData.startDate,
        targetCompletionDate: newChallengeData.targetCompletionDate,
        assignedFaculty: newChallengeData.assignedFaculty,
        targetStudents: newChallengeData.targetStudents,
        budget: newChallengeData.budget
      };

      // Add to local state immediately
      setChallenges(prev => [customChallenge, ...prev]);
      
      // Reset form and close modal
      setNewChallengeData({
        governmentChallengeId: '',
        customTitle: '',
        description: '',
        startDate: '',
        targetCompletionDate: '',
        assignedFaculty: '',
        targetStudents: 0,
        budget: '',
        additionalNotes: ''
      });
      setShowCreateModal(false);

      alert('Custom challenge created successfully!');

    } catch (error) {
      console.error('Error creating custom challenge:', error);
      alert('Failed to create custom challenge. Please try again.');
    }
  };

  const handleStartChallenge = (challenge) => {
    setSelectedChallenge(challenge);
    // Mark challenge as in-progress for institute
    const updatedChallenges = challenges.map(c => 
      c._id === challenge._id ? { ...c, instituteStatus: 'in-progress' } : c
    );
    setChallenges(updatedChallenges);
  };

  const handleSubmitChallenge = async () => {
    if (!submissionData.description.trim()) {
      alert('Please provide a description of your submission');
      return;
    }

    try {
      // Submit to API
      await API.post('/challenges/submit', {
        challengeId: selectedChallenge._id,
        instituteId,
        ...submissionData
      });

      // Update local state
      const updatedChallenges = challenges.map(c => 
        c._id === selectedChallenge._id ? { ...c, instituteStatus: 'submitted' } : c
      );
      setChallenges(updatedChallenges);
      
      setShowSubmissionModal(false);
      setSelectedChallenge(null);
      setSubmissionData({ description: '', documents: [], photos: [] });
      
      alert('Challenge submitted successfully! Waiting for government approval.');
    } catch (error) {
      console.error('Error submitting challenge:', error);
      alert('Failed to submit challenge. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'not-started': return 'bg-gray-100 text-gray-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'submitted': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    return priority === 'mandatory' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800';
  };

  const getSourceBadge = (source) => {
    return source === 'government' 
      ? 'bg-purple-100 text-purple-800 border-purple-200'
      : 'bg-teal-100 text-teal-800 border-teal-200';
  };

  const filteredChallenges = challenges.filter(challenge => {
    const matchesSearch = challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         challenge.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || challenge.instituteStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Environmental Challenges</h1>
          <p className="text-gray-600">Participate in government environmental initiatives</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Create Challenge
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Challenges</p>
              <p className="text-2xl font-bold text-gray-800">{challenges.length}</p>
            </div>
            <Target className="text-blue-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Mandatory</p>
              <p className="text-2xl font-bold text-gray-800">
                {challenges.filter(c => c.mandatory).length}
              </p>
            </div>
            <AlertCircle className="text-red-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-800">
                {challenges.filter(c => c.instituteStatus === 'in-progress').length}
              </p>
            </div>
            <Clock className="text-orange-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-800">
                {challenges.filter(c => c.instituteStatus === 'completed').length}
              </p>
            </div>
            <CheckCircle className="text-green-500" size={24} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search challenges..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="not-started">Not Started</option>
          <option value="in-progress">In Progress</option>
          <option value="submitted">Submitted</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredChallenges.map((challenge) => (
          <div key={challenge._id} className="bg-white rounded-xl shadow-lg border-2 border-blue-100 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  challenge.priority === 'mandatory' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  <Target size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{challenge.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(challenge.instituteStatus)}`}>
                      {challenge.instituteStatus.replace('-', ' ')}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(challenge.priority)}`}>
                      {challenge.priority}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSourceBadge(challenge.source)}`}>
                      {challenge.source === 'government' ? 'Govt Challenge' : 'Custom Challenge'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-4">{challenge.description}</p>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar size={14} />
                <span>Deadline: {new Date(challenge.deadline).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users size={14} />
                <span>Student Participation: {challenge.studentParticipation}</span>
              </div>
              {challenge.progress > 0 && (
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{challenge.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${challenge.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4 border-t border-gray-200">
              {challenge.instituteStatus === 'not-started' && (
                <button
                  onClick={() => handleStartChallenge(challenge)}
                  className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Start Challenge
                </button>
              )}
              {challenge.instituteStatus === 'in-progress' && (
                <button
                  onClick={() => {
                    setSelectedChallenge(challenge);
                    setShowSubmissionModal(true);
                  }}
                  className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  Submit Completion
                </button>
              )}
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredChallenges.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Target className="mx-auto text-gray-300 mb-4" size={48} />
          <div className="text-gray-500">No challenges found</div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto"
          >
            <Plus size={16} />
            Create Your First Challenge
          </button>
        </div>
      )}

      {/* Create Challenge Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Create New Challenge</h3>
              
              <div className="space-y-4">

                {/* Custom Challenge Fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Challenge Title *
                  </label>
                  <input
                    type="text"
                    value={newChallengeData.customTitle}
                    onChange={(e) => setNewChallengeData(prev => ({ ...prev, customTitle: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter custom challenge title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={newChallengeData.description}
                    onChange={(e) => setNewChallengeData(prev => ({ ...prev, description: e.target.value }))}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe the challenge objectives and goals"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={newChallengeData.startDate}
                      onChange={(e) => setNewChallengeData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Completion Date
                    </label>
                    <input
                      type="date"
                      value={newChallengeData.targetCompletionDate}
                      onChange={(e) => setNewChallengeData(prev => ({ ...prev, targetCompletionDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assigned Faculty
                    </label>
                    <input
                      type="text"
                      value={newChallengeData.assignedFaculty}
                      onChange={(e) => setNewChallengeData(prev => ({ ...prev, assignedFaculty: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Faculty member name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Students
                    </label>
                    <input
                      type="number"
                      value={newChallengeData.targetStudents}
                      onChange={(e) => setNewChallengeData(prev => ({ ...prev, targetStudents: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Number of students"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget (Optional)
                  </label>
                  <input
                    type="text"
                    value={newChallengeData.budget}
                    onChange={(e) => setNewChallengeData(prev => ({ ...prev, budget: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Estimated budget if any"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    value={newChallengeData.additionalNotes}
                    onChange={(e) => setNewChallengeData(prev => ({ ...prev, additionalNotes: e.target.value }))}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Any additional requirements or notes..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setNewChallengeData({
                        governmentChallengeId: '',
                        customTitle: '',
                        description: '',
                        startDate: '',
                        targetCompletionDate: '',
                        assignedFaculty: '',
                        targetStudents: 0,
                        budget: '',
                        additionalNotes: ''
                      });
                    }}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  {newChallengeData.governmentChallengeId ? (
                    <button
                      onClick={handleCreateChallenge}
                      className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                    >
                      Create from Government Template
                    </button>
                  ) : (
                    <button
                      onClick={handleCreateCustomChallenge}
                      className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
                    >
                      Create Custom Challenge
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submission Modal (existing code remains the same) */}
      {showSubmissionModal && selectedChallenge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Submit Challenge: {selectedChallenge.title}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description of Completion *
                  </label>
                  <textarea
                    value={submissionData.description}
                    onChange={(e) => setSubmissionData(prev => ({ ...prev, description: e.target.value }))}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe how your institute completed this challenge, including activities, outcomes, and student participation..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supporting Documents
                  </label>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      setSubmissionData(prev => ({ ...prev, documents: files }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload reports, data sheets, or any supporting documentation
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Photos / Evidence
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      setSubmissionData(prev => ({ ...prev, photos: files }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload photos showing challenge implementation
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText size={16} className="text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Requirements</span>
                  </div>
                  <p className="text-sm text-blue-700">{selectedChallenge.requirements}</p>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowSubmissionModal(false);
                      setSelectedChallenge(null);
                    }}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitChallenge}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Submit Challenge
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChallengeManagement;