// src/institute/ChallengeManagement.jsx
import React, { useState, useEffect } from 'react';
import { Search, Filter, Target, CheckCircle, Clock, AlertCircle, Users, Calendar, FileText, Plus, BookOpen, X, BarChart3, Award, TrendingUp } from 'lucide-react';
import { getChallenges, getInstituteById, getStudentsByInstitute, createChallengeAssignment, getFacultyByInstitute } from "../utils/api";

const ChallengeManagement = ({ instituteId }) => {
  const [challenges, setChallenges] = useState([]);
  const [institute, setInstitute] = useState(null);
  const [students, setStudents] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [assignmentData, setAssignmentData] = useState({
    assignmentType: '',
    faculties: [],
    departments: [],
    grades: [],
    batches: [],
    sections: [],
    programs: [],
    academicYears: [],
    semesters: [],
    submissionDeadline: '',
    instructions: '',
    facultyCoordinator: ''
  });

  // New challenge creation state
  const [newChallengeData, setNewChallengeData] = useState({
    title: '',
    description: '',
    category: 'environmental',
    priority: 'optional',
    deadline: '',
    requirements: '',
    resources: ''
  });

  useEffect(() => {
    if (instituteId) {
      fetchInstitute();
      fetchChallenges();
      fetchStudents();
      fetchFaculties();
    }
  }, [instituteId]);

  useEffect(() => {
    if (!instituteId) {
      console.error('Institute ID is missing!');
    } else {
      console.log('Institute ID from props:', instituteId);
      console.log('Type of instituteId:', typeof instituteId);
    }
  }, [instituteId]);

  const fetchInstitute = async () => {
    try {
      const data = await getInstituteById(instituteId);
      setInstitute(data.data);
      console.log("Fetched institute data:", data);
      setAssignmentData(prev => ({
        ...prev,
        assignmentType: data.data?.instituteType || ''
      }));
    } catch (error) {
      console.error("Error fetching institute:", error);
    }
  };

  const fetchStudents = async () => {
    try {
      const data = await getStudentsByInstitute(instituteId);
      console.log("Fetched students:", data);
      // Ensure students is always an array
      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching students:", error);
      setStudents([]);
    }
  };

  const fetchFaculties = async () => {
    try {
      const data = await getFacultyByInstitute(instituteId);
      console.log("Fetched faculties:", data);
      // Handle different response formats
      const facultiesData = data.data || data;
      setFaculties(Array.isArray(facultiesData) ? facultiesData : []);
    } catch (error) {
      console.error("Error fetching faculties:", error);
      setFaculties([]);
    }
  };

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const res = await getChallenges();
      const allChallenges = res.data || [];

      const challengesWithProgress = allChallenges.map(challenge => ({
        ...challenge,
        instituteStatus: Math.random() > 0.7 ? 'in-progress' : 'not-started',
        studentParticipation: Math.floor(Math.random() * 100),
        progress: Math.floor(Math.random() * 100),
        assignedBatches: [],
        assignmentDetails: null
      }));

      setChallenges(challengesWithProgress);
    } catch (error) {
      console.error("Error fetching challenges:", error);
      setChallenges([]);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced getAvailableData function with safe array handling
  const getAvailableData = () => {
    if (!institute || !Array.isArray(students) || students.length === 0) {
      return {
        faculties: [],
        departments: [],
        grades: [],
        batches: [],
        sections: [],
        programs: [],
        academicYears: [],
        semesters: []
      };
    }
    
    const safeStudents = students.filter(student => student && typeof student === 'object');
    
    switch (institute.instituteType) {
      case 'university':
        return {
          faculties: [...new Set(safeStudents.map(s => s.faculty).filter(Boolean))],
          departments: [...new Set(safeStudents.map(s => s.department).filter(Boolean))],
          batches: [...new Set(safeStudents.map(s => s.batch).filter(Boolean))],
          programs: [...new Set(safeStudents.map(s => s.program).filter(Boolean))],
          academicYears: [...new Set(safeStudents.map(s => s.academicYear).filter(Boolean))]
        };
      case 'college':
        return {
          departments: [...new Set(safeStudents.map(s => s.department).filter(Boolean))],
          programs: [...new Set(safeStudents.map(s => s.program).filter(Boolean))],
          batches: [...new Set(safeStudents.map(s => s.batch).filter(Boolean))],
          semesters: [...new Set(safeStudents.map(s => s.semester).filter(Boolean).sort())]
        };
      case 'school':
        return {
          grades: [...new Set(safeStudents.map(s => s.grade).filter(Boolean))],
          batches: [...new Set(safeStudents.map(s => s.batch).filter(Boolean))],
          sections: [...new Set(safeStudents.map(s => s.section).filter(Boolean))]
        };
      default:
        return {};
    }
  };

  // Enhanced student matching logic with batch support and safe array handling
  const getMatchingStudents = (assignmentData) => {
    if (!Array.isArray(students)) return [];
    
    return students.filter(student => {
      if (!student || student.status !== 'active') return false;

      switch (assignmentData.assignmentType) {
        case 'university':
          const universityMatch = assignmentData.faculties.length === 0 || 
            assignmentData.faculties.some(f => {
              const facultyMatch = !f.faculty || f.faculty === student.faculty;
              const departmentMatch = !f.departments || f.departments.length === 0 || 
                f.departments.includes(student.department);
              const batchMatch = !f.batches || f.batches.length === 0 || 
                f.batches.includes(student.batch);
              return facultyMatch && departmentMatch && batchMatch;
            });
          
          const programMatch = !assignmentData.programs || assignmentData.programs.length === 0 || 
            assignmentData.programs.includes(student.program);
          
          const academicYearMatch = !assignmentData.academicYears || assignmentData.academicYears.length === 0 || 
            assignmentData.academicYears.includes(student.academicYear);
          
          return universityMatch && programMatch && academicYearMatch;

        case 'college':
          const collegeMatch = !assignmentData.departments || assignmentData.departments.length === 0 ||
            assignmentData.departments.some(d => {
              const deptMatch = !d.name || d.name === student.department;
              const programMatch = !d.programs || d.programs.length === 0 || 
                d.programs.includes(student.program);
              const batchMatch = !d.batches || d.batches.length === 0 || 
                d.batches.includes(student.batch);
              const semesterMatch = !d.semesters || d.semesters.length === 0 || 
                d.semesters.includes(student.semester);
              return deptMatch && programMatch && batchMatch && semesterMatch;
            });
          
          return collegeMatch;

        case 'school':
          const gradeMatch = !assignmentData.grades || assignmentData.grades.length === 0 || 
            assignmentData.grades.includes(student.grade);
          const batchMatch = !assignmentData.batches || assignmentData.batches.length === 0 || 
            assignmentData.batches.includes(student.batch);
          const sectionMatch = !assignmentData.sections || assignmentData.sections.length === 0 || 
            assignmentData.sections.includes(student.section);
          return gradeMatch && batchMatch && sectionMatch;

        default:
          return false;
      }
    });
  };

  // Handle creating new challenge
  const handleCreateChallenge = async () => {
    if (!newChallengeData.title || !newChallengeData.description || !newChallengeData.deadline) {
      alert('Please fill in all required fields: Title, Description, and Deadline');
      return;
    }

    try {
      const challengePayload = {
        ...newChallengeData,
        instituteId,
        createdBy: 'admin',
        status: 'active',
        mandatory: newChallengeData.priority === 'mandatory',
        totalSubmissions: 0,
        approvedSubmissions: 0
      };

      // Mock response for now
      const newChallenge = {
        ...challengePayload,
        _id: `challenge_${Date.now()}`,
        instituteStatus: 'not-started',
        studentParticipation: 0,
        progress: 0,
        assignedBatches: [],
        assignmentDetails: null
      };

      setChallenges(prev => [newChallenge, ...prev]);
      
      setNewChallengeData({
        title: '',
        description: '',
        category: 'environmental',
        priority: 'optional',
        deadline: '',
        requirements: '',
        resources: ''
      });
      setShowCreateModal(false);

      alert('Challenge created successfully! You can now assign it to students.');

    } catch (error) {
      console.error('Error creating challenge:', error);
      alert('Failed to create challenge. Please try again.');
    }
  };

  const handleStartChallenge = (challenge) => {
    setSelectedChallenge(challenge);
    const defaultDeadline = new Date();
    defaultDeadline.setDate(defaultDeadline.getDate() + 30);
    
    setAssignmentData(prev => ({
      ...prev,
      submissionDeadline: defaultDeadline.toISOString().split('T')[0],
      assignmentType: institute?.instituteType || ''
    }));
    setShowAssignmentModal(true);
  };

  const handleConfirmAssignment = async () => {
    if (!selectedChallenge || !instituteId) return;

    try {
      const matchingStudents = getMatchingStudents(assignmentData);
      
      if (matchingStudents.length === 0) {
        alert('No students match the selected criteria. Please adjust your assignment parameters.');
        return;
      }

      // Get actual user ID from your authentication system
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const assignedById = currentUser._id || 'admin';

      const assignmentPayload = {
        challengeId: selectedChallenge._id,
        instituteId: instituteId,
        assignedBy: assignedById,
        assignedByRef: 'Admin',
        assignmentType: assignmentData.assignmentType,
        submissionDeadline: assignmentData.submissionDeadline,
        instructions: assignmentData.instructions,
        facultyCoordinator: assignmentData.facultyCoordinator,
        totalAssignedStudents: matchingStudents.length,
        assignedStudents: matchingStudents.map(s => s._id),
      };

      // Add type-specific data
      switch (assignmentData.assignmentType) {
        case 'university':
          assignmentPayload.faculties = assignmentData.faculties;
          assignmentPayload.programs = assignmentData.programs;
          assignmentPayload.academicYears = assignmentData.academicYears;
          break;
        case 'college':
          assignmentPayload.departments = assignmentData.departments;
          break;
        case 'school':
          assignmentPayload.schoolAssignment = {
            grades: assignmentData.grades,
            batches: assignmentData.batches,
            sections: assignmentData.sections
          };
          break;
      }

      console.log('Final assignment payload:', assignmentPayload);

      // Create assignment in backend
        const assignment = await createChallengeAssignment(instituteId, assignmentPayload);
      
      // Update local state
      const updatedChallenge = {
        ...selectedChallenge,
        instituteStatus: 'in-progress',
        assignedBatches: [...new Set(matchingStudents.map(s => s.batch).filter(Boolean))],
        assignmentDetails: assignment
      };

      setChallenges(prev => 
        prev.map(c => c._id === selectedChallenge._id ? updatedChallenge : c)
      );

      setShowAssignmentModal(false);
      setSelectedChallenge(null);
      resetAssignmentData();

      alert(`Challenge assigned to ${matchingStudents.length} students successfully!`);

    } catch (error) {
      console.error('Error assigning challenge:', error);
      const errorMessage = error.response?.data?.errors 
        ? `Validation errors: ${error.response.data.errors.map(e => e.message).join(', ')}`
        : error.response?.data?.message || error.message;
      
      alert(`Failed to assign challenge: ${errorMessage}`);
    }
  };

  const resetAssignmentData = () => {
    setAssignmentData({
      assignmentType: institute?.instituteType || '',
      faculties: [],
      departments: [],
      grades: [],
      batches: [],
      sections: [],
      programs: [],
      academicYears: [],
      semesters: [],
      submissionDeadline: '',
      instructions: '',
      facultyCoordinator: ''
    });
  };

  const renderAssignmentForm = () => {
    const availableData = getAvailableData();

    switch (assignmentData.assignmentType) {
      case 'university':
        return (
          <UniversityAssignmentForm
            assignmentData={assignmentData}
            setAssignmentData={setAssignmentData}
            availableData={availableData}
          />
        );
      case 'college':
        return (
          <CollegeAssignmentForm
            assignmentData={assignmentData}
            setAssignmentData={setAssignmentData}
            availableData={availableData}
          />
        );
      case 'school':
        return (
          <SchoolAssignmentForm
            assignmentData={assignmentData}
            setAssignmentData={setAssignmentData}
            availableData={availableData}
          />
        );
      default:
        return <div>Select institute type</div>;
    }
  };

  const getAssignmentBreakdown = () => {
    const matchingStudents = getMatchingStudents(assignmentData);
    const batchBreakdown = matchingStudents.reduce((acc, student) => {
      if (!student) return acc;
      const batch = student.batch || 'No Batch';
      if (!acc[batch]) acc[batch] = [];
      acc[batch].push(student);
      return acc;
    }, {});

    return {
      total: matchingStudents.length,
      batchBreakdown,
      batches: Object.keys(batchBreakdown)
    };
  };

  const calculateOverallProgress = (challenge) => {
    return challenge.progress || 0;
  };

  const getStudentParticipationRate = (challenge) => {
    return challenge.studentParticipation || 0;
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

  const filteredChallenges = challenges.filter(challenge =>
    challenge.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    challenge.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Challenge Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Challenge Management</h1>
          <p className="text-gray-600">
            {institute && `${institute.instituteName} - ${institute.instituteType}`}
          </p>
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
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-800">
                {challenges.filter(c => c.instituteStatus === 'in-progress').length}
              </p>
            </div>
            <TrendingUp className="text-orange-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Progress</p>
              <p className="text-2xl font-bold text-gray-800">
                {challenges.length > 0 ? Math.round(challenges.reduce((acc, c) => acc + (c.progress || 0), 0) / challenges.length) : 0}%
              </p>
            </div>
            <BarChart3 className="text-green-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Participation</p>
              <p className="text-2xl font-bold text-gray-800">
                {challenges.length > 0 ? Math.round(challenges.reduce((acc, c) => acc + (c.studentParticipation || 0), 0) / challenges.length) : 0}%
              </p>
            </div>
            <Users className="text-purple-500" size={24} />
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
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredChallenges.map((challenge) => (
          <ChallengeCard
            key={challenge._id}
            challenge={challenge}
            onStartChallenge={handleStartChallenge}
            calculateOverallProgress={calculateOverallProgress}
            getStudentParticipationRate={getStudentParticipationRate}
            getStatusColor={getStatusColor}
          />
        ))}
      </div>

      {/* Empty State */}
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
        <CreateChallengeModal
          newChallengeData={newChallengeData}
          setNewChallengeData={setNewChallengeData}
          onCreate={handleCreateChallenge}
          onCancel={() => {
            setShowCreateModal(false);
            setNewChallengeData({
              title: '',
              description: '',
              category: 'environmental',
              priority: 'optional',
              deadline: '',
              requirements: '',
              resources: ''
            });
          }}
        />
      )}

      {/* Assignment Modal */}
      {showAssignmentModal && selectedChallenge && (
        <AssignmentModal
          selectedChallenge={selectedChallenge}
          assignmentData={assignmentData}
          setAssignmentData={setAssignmentData}
          institute={institute}
          faculties={faculties}
          onConfirm={handleConfirmAssignment}
          onCancel={() => {
            setShowAssignmentModal(false);
            setSelectedChallenge(null);
            resetAssignmentData();
          }}
          renderAssignmentForm={renderAssignmentForm}
          getAssignmentBreakdown={getAssignmentBreakdown}
        />
      )}
    </div>
  );
};

// Create Challenge Modal Component
const CreateChallengeModal = ({ newChallengeData, setNewChallengeData, onCreate, onCancel }) => {
  const categories = [
    "environmental", "energy", "green-cover", "waste-management", "water-conservation", "other"
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">Create New Challenge</h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Challenge Title *
              </label>
              <input
                type="text"
                value={newChallengeData.title}
                onChange={(e) => setNewChallengeData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter challenge title"
                required
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
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={newChallengeData.category}
                  onChange={(e) => setNewChallengeData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority *
                </label>
                <select
                  value={newChallengeData.priority}
                  onChange={(e) => setNewChallengeData(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="optional">Optional</option>
                  <option value="mandatory">Mandatory</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deadline *
              </label>
              <input
                type="date"
                value={newChallengeData.deadline}
                onChange={(e) => setNewChallengeData(prev => ({ ...prev, deadline: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requirements *
              </label>
              <textarea
                value={newChallengeData.requirements}
                onChange={(e) => setNewChallengeData(prev => ({ ...prev, requirements: e.target.value }))}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="What students need to do to complete this challenge"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resources (Optional)
              </label>
              <textarea
                value={newChallengeData.resources}
                onChange={(e) => setNewChallengeData(prev => ({ ...prev, resources: e.target.value }))}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any resources, links, or materials that can help students"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={onCancel}
                className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={onCreate}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                Create Challenge
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// University Assignment Form Component
const UniversityAssignmentForm = ({ assignmentData, setAssignmentData, availableData }) => {
  const [selectedFaculty, setSelectedFaculty] = useState('');

  const handleAddFaculty = () => {
    if (!selectedFaculty) return;
    
    const newFaculty = {
      faculty: selectedFaculty,
      departments: [],
      batches: []
    };
    
    setAssignmentData(prev => ({
      ...prev,
      faculties: [...prev.faculties, newFaculty]
    }));
    setSelectedFaculty('');
  };

  const handleRemoveFaculty = (index) => {
    setAssignmentData(prev => ({
      ...prev,
      faculties: prev.faculties.filter((_, i) => i !== index)
    }));
  };

  const updateFaculty = (index, field, value) => {
    setAssignmentData(prev => ({
      ...prev,
      faculties: prev.faculties.map((faculty, i) => 
        i === index ? { ...faculty, [field]: value } : faculty
      )
    }));
  };

  return (
    <div className="space-y-4">
      {/* University-wide filters */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Programs
          </label>
          <select
            multiple
            value={assignmentData.programs || []}
            onChange={(e) => setAssignmentData(prev => ({
              ...prev,
              programs: Array.from(e.target.selectedOptions, option => option.value)
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            size="3"
          >
            {availableData.programs?.map(program => (
              <option key={program} value={program}>{program}</option>
            )) || []}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Academic Years
          </label>
          <select
            multiple
            value={assignmentData.academicYears || []}
            onChange={(e) => setAssignmentData(prev => ({
              ...prev,
              academicYears: Array.from(e.target.selectedOptions, option => option.value)
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            size="3"
          >
            {availableData.academicYears?.map(year => (
              <option key={year} value={year}>{year}</option>
            )) || []}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Assign to Faculties, Departments and Batches
        </label>
        
        <div className="flex gap-2 mb-4">
          <select
            value={selectedFaculty}
            onChange={(e) => setSelectedFaculty(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Faculty</option>
            {availableData.faculties?.map(faculty => (
              <option key={faculty} value={faculty}>{faculty}</option>
            )) || []}
          </select>
          <button
            onClick={handleAddFaculty}
            disabled={!selectedFaculty}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Add Faculty
          </button>
        </div>

        {assignmentData.faculties?.map((faculty, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 mb-3 bg-gray-50">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium text-gray-800">{faculty.faculty}</h4>
              <button
                onClick={() => handleRemoveFaculty(index)}
                className="text-red-500 hover:text-red-700"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Departments
                </label>
                <select
                  multiple
                  value={faculty.departments || []}
                  onChange={(e) => updateFaculty(index, 'departments', 
                    Array.from(e.target.selectedOptions, option => option.value)
                  )}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  size="3"
                >
                  {availableData.departments?.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  )) || []}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Batches (Graduation Years)
                </label>
                <select
                  multiple
                  value={faculty.batches || []}
                  onChange={(e) => updateFaculty(index, 'batches',
                    Array.from(e.target.selectedOptions, option => option.value)
                  )}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  size="3"
                >
                  {availableData.batches?.map(batch => (
                    <option key={batch} value={batch}>Batch {batch}</option>
                  )) || []}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// College Assignment Form Component
const CollegeAssignmentForm = ({ assignmentData, setAssignmentData, availableData }) => {
  const [selectedDepartment, setSelectedDepartment] = useState('');

  const handleAddDepartment = () => {
    if (!selectedDepartment) return;
    
    const newDepartment = {
      name: selectedDepartment,
      programs: [],
      batches: [],
      semesters: []
    };
    
    setAssignmentData(prev => ({
      ...prev,
      departments: [...prev.departments, newDepartment]
    }));
    setSelectedDepartment('');
  };

  const handleRemoveDepartment = (index) => {
    setAssignmentData(prev => ({
      ...prev,
      departments: prev.departments.filter((_, i) => i !== index)
    }));
  };

  const updateDepartment = (index, field, value) => {
    setAssignmentData(prev => ({
      ...prev,
      departments: prev.departments.map((dept, i) => 
        i === index ? { ...dept, [field]: value } : dept
      )
    }));
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Assign to Departments, Programs, and Batches
        </label>
        
        <div className="flex gap-2 mb-4">
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Department</option>
            {availableData.departments?.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            )) || []}
          </select>
          <button
            onClick={handleAddDepartment}
            disabled={!selectedDepartment}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Add Department
          </button>
        </div>

        {assignmentData.departments?.map((dept, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 mb-3 bg-gray-50">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium text-gray-800">{dept.name}</h4>
              <button
                onClick={() => handleRemoveDepartment(index)}
                className="text-red-500 hover:text-red-700"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Programs
                </label>
                <select
                  multiple
                  value={dept.programs || []}
                  onChange={(e) => updateDepartment(index, 'programs',
                    Array.from(e.target.selectedOptions, option => option.value)
                  )}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  size="2"
                >
                  {availableData.programs?.map(program => (
                    <option key={program} value={program}>{program}</option>
                  )) || []}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Batches (Admission Years)
                </label>
                <select
                  multiple
                  value={dept.batches || []}
                  onChange={(e) => updateDepartment(index, 'batches',
                    Array.from(e.target.selectedOptions, option => option.value)
                  )}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  size="2"
                >
                  {availableData.batches?.map(batch => (
                    <option key={batch} value={batch}>Batch {batch}</option>
                  )) || []}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Semesters
                </label>
                <select
                  multiple
                  value={dept.semesters || []}
                  onChange={(e) => updateDepartment(index, 'semesters',
                    Array.from(e.target.selectedOptions, option => parseInt(option.value))
                  )}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  size="2"
                >
                  {availableData.semesters?.map(sem => (
                    <option key={sem} value={sem}>Sem {sem}</option>
                  )) || []}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// School Assignment Form Component
const SchoolAssignmentForm = ({ assignmentData, setAssignmentData, availableData }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Grades
          </label>
          <select
            multiple
            value={assignmentData.grades || []}
            onChange={(e) => setAssignmentData(prev => ({
              ...prev,
              grades: Array.from(e.target.selectedOptions, option => option.value)
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            size="4"
          >
            {availableData.grades?.map(grade => (
              <option key={grade} value={grade}>{grade}</option>
            )) || []}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Batches (Academic Years)
          </label>
          <select
            multiple
            value={assignmentData.batches || []}
            onChange={(e) => setAssignmentData(prev => ({
              ...prev,
              batches: Array.from(e.target.selectedOptions, option => option.value)
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            size="4"
          >
            {availableData.batches?.map(batch => (
              <option key={batch} value={batch}>Batch {batch}</option>
            )) || []}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sections
          </label>
          <select
            multiple
            value={assignmentData.sections || []}
            onChange={(e) => setAssignmentData(prev => ({
              ...prev,
              sections: Array.from(e.target.selectedOptions, option => option.value)
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            size="4"
          >
            {availableData.sections?.map(section => (
              <option key={section} value={section}>Section {section}</option>
            )) || []}
          </select>
        </div>
      </div>
      
      <div className="text-sm text-gray-600">
        <p>Hold Ctrl/Cmd to select multiple options. Batches typically represent graduation years or academic years.</p>
      </div>
    </div>
  );
};

// Challenge Card Component
const ChallengeCard = ({ challenge, onStartChallenge, calculateOverallProgress, getStudentParticipationRate, getStatusColor }) => {
  const progress = calculateOverallProgress(challenge);
  const participation = getStudentParticipationRate(challenge);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
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
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                challenge.priority === 'mandatory' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {challenge.priority}
              </span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{challenge.description}</p>

      {/* Progress Bars */}
      <div className="space-y-3 mb-4">
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Overall Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Student Participation</span>
            <span>{participation}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${participation}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-2">
          <Calendar size={14} />
          <span>Deadline: {new Date(challenge.deadline).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users size={14} />
          <span>{challenge.totalSubmissions || 0} submissions</span>
        </div>
      </div>

      <div className="flex gap-2 pt-4 border-t border-gray-200">
        {challenge.instituteStatus === 'not-started' && (
          <button
            onClick={() => onStartChallenge(challenge)}
            className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Start Challenge
          </button>
        )}
        {challenge.instituteStatus === 'in-progress' && (
          <button
            className="flex-1 bg-orange-500 text-white py-2 rounded-lg font-medium cursor-not-allowed"
            disabled
          >
            In Progress
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
  );
};

// Assignment Modal Component
const AssignmentModal = ({ selectedChallenge, assignmentData, setAssignmentData, institute, faculties, onConfirm, onCancel, renderAssignmentForm, getAssignmentBreakdown }) => {
  const breakdown = getAssignmentBreakdown();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                Assign Challenge: {selectedChallenge.title}
              </h3>
              <p className="text-gray-600 mt-1">
                Configure assignment for {institute?.instituteType} 
              </p>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="space-y-6">
            {renderAssignmentForm()}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Submission Deadline *
                </label>
                <input
                  type="date"
                  value={assignmentData.submissionDeadline}
                  onChange={(e) => setAssignmentData(prev => ({ ...prev, submissionDeadline: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Faculty Coordinator *
                </label>
                <select
                  value={assignmentData.facultyCoordinator}
                  onChange={(e) => setAssignmentData(prev => ({ ...prev, facultyCoordinator: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Faculty Coordinator</option>
                  {Array.isArray(faculties) && faculties.map(faculty => (
                    <option key={faculty._id} value={faculty._id}>
                      {faculty.name} - {faculty.department || faculty.email}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instructions (Optional)
              </label>
              <textarea
                value={assignmentData.instructions}
                onChange={(e) => setAssignmentData(prev => ({ ...prev, instructions: e.target.value }))}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add specific instructions for students..."
              />
            </div>

            {/* Enhanced Assignment Preview with Batch Breakdown */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Assignment Preview</h4>
              <div className="text-sm text-blue-700">
                <p>This challenge will be assigned to: <strong>{breakdown.total} students</strong></p>
                
                {breakdown.batches.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium">Batch Breakdown:</p>
                    <ul className="list-disc list-inside mt-1">
                      {breakdown.batches.map(batch => (
                        <li key={batch}>
                          Batch {batch}: {breakdown.batchBreakdown[batch].length} students
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <p className="mt-2">Institute Type: <strong>{institute?.instituteType}</strong></p>
                <p>Deadline: <strong>{assignmentData.submissionDeadline}</strong></p>
                {assignmentData.facultyCoordinator && (
                  <p>Faculty Coordinator: <strong>{
                    Array.isArray(faculties) ? faculties.find(f => f._id === assignmentData.facultyCoordinator)?.name || 'Selected' : 'Selected'
                  }</strong></p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={onCancel}
                className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={breakdown.total === 0 || !assignmentData.submissionDeadline || !assignmentData.facultyCoordinator}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Assign to {breakdown.total} Students
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeManagement;