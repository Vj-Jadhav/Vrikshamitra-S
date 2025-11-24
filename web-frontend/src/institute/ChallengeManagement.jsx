// src/institute/ChallengeManagement.jsx - FULLY UPDATED
import React, { useState, useEffect } from 'react';
import { Search, Filter, Target, CheckCircle, Clock, AlertCircle, Users, Calendar, FileText, Plus, BookOpen, X } from 'lucide-react';
import { API, getChallenges } from "../utils/api";

const ChallengeManagement = ({ instituteId, instituteData }) => {
  const [challenges, setChallenges] = useState([]);
  const [governmentChallenges, setGovernmentChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [submissionData, setSubmissionData] = useState({
    description: '',
    documents: [],
    photos: []
  });
  const [newChallengeData, setNewChallengeData] = useState({
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

  // Assignment state
  const [assignmentData, setAssignmentData] = useState({
    selectedBatches: [],
    assignmentMessage: '',
    deadline: '',
    facultyCoordinator: ''
  });

  // Sample batches data - replace with actual data from your backend
  const [availableBatches, setAvailableBatches] = useState([
    { id: '1', name: '1st Year', department: 'All Departments', students: 120, type: 'year' },
    { id: '2', name: '2nd Year', department: 'All Departments', students: 115, type: 'year' },
    { id: '3', name: '3rd Year', department: 'All Departments', students: 110, type: 'year' },
    { id: '4', name: '4th Year', department: 'All Departments', students: 105, type: 'year' },
    { id: '5', name: '1st Class', department: 'Elementary', students: 60, type: 'class' },
    { id: '6', name: '2nd Class', department: 'Elementary', students: 58, type: 'class' },
    { id: '7', name: '3rd Class', department: 'Elementary', students: 55, type: 'class' },
    { id: '8', name: 'Computer Science', department: 'Engineering', students: 75, type: 'department' },
    { id: '9', name: 'Mechanical', department: 'Engineering', students: 68, type: 'department' },
    { id: '10', name: 'Civil', department: 'Engineering', students: 72, type: 'department' }
  ]);

  const [batchFilter, setBatchFilter] = useState('all');

  useEffect(() => {
    fetchChallenges();
    fetchGovernmentChallenges();
  }, [instituteId]);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const res = await getChallenges();
      const allChallenges = res.data;

      const challengesWithSource = allChallenges.map(ch => ({
        ...ch,
        source: ch.createdByRole === "government" ? "government" : "institute",
        instituteStatus: ch.instituteStatus || "not-started",
        studentParticipation: ch.studentParticipation || 0,
        progress: ch.progress || 0,
        submissionDeadline: ch.submissionDeadline || ch.deadline,
        assignedBatches: ch.assignedBatches || [],
        assignmentDetails: ch.assignmentDetails || null
      }));

      setChallenges(challengesWithSource);
      setGovernmentChallenges(challengesWithSource.filter(ch => ch.source === "government"));
    } catch (error) {
      console.error("Error fetching challenges:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGovernmentChallenges = async () => {
    try {
      const res = await getChallenges();
      setGovernmentChallenges(res.data);
    } catch (error) {
      console.error('Error fetching government challenges:', error);
    }
  };

  // Handle batch selection
  const handleBatchSelection = (batchId) => {
    setAssignmentData(prev => {
      const isSelected = prev.selectedBatches.includes(batchId);
      if (isSelected) {
        return {
          ...prev,
          selectedBatches: prev.selectedBatches.filter(id => id !== batchId)
        };
      } else {
        return {
          ...prev,
          selectedBatches: [...prev.selectedBatches, batchId]
        };
      }
    });
  };

  // Handle starting challenge with assignment
  const handleStartChallenge = (challenge) => {
    setSelectedChallenge(challenge);
    // Pre-fill assignment deadline with challenge deadline
    setAssignmentData(prev => ({
      ...prev,
      deadline: challenge.deadline || ''
    }));
    setShowAssignmentModal(true);
  };

  // Confirm assignment and start challenge
  const handleConfirmAssignment = async () => {
    if (assignmentData.selectedBatches.length === 0) {
      alert('Please select at least one batch to assign this challenge');
      return;
    }

    try {
      // Update challenge status and assignment in backend
      const updatedChallenge = {
        ...selectedChallenge,
        instituteStatus: 'in-progress',
        assignedBatches: assignmentData.selectedBatches,
        assignmentDetails: {
          message: assignmentData.assignmentMessage,
          deadline: assignmentData.deadline,
          facultyCoordinator: assignmentData.facultyCoordinator,
          assignedAt: new Date().toISOString()
        }
      };

      // Update local state immediately
      const updatedChallenges = challenges.map(c => 
        c._id === selectedChallenge._id ? updatedChallenge : c
      );
      setChallenges(updatedChallenges);

      // Here you would typically make an API call to update the challenge
      // await API.put(`/challenges/${selectedChallenge._id}/assign`, {
      //   assignedBatches: assignmentData.selectedBatches,
      //   assignmentDetails: assignmentData
      // });

      // Reset assignment data and close modal
      setAssignmentData({
        selectedBatches: [],
        assignmentMessage: '',
        deadline: '',
        facultyCoordinator: ''
      });
      setShowAssignmentModal(false);
      setSelectedChallenge(null);

      alert(`Challenge assigned to ${assignmentData.selectedBatches.length} batch(es) successfully!`);

    } catch (error) {
      console.error('Error assigning challenge:', error);
      alert('Failed to assign challenge. Please try again.');
    }
  };

  // Get batch name by ID
  const getBatchName = (batchId) => {
    const batch = availableBatches.find(b => b.id === batchId);
    return batch ? batch.name : 'Unknown Batch';
  };

  // Get batch details by ID
  const getBatchDetails = (batchId) => {
    const batch = availableBatches.find(b => b.id === batchId);
    return batch || null;
  };

  // Filter batches by type
  const filteredBatches = availableBatches.filter(batch => {
    if (batchFilter === 'all') return true;
    return batch.type === batchFilter;
  });

  // Handle creating new challenge from government template
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
        additionalNotes: newChallengeData.additionalNotes,
        assignedBatches: [],
        assignmentDetails: null
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

  // Handle creating custom institute challenge
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
        budget: newChallengeData.budget,
        assignedBatches: [],
        assignmentDetails: null
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

  const getBatchTypeColor = (type) => {
    switch (type) {
      case 'year': return 'bg-blue-100 text-blue-800';
      case 'class': return 'bg-green-100 text-green-800';
      case 'department': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
      <div className="flex flex-col sm:flex-row gap-4">
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
          <div key={challenge._id} className="bg-white rounded-xl shadow-lg border-2 border-blue-100 p-6 hover:shadow-xl transition-shadow">
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

            {/* Show assigned batches if any */}
            {challenge.assignedBatches && challenge.assignedBatches.length > 0 && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Users size={14} />
                  <span className="font-medium">Assigned to:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {challenge.assignedBatches.map(batchId => {
                    const batch = getBatchDetails(batchId);
                    return batch ? (
                      <div key={batchId} className="flex items-center gap-1">
                        <span className={`px-2 py-1 text-xs rounded-full ${getBatchTypeColor(batch.type)}`}>
                          {batch.name}
                        </span>
                        <span className="text-xs text-gray-500">({batch.students} students)</span>
                      </div>
                    ) : null;
                  })}
                </div>
                {challenge.assignmentDetails && challenge.assignmentDetails.facultyCoordinator && (
                  <div className="text-xs text-gray-500 mt-2">
                    Coordinator: {challenge.assignmentDetails.facultyCoordinator}
                  </div>
                )}
              </div>
            )}

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
                      className="bg-green-500 h-2 rounded-full transition-all duration-300" 
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
                  className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium"
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
                  className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors font-medium"
                >
                  Submit Completion
                </button>
              )}
              {challenge.instituteStatus === 'submitted' && (
                <button
                  className="flex-1 bg-orange-500 text-white py-2 rounded-lg font-medium cursor-not-allowed"
                  disabled
                >
                  Under Review
                </button>
              )}
              {challenge.instituteStatus === 'completed' && (
                <button
                  className="flex-1 bg-green-500 text-white py-2 rounded-lg font-medium cursor-not-allowed"
                  disabled
                >
                  Completed
                </button>
              )}
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">
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

      {/* Assignment Modal */}
      {showAssignmentModal && selectedChallenge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Assign Challenge: {selectedChallenge.title}
                  </h3>
                  <p className="text-gray-600 mt-1">Select batches to assign this challenge</p>
                </div>
                <button
                  onClick={() => {
                    setShowAssignmentModal(false);
                    setSelectedChallenge(null);
                    setAssignmentData({
                      selectedBatches: [],
                      assignmentMessage: '',
                      deadline: '',
                      facultyCoordinator: ''
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Batch Selection */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Select Batches/Classes *
                    </label>
                    <select
                      value={batchFilter}
                      onChange={(e) => setBatchFilter(e.target.value)}
                      className="text-sm px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="all">All Types</option>
                      <option value="year">Years</option>
                      <option value="class">Classes</option>
                      <option value="department">Departments</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-3 border border-gray-200 rounded-lg bg-gray-50">
                    {filteredBatches.map((batch) => (
                      <div
                        key={batch.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          assignmentData.selectedBatches.includes(batch.id)
                            ? 'border-blue-500 bg-blue-50 shadow-sm'
                            : 'border-gray-200 bg-white hover:bg-gray-50'
                        }`}
                        onClick={() => handleBatchSelection(batch.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-800">{batch.name}</span>
                              <span className={`px-1.5 py-0.5 text-xs rounded-full ${getBatchTypeColor(batch.type)}`}>
                                {batch.type}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600">{batch.department}</div>
                            <div className="text-xs text-gray-500">{batch.students} students</div>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            assignmentData.selectedBatches.includes(batch.id)
                              ? 'bg-blue-500 border-blue-500'
                              : 'border-gray-300 bg-white'
                          }`}>
                            {assignmentData.selectedBatches.includes(batch.id) && (
                              <div className="text-white text-xs font-bold">✓</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-500">
                      Selected: {assignmentData.selectedBatches.length} batch(es)
                    </p>
                    {assignmentData.selectedBatches.length > 0 && (
                      <button
                        onClick={() => setAssignmentData(prev => ({ ...prev, selectedBatches: [] }))}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                </div>

                {/* Assignment Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assignment Deadline *
                    </label>
                    <input
                      type="date"
                      value={assignmentData.deadline}
                      onChange={(e) => setAssignmentData(prev => ({ ...prev, deadline: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Faculty Coordinator *
                    </label>
                    <input
                      type="text"
                      value={assignmentData.facultyCoordinator}
                      onChange={(e) => setAssignmentData(prev => ({ ...prev, facultyCoordinator: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter coordinator name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assignment Message (Optional)
                  </label>
                  <textarea
                    value={assignmentData.assignmentMessage}
                    onChange={(e) => setAssignmentData(prev => ({ ...prev, assignmentMessage: e.target.value }))}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add any specific instructions or notes for the assigned batches..."
                  />
                </div>

                {/* Selected Batches Summary */}
                {assignmentData.selectedBatches.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2">Assignment Summary</h4>
                    <div className="text-sm text-blue-700">
                      <p>This challenge will be assigned to:</p>
                      <ul className="list-disc list-inside mt-1">
                        {assignmentData.selectedBatches.map(batchId => {
                          const batch = getBatchDetails(batchId);
                          return batch ? (
                            <li key={batchId}>
                              {batch.name} ({batch.department}) - {batch.students} students
                            </li>
                          ) : null;
                        })}
                      </ul>
                      <p className="mt-2 font-medium">
                        Total students: {assignmentData.selectedBatches.reduce((total, batchId) => {
                          const batch = getBatchDetails(batchId);
                          return total + (batch ? batch.students : 0);
                        }, 0)}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowAssignmentModal(false);
                      setSelectedChallenge(null);
                      setAssignmentData({
                        selectedBatches: [],
                        assignmentMessage: '',
                        deadline: '',
                        facultyCoordinator: ''
                      });
                    }}
                    className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmAssignment}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={assignmentData.selectedBatches.length === 0 || !assignmentData.deadline || !assignmentData.facultyCoordinator}
                  >
                    Assign & Start Challenge
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Challenge Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Create New Challenge</h3>
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
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
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

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
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
                    className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  {newChallengeData.governmentChallengeId ? (
                    <button
                      onClick={handleCreateChallenge}
                      className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium"
                    >
                      Create from Government Template
                    </button>
                  ) : (
                    <button
                      onClick={handleCreateCustomChallenge}
                      className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium"
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

      {/* Submission Modal */}
      {showSubmissionModal && selectedChallenge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  Submit Challenge: {selectedChallenge.title}
                </h3>
                <button
                  onClick={() => {
                    setShowSubmissionModal(false);
                    setSelectedChallenge(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
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

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowSubmissionModal(false);
                      setSelectedChallenge(null);
                    }}
                    className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitChallenge}
                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
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