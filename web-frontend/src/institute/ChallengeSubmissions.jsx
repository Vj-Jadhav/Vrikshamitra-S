// src/institute/ChallengeSubmissions.jsx
import React, { useState, useEffect } from 'react';
import { Search, Filter, FileText, CheckCircle, Clock, XCircle, Download, Eye, Calendar, Building } from 'lucide-react';
import { API } from "../utils/api";

const ChallengeSubmissions = ({ instituteId }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, [instituteId]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockSubmissions = [
        {
          _id: 's1',
          challengeId: '1',
          challengeTitle: 'Plastic Waste Reduction Campaign',
          submissionDate: '2024-06-15',
          status: 'approved',
          governmentRemarks: 'Excellent implementation with comprehensive documentation. The 60% reduction in plastic waste is impressive and well-documented.',
          reviewedBy: 'Environmental Dept Officer',
          reviewedAt: '2024-06-20',
          documents: [
            { name: 'Campaign_Report.pdf', size: '2.4 MB', type: 'pdf' },
            { name: 'Data_Analysis.xlsx', size: '1.2 MB', type: 'excel' },
            { name: 'Student_Participation_List.pdf', size: '0.8 MB', type: 'pdf' }
          ],
          photos: [
            { name: 'before_after_comparison.jpg', size: '3.1 MB', type: 'image' },
            { name: 'student_activities.jpg', size: '2.8 MB', type: 'image' }
          ],
          description: 'Successfully organized a campus-wide campaign that reduced single-use plastic consumption by 60%. Implemented plastic-free zones, conducted awareness workshops, and installed water refill stations. Student participation reached 85% across all grades.',
          studentParticipation: 45,
          ecoPointsAwarded: 500,
          submissionType: 'complete'
        },
        {
          _id: 's2',
          challengeId: '2',
          challengeTitle: 'Energy Conservation Audit',
          submissionDate: '2024-06-10',
          status: 'pending',
          governmentRemarks: null,
          reviewedBy: null,
          reviewedAt: null,
          documents: [
            { name: 'Energy_Audit_Report.pdf', size: '3.1 MB', type: 'pdf' }
          ],
          photos: [
            { name: 'audit_process_1.jpg', size: '2.5 MB', type: 'image' },
            { name: 'audit_process_2.jpg', size: '2.7 MB', type: 'image' }
          ],
          description: 'Completed comprehensive energy audit of campus facilities. Identified key areas for improvement including lighting upgrades and HVAC optimization. Implementation phase is currently underway.',
          studentParticipation: 28,
          ecoPointsAwarded: 0,
          submissionType: 'progress'
        },
        {
          _id: 's3',
          challengeId: '3',
          challengeTitle: 'Tree Plantation Drive',
          submissionDate: '2024-05-20',
          status: 'rejected',
          governmentRemarks: 'Submission lacks proper documentation of tree survival rates and maintenance schedule. Please resubmit with complete monitoring data for at least 3 months.',
          reviewedBy: 'Forestry Dept Officer',
          reviewedAt: '2024-05-25',
          documents: [
            { name: 'Plantation_Plan.pdf', size: '1.8 MB', type: 'pdf' }
          ],
          photos: [
            { name: 'plantation_day_1.jpg', size: '4.2 MB', type: 'image' },
            { name: 'plantation_day_2.jpg', size: '3.9 MB', type: 'image' }
          ],
          description: 'Planted 1000 native tree species across campus and surrounding community areas. Involved students in planting and initial maintenance activities.',
          studentParticipation: 120,
          ecoPointsAwarded: 0,
          submissionType: 'complete'
        },
        {
          _id: 's4',
          challengeId: '4',
          challengeTitle: 'Water Conservation Program',
          submissionDate: '2024-07-01',
          status: 'under-review',
          governmentRemarks: 'Currently being evaluated by the water resources department.',
          reviewedBy: null,
          reviewedAt: null,
          documents: [
            { name: 'Water_Conservation_Report.pdf', size: '2.1 MB', type: 'pdf' },
            { name: 'Implementation_Plan.docx', size: '1.5 MB', type: 'document' }
          ],
          photos: [
            { name: 'rainwater_harvesting.jpg', size: '3.2 MB', type: 'image' },
            { name: 'water_efficient_fixtures.jpg', size: '2.9 MB', type: 'image' }
          ],
          description: 'Implemented comprehensive water conservation measures including rainwater harvesting, installation of water-efficient fixtures, and student awareness programs. Achieved 30% reduction in water consumption.',
          studentParticipation: 65,
          ecoPointsAwarded: 0,
          submissionType: 'complete'
        }
      ];
      setSubmissions(mockSubmissions);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'pending':
        return <Clock className="text-orange-500" size={20} />;
      case 'under-review':
        return <Eye className="text-blue-500" size={20} />;
      case 'rejected':
        return <XCircle className="text-red-500" size={20} />;
      default:
        return <Clock className="text-gray-500" size={20} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'under-review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'pending':
        return 'Pending Review';
      case 'under-review':
        return 'Under Review';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  const handleDownload = (document) => {
    // Mock download functionality
    console.log('Downloading:', document.name);
    // Actual implementation would involve generating download links
  };

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = submission.challengeTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
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
          <h1 className="text-2xl font-bold text-gray-800">My Submissions</h1>
          <p className="text-gray-600">Track your challenge submissions and government reviews</p>
        </div>
        <div className="text-sm text-gray-500">
          Total Submissions: {submissions.length}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-800">
                {submissions.filter(s => s.status === 'approved').length}
              </p>
            </div>
            <CheckCircle className="text-green-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-800">
                {submissions.filter(s => s.status === 'pending').length}
              </p>
            </div>
            <Clock className="text-orange-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Under Review</p>
              <p className="text-2xl font-bold text-gray-800">
                {submissions.filter(s => s.status === 'under-review').length}
              </p>
            </div>
            <Eye className="text-blue-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-800">
                {submissions.filter(s => s.status === 'rejected').length}
              </p>
            </div>
            <XCircle className="text-red-500" size={24} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search submissions..."
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
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="under-review">Under Review</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {filteredSubmissions.map((submission) => (
          <div key={submission._id} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Building className="text-blue-500" size={20} />
                  <h3 className="text-lg font-semibold text-gray-800">{submission.challengeTitle}</h3>
                </div>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{submission.description}</p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>Submitted: {new Date(submission.submissionDate).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span>Students: {submission.studentParticipation}</span>
                  </div>
                  {submission.ecoPointsAwarded > 0 && (
                    <div className="text-green-600 font-medium">
                      Eco Points: +{submission.ecoPointsAwarded}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(submission.status)}`}>
                  {getStatusText(submission.status)}
                </div>
                <button
                  onClick={() => {
                    setSelectedSubmission(submission);
                    setShowDetailsModal(true);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="View Details"
                >
                  <Eye size={18} />
                </button>
              </div>
            </div>

            {/* Documents Preview */}
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-gray-400" />
              <div className="flex gap-2">
                {submission.documents.slice(0, 2).map((doc, index) => (
                  <span key={index} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {doc.name}
                  </span>
                ))}
                {submission.documents.length > 2 && (
                  <span className="text-xs text-gray-500">
                    +{submission.documents.length - 2} more
                  </span>
                )}
              </div>
            </div>

            {/* Government Remarks (if available) */}
            {submission.governmentRemarks && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle size={14} className="text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Government Feedback</span>
                </div>
                <p className="text-sm text-blue-700">{submission.governmentRemarks}</p>
                {submission.reviewedBy && (
                  <p className="text-xs text-blue-600 mt-1">
                    Reviewed by {submission.reviewedBy} on {new Date(submission.reviewedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredSubmissions.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <FileText className="mx-auto text-gray-300 mb-4" size={48} />
          <div className="text-gray-500">No submissions found</div>
          <p className="text-sm text-gray-400 mt-2">
            {searchTerm || statusFilter !== 'all' ? 'Try adjusting your search filters' : 'Complete challenges to see submissions here'}
          </p>
        </div>
      )}

      {/* Submission Details Modal */}
      {showDetailsModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{selectedSubmission.challengeTitle}</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(selectedSubmission.status)}`}>
                      {getStatusText(selectedSubmission.status)}
                    </div>
                    <span className="text-sm text-gray-500">
                      Submitted: {new Date(selectedSubmission.submissionDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle size={24} />
                </button>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Submission Description</h4>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedSubmission.description}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{selectedSubmission.studentParticipation}</div>
                  <div className="text-sm text-blue-800">Students Participated</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{selectedSubmission.ecoPointsAwarded}</div>
                  <div className="text-sm text-green-800">Eco Points Awarded</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 capitalize">{selectedSubmission.submissionType}</div>
                  <div className="text-sm text-purple-800">Submission Type</div>
                </div>
              </div>

              {/* Documents */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Supporting Documents</h4>
                <div className="space-y-2">
                  {selectedSubmission.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="text-gray-400" size={20} />
                        <div>
                          <div className="font-medium text-gray-800">{doc.name}</div>
                          <div className="text-sm text-gray-500">{doc.size} • {doc.type.toUpperCase()}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDownload(doc)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Government Feedback */}
              {selectedSubmission.governmentRemarks && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Government Review</h4>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800 mb-2">{selectedSubmission.governmentRemarks}</p>
                    {selectedSubmission.reviewedBy && (
                      <p className="text-sm text-blue-700">
                        Reviewed by <strong>{selectedSubmission.reviewedBy}</strong> on {new Date(selectedSubmission.reviewedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                {selectedSubmission.status === 'rejected' && (
                  <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                    Resubmit Challenge
                  </button>
                )}
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChallengeSubmissions;