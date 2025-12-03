// src/government/ChallengeManagement.jsx
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Target, 
  CheckCircle, 
  Edit, 
  Trash2, 
  FileText,
  Users,
  Calendar,
  Star,
  Award
} from 'lucide-react';
import { API, createChallenge, updateChallenge, getChallenges, deleteChallenge } from "../utils/api";

const ChallengeManagement = ({ token, adminId }) => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [viewingSubmissions, setViewingSubmissions] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'environmental',
    priority: 'optional',
    deadline: '',
    requirements: '',
    resources: '',
    mandatory: false,
    ecoPoints: 10 // Default value instead of 0
  });

  useEffect(() => {
    fetchChallenges();
    fetchSubmissions();
  }, []);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching challenges...");
      
      const res = await getChallenges();
      console.log("API Response:", res);
      
      let challengesData = [];
      
      if (Array.isArray(res)) {
        challengesData = res;
      } else if (Array.isArray(res?.data)) {
        challengesData = res.data;
      } else if (res?.data && typeof res.data === 'object') {
        if (Array.isArray(res.data.challenges)) {
          challengesData = res.data.challenges;
        } else if (Array.isArray(res.data.items)) {
          challengesData = res.data.items;
        } else {
          challengesData = Object.values(res.data);
        }
      }
      
      const processedChallenges = challengesData.map(challenge => ({
        _id: challenge._id || challenge.id,
        title: challenge.title || 'Untitled Challenge',
        description: challenge.description || 'No description',
        category: challenge.category || 'environmental',
        priority: challenge.priority || 'optional',
        status: challenge.status || 'active',
        deadline: challenge.deadline || '',
        requirements: challenge.requirements || '',
        resources: challenge.resources || '',
        mandatory: challenge.mandatory || challenge.priority === 'mandatory',
        ecoPoints: challenge.ecoPoints || challenge.ecopoints || 10,
        createdAt: challenge.createdAt || challenge.createdDate || new Date().toISOString(),
        totalSubmissions: challenge.totalSubmissions || challenge.submissionCount || 0,
        approvedSubmissions: challenge.approvedSubmissions || challenge.approvedCount || 0
      }));
      
      setChallenges(processedChallenges);
      
    } catch (error) {
      console.error("Error fetching challenges:", error);
      setError('Failed to load challenges. Please try again.');
      setChallenges([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const sampleSubmissions = [
        {
          _id: 's1',
          challengeId: '1',
          instituteName: 'Greenwood College',
          instituteId: 'i1',
          submissionDate: '2024-06-15',
          status: 'approved',
          documents: ['Campaign Report.pdf', 'Data Analysis.xlsx', 'Photos.zip'],
          description: 'Successfully reduced plastic waste by 60% through various initiatives',
          approvedBy: 'Admin User',
          approvedAt: '2024-06-20'
        }
      ];
      setSubmissions(sampleSubmissions);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setSubmissions([]);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (!formData.deadline) {
      errors.deadline = 'Deadline is required';
    } else {
      const selectedDate = new Date(formData.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        errors.deadline = 'Deadline cannot be in the past';
      }
    }
    
    if (!formData.ecoPoints || formData.ecoPoints < 1 || formData.ecoPoints > 1000) {
      errors.ecoPoints = 'Ecopoints must be between 1 and 1000';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    try {
      const payload = {
        ...formData,
        createdBy: adminId,
        status: 'active',
        // Convert empty strings to null/undefined for optional fields
        requirements: formData.requirements || undefined,
        resources: formData.resources || undefined,
      };

      console.log("Submitting challenge:", payload);

      if (editingChallenge) {
        await updateChallenge(editingChallenge._id, payload);
        console.log("Challenge updated successfully");
      } else {
        await createChallenge(payload, token);
        console.log("Challenge created successfully");
      }

      setIsModalOpen(false);
      setEditingChallenge(null);
      setFormData({
        title: "",
        description: "",
        category: "environmental",
        priority: "optional",
        deadline: "",
        requirements: "",
        resources: "",
        mandatory: false,
        ecoPoints: 10
      });
      setFormErrors({});

      await fetchChallenges();

    } catch (error) {
      console.error("Error saving challenge:", error);
      let errorMessage = 'Failed to save challenge. Please try again.';
      
      // Parse error message from backend
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message?.includes('deadline')) {
        errorMessage = 'Deadline is required. Please select a valid date.';
      }
      
      alert(errorMessage);
    }
  };

  const handleEdit = (challenge) => {
    console.log("Editing challenge:", challenge);
    setEditingChallenge(challenge);
    setFormData({
      title: challenge.title || '',
      description: challenge.description || '',
      category: challenge.category || 'environmental',
      priority: challenge.priority || 'optional',
      deadline: challenge.deadline ? challenge.deadline.split('T')[0] : '',
      requirements: challenge.requirements || '',
      resources: challenge.resources || '',
      mandatory: challenge.mandatory || false,
      ecoPoints: challenge.ecoPoints || 10
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleDelete = async (challengeId) => {
    if (window.confirm('Are you sure you want to delete this challenge?')) {
      try {
        await deleteChallenge(challengeId);
        console.log("Challenge deleted successfully");
        await fetchChallenges();
      } catch (error) {
        console.error('Error deleting challenge:', error);
        alert('Failed to delete challenge. Please try again.');
      }
    }
  };

  const handleApproveSubmission = async (submissionId) => {
    try {
      console.log("Approving submission:", submissionId);
      alert('Submission approved successfully!');
      // Refresh submissions
      fetchSubmissions();
    } catch (error) {
      console.error('Error approving submission:', error);
      alert('Failed to approve submission.');
    }
  };

  const handleRejectSubmission = async (submissionId) => {
    try {
      console.log("Rejecting submission:", submissionId);
      alert('Submission rejected!');
      // Refresh submissions
      fetchSubmissions();
    } catch (error) {
      console.error('Error rejecting submission:', error);
      alert('Failed to reject submission.');
    }
  };

  const filteredChallenges = challenges.filter(challenge => {
    const matchesSearch = 
      challenge.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      challenge.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || challenge.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getSubmissionsForChallenge = (challengeId) => {
    return submissions.filter(sub => sub.challengeId === challengeId);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date set';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Calculate minimum date for deadline (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-2">Error</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button
            onClick={fetchChallenges}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Challenge Management</h2>
          <p className="text-gray-600">
            {challenges.length > 0 
              ? `Managing ${challenges.length} challenges` 
              : 'Create and manage environmental challenges for institutes'
            }
          </p>
        </div>
        <button
          onClick={() => {
            setEditingChallenge(null);
            setFormData({
              title: "",
              description: "",
              category: "environmental",
              priority: "optional",
              deadline: "",
              requirements: "",
              resources: "",
              mandatory: false,
              ecoPoints: 10
            });
            setFormErrors({});
            setIsModalOpen(true);
          }}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={20} />
          Add Challenge
        </button>
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
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      challenge.status === 'active' 
                        ? 'bg-green-100 text-green-800'
                        : challenge.status === 'completed'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {challenge.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      challenge.priority === 'mandatory' 
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {challenge.priority}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setViewingSubmissions(challenge)}
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="View Submissions"
                >
                  <FileText size={16} />
                </button>
                <button
                  onClick={() => handleEdit(challenge)}
                  className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                  title="Edit Challenge"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(challenge._id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Delete Challenge"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{challenge.description}</p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar size={14} />
                <span>Deadline: {formatDate(challenge.deadline)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users size={14} />
                <span>Submissions: {challenge.totalSubmissions} ({challenge.approvedSubmissions} approved)</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Award size={14} className="text-green-600" />
                <span>Ecopoints: {challenge.ecoPoints || 10}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <span className="text-xs text-gray-500">
                Created: {formatDate(challenge.createdAt)}
              </span>
              {challenge.mandatory && (
                <Star size={14} className="text-yellow-500" />
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredChallenges.length === 0 && challenges.length > 0 && (
        <div className="text-center py-12">
          <Search size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">No challenges match your search criteria</p>
        </div>
      )}

      {challenges.length === 0 && (
        <div className="text-center py-12">
          <Target size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">No challenges found</p>
          <button
            onClick={() => {
              setEditingChallenge(null);
              setFormData({
                title: "",
                description: "",
                category: "environmental",
                priority: "optional",
                deadline: "",
                requirements: "",
                resources: "",
                mandatory: false,
                ecoPoints: 10
              });
              setFormErrors({});
              setIsModalOpen(true);
            }}
            className="mt-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors"
          >
            <Plus size={20} />
            Create Your First Challenge
          </button>
        </div>
      )}

      {/* Add/Edit Challenge Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                {editingChallenge ? 'Edit Challenge' : 'Create New Challenge'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Challenge Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      formErrors.title 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="Enter challenge title"
                  />
                  {formErrors.title && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows="3"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      formErrors.description 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="Describe the challenge objectives and goals"
                  />
                  {formErrors.description && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="environmental">Environmental</option>
                      <option value="energy">Energy Conservation</option>
                      <option value="green-cover">Green Cover</option>
                      <option value="waste-management">Waste Management</option>
                      <option value="water-conservation">Water Conservation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        priority: e.target.value,
                        mandatory: e.target.value === 'mandatory'
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="optional">Optional</option>
                      <option value="mandatory">Mandatory</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deadline *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.deadline}
                      onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                      min={getMinDate()}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        formErrors.deadline 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    {formErrors.deadline && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.deadline}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ecopoints Reward *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="1000"
                      step="1"
                      value={formData.ecoPoints}
                      onChange={(e) => setFormData(prev => ({ ...prev, ecoPoints: parseInt(e.target.value) || 10 }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        formErrors.ecoPoints 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      placeholder="Enter ecopoints reward (1-1000)"
                    />
                    {formErrors.ecoPoints && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.ecoPoints}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Requirements (Optional)
                  </label>
                  <textarea
                    value={formData.requirements}
                    onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="List the requirements for completing this challenge"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Resources (Optional)
                  </label>
                  <textarea
                    value={formData.resources}
                    onChange={(e) => setFormData(prev => ({ ...prev, resources: e.target.value }))}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Provide any resources or guidelines for institutes"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.mandatory}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      mandatory: e.target.checked,
                      priority: e.target.checked ? 'mandatory' : 'optional'
                    }))}
                    className="rounded"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Mark as mandatory challenge
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingChallenge(null);
                      setFormErrors({});
                    }}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    {editingChallenge ? 'Update Challenge' : 'Create Challenge'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Submissions Modal */}
      {viewingSubmissions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Submissions for {viewingSubmissions.title}
                  </h3>
                  <p className="text-gray-600">Review and approve institute submissions</p>
                </div>
                <button
                  onClick={() => setViewingSubmissions(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Trash2 size={24} />
                </button>
              </div>

              <div className="space-y-4">
                {getSubmissionsForChallenge(viewingSubmissions._id).map((submission) => (
                  <div key={submission._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-800">{submission.instituteName}</h4>
                        <p className="text-sm text-gray-600">
                          Submitted: {formatDate(submission.submissionDate)}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        submission.status === 'approved' 
                          ? 'bg-green-100 text-green-800'
                          : submission.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {submission.status}
                      </span>
                    </div>

                    <p className="text-gray-700 text-sm mb-3">{submission.description}</p>

                    <div className="mb-3">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Documents:</h5>
                      <div className="flex flex-wrap gap-2">
                        {submission.documents.map((doc, index) => (
                          <button
                            key={index}
                            className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
                            onClick={() => alert(`Would download: ${doc}`)}
                          >
                            <FileText size={12} />
                            {doc}
                          </button>
                        ))}
                      </div>
                    </div>

                    {submission.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveSubmission(submission._id)}
                          className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 flex items-center gap-1 transition-colors"
                        >
                          <CheckCircle size={14} />
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectSubmission(submission._id)}
                          className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 flex items-center gap-1 transition-colors"
                        >
                          <Trash2 size={14} />
                          Reject
                        </button>
                      </div>
                    )}

                    {submission.status === 'approved' && submission.approvedBy && (
                      <p className="text-sm text-gray-600">
                        Approved by {submission.approvedBy} on {formatDate(submission.approvedAt)}
                      </p>
                    )}
                  </div>
                ))}

                {getSubmissionsForChallenge(viewingSubmissions._id).length === 0 && (
                  <div className="text-center py-8">
                    <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">No submissions yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChallengeManagement;