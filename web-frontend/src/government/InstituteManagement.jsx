// src/government/InstituteManagement.jsx
import React, { useState, useEffect } from 'react';
import { Search, Filter, Building, CheckCircle, XCircle, MoreVertical, MapPin, Users, Info, Mail, Phone, Globe, Calendar, FileText, User, Home, BookOpen, GraduationCap } from 'lucide-react';
import { API } from "../utils/api";

const InstituteManagement = () => {
  const [institutes, setInstitutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedInstitute, setSelectedInstitute] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchInstitutes();
  }, []);

  const fetchInstitutes = async () => {
    try {
      setLoading(true);
      const res = await API.get("/institute/");

      const formatted = res.data.data.map(inst => ({
        // BASIC IDENTIFICATION
        _id: inst._id,
        instituteType: inst.instituteType,
        
        // BASIC DETAILS
        name: inst.instituteName,
        instituteCode: inst.instituteCode,
        type: inst.instituteType,
        location: `${inst.city || ""}, ${inst.state || ""}, ${inst.country || ""}`,
        pincode: inst.pincode,

        // CONTACT INFORMATION
        contactEmail: inst.email,
        phone: inst.phone,
        alternatePhone: inst.alternatePhone,
        website: inst.website,
        address: inst.address,

        // PRINCIPAL DETAILS
        contactPerson: inst.principalName,
        principalEmail: inst.principalEmail,
        principalPhone: inst.principalPhone,
        principalQualification: inst.principalQualification,
        principalExperience: inst.principalExperience,

        // INSTITUTE DETAILS
        established: inst.establishedYear,
        accreditation: inst.accreditation,
        affiliation: inst.affiliation,
        campusArea: inst.campusArea,
        academicSession: inst.academicSession,
        workingDays: inst.workingDays || [],

        // STATISTICS
        userCount: inst.totalStudents || 0,
        staffCount: inst.totalStaff || 0,
        facultyCount: inst.totalFaculty || 0,

        // STATUS & VERIFICATION
        status: inst.approvalStatus === true ? "approved" : 
                inst.approvalStatus === false ? "rejected" : "pending",
        isVerified: inst.isVerified,
        isActive: inst.isActive,

        // TYPE-SPECIFIC DATA
        // School specific
        schoolLevel: inst.schoolLevel,
        grades: inst.grades || [],
        board: inst.board,
        
        // College specific
        departments: inst.departments || [],
        courses: inst.courses || [],
        universityAffiliated: inst.universityAffiliated,
        
        // University specific
        faculties: inst.faculties || [],
        programs: inst.programs || [],
        researchCenters: inst.researchCenters || [],

        // FACILITIES (now an array)
        facilities: inst.infrastructure || [],
        
        // DESCRIPTION (fallback)
        description: `A ${inst.instituteType} institution located in ${inst.city || ""}, ${inst.state || ""}. ${inst.accreditation ? `Accredited by ${inst.accreditation}.` : ''}`
      }));

      setInstitutes(formatted);
    } catch (error) {
      console.error("Error fetching from DB:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (instituteId) => {
    try {
      await API.put(`/institute/${instituteId}/approve`);
      fetchInstitutes(); // Refresh the list
    } catch (error) {
      console.error('Error approving institute:', error);
    }
  };

  const handleReject = async (instituteId) => {
    try {
      await API.put(`/institute/${instituteId}/reject`);
      fetchInstitutes(); // Refresh the list
    } catch (error) {
      console.error('Error rejecting institute:', error);
    }
  };

  const handleInfoClick = (institute) => {
    setSelectedInstitute(institute);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedInstitute(null);
  };

  const getInstituteSpecificData = (institute) => {
    switch (institute.instituteType) {
      case 'school':
        return {
          title: 'School Information',
          fields: [
            { label: 'School Level', value: institute.schoolLevel, icon: GraduationCap },
            { label: 'Board', value: institute.board, icon: BookOpen },
            { label: 'Grades', value: institute.grades?.join(', ') || 'N/A', icon: Users }
          ]
        };
      case 'college':
        return {
          title: 'College Information',
          fields: [
            { label: 'University Affiliation', value: institute.universityAffiliated, icon: Building },
            { label: 'Departments', value: institute.departments?.join(', ') || 'N/A', icon: Home },
            { label: 'Courses', value: institute.courses?.join(', ') || 'N/A', icon: BookOpen }
          ]
        };
      case 'university':
        return {
          title: 'University Information',
          fields: [
            { label: 'Programs', value: institute.programs?.join(', ') || 'N/A', icon: BookOpen },
            { label: 'Research Centers', value: institute.researchCenters?.join(', ') || 'N/A', icon: Building },
            { label: 'Faculties', value: institute.faculties?.length || 0, icon: GraduationCap }
          ]
        };
      default:
        return { title: 'Institute Information', fields: [] };
    }
  };

  const filteredInstitutes = institutes.filter(institute => {
    const matchesSearch = institute.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         institute.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         institute.contactEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || institute.status === statusFilter;
    const matchesType = typeFilter === 'all' || institute.instituteType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Institute Management</h2>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search institutes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="school">Schools</option>
            <option value="college">Colleges</option>
            <option value="university">Universities</option>
          </select>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <div className="flex items-center">
            <Building className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Institutes</p>
              <p className="text-2xl font-bold text-gray-900">{institutes.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">
                {institutes.filter(inst => inst.status === 'approved').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
          <div className="flex items-center">
            <Filter className="h-8 w-8 text-orange-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {institutes.filter(inst => inst.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
          <div className="flex items-center">
            <XCircle className="h-8 w-8 text-red-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">
                {institutes.filter(inst => inst.status === 'rejected').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border-2 border-blue-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Institute
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Users
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInstitutes.map((institute) => (
                <tr key={institute._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Building className="h-8 w-8 text-blue-500" />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{institute.name}</div>
                        <div className="text-sm text-gray-500">{institute.instituteCode}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {institute.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <MapPin size={16} className="mr-1" />
                      {institute.location}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {institute.contactEmail}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Users size={16} className="mr-1" />
                      {institute.userCount}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      institute.status === 'approved' 
                        ? 'bg-green-100 text-green-800'
                        : institute.status === 'pending'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {institute.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleInfoClick(institute)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="View Details"
                      >
                        <Info size={20} />
                      </button>
                      {institute.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(institute._id)}
                            className="text-green-600 hover:text-green-900 transition-colors"
                            title="Approve Institute"
                          >
                            <CheckCircle size={20} />
                          </button>
                          <button
                            onClick={() => handleReject(institute._id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Reject Institute"
                          >
                            <XCircle size={20} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Institute Details Modal */}
      {isModalOpen && selectedInstitute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center">
                  <Building className="h-10 w-10 text-blue-500 mr-3" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedInstitute.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-gray-600 capitalize">{selectedInstitute.type}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-500">{selectedInstitute.instituteCode}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle size={24} />
                </button>
              </div>

              {/* Status & Verification Badges */}
              <div className="flex gap-2 mb-6">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  selectedInstitute.status === 'approved' 
                    ? 'bg-green-100 text-green-800'
                    : selectedInstitute.status === 'pending'
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {selectedInstitute.status.toUpperCase()}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  selectedInstitute.isVerified
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {selectedInstitute.isVerified ? 'VERIFIED' : 'NOT VERIFIED'}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  selectedInstitute.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {selectedInstitute.isActive ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Contact Information */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h4>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Mail size={16} className="text-gray-500 mr-3" />
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="text-gray-900">{selectedInstitute.contactEmail}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Phone size={16} className="text-gray-500 mr-3" />
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="text-gray-900">{selectedInstitute.phone}</p>
                          {selectedInstitute.alternatePhone && (
                            <p className="text-gray-600 text-sm">Alt: {selectedInstitute.alternatePhone}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Globe size={16} className="text-gray-500 mr-3" />
                        <div>
                          <p className="text-sm text-gray-600">Website</p>
                          <p className="text-gray-900">{selectedInstitute.website || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <MapPin size={16} className="text-gray-500 mr-3 mt-1" />
                        <div>
                          <p className="text-sm text-gray-600">Address</p>
                          <p className="text-gray-900">{selectedInstitute.address}</p>
                          <p className="text-gray-600 text-sm">
                            {selectedInstitute.location} - {selectedInstitute.pincode}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Principal Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Principal Information</h4>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <User size={16} className="text-gray-500 mr-3" />
                        <div>
                          <p className="text-sm text-gray-600">Principal Name</p>
                          <p className="text-gray-900">{selectedInstitute.contactPerson || 'N/A'}</p>
                        </div>
                      </div>
                      {selectedInstitute.principalEmail && (
                        <div className="flex items-center">
                          <Mail size={16} className="text-gray-500 mr-3" />
                          <div>
                            <p className="text-sm text-gray-600">Principal Email</p>
                            <p className="text-gray-900">{selectedInstitute.principalEmail}</p>
                          </div>
                        </div>
                      )}
                      {selectedInstitute.principalPhone && (
                        <div className="flex items-center">
                          <Phone size={16} className="text-gray-500 mr-3" />
                          <div>
                            <p className="text-sm text-gray-600">Principal Phone</p>
                            <p className="text-gray-900">{selectedInstitute.principalPhone}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Institute Details */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Institute Details</h4>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Calendar size={16} className="text-gray-500 mr-3" />
                        <div>
                          <p className="text-sm text-gray-600">Established Year</p>
                          <p className="text-gray-900">{selectedInstitute.established || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <FileText size={16} className="text-gray-500 mr-3" />
                        <div>
                          <p className="text-sm text-gray-600">Accreditation</p>
                          <p className="text-gray-900">{selectedInstitute.accreditation || 'N/A'}</p>
                        </div>
                      </div>
                      {selectedInstitute.affiliation && (
                        <div className="flex items-center">
                          <Building size={16} className="text-gray-500 mr-3" />
                          <div>
                            <p className="text-sm text-gray-600">Affiliation</p>
                            <p className="text-gray-900">{selectedInstitute.affiliation}</p>
                          </div>
                        </div>
                      )}
                      {selectedInstitute.campusArea && (
                        <div className="flex items-center">
                          <Home size={16} className="text-gray-500 mr-3" />
                          <div>
                            <p className="text-sm text-gray-600">Campus Area</p>
                            <p className="text-gray-900">{selectedInstitute.campusArea}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Statistics */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Statistics</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <Users className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                        <p className="text-lg font-bold text-gray-900">{selectedInstitute.userCount}</p>
                        <p className="text-xs text-gray-600">Students</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <User className="h-6 w-6 text-green-600 mx-auto mb-1" />
                        <p className="text-lg font-bold text-gray-900">{selectedInstitute.staffCount}</p>
                        <p className="text-xs text-gray-600">Staff</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <GraduationCap className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                        <p className="text-lg font-bold text-gray-900">{selectedInstitute.facultyCount}</p>
                        <p className="text-xs text-gray-600">Faculty</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Type-specific Information */}
              {selectedInstitute && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    {getInstituteSpecificData(selectedInstitute).title}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getInstituteSpecificData(selectedInstitute).fields.map((field, index) => (
                      <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <field.icon size={16} className="text-gray-500 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">{field.label}</p>
                          <p className="text-gray-900">{field.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Facilities */}
              {selectedInstitute.facilities.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Facilities</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedInstitute.facilities.map((facility, index) => (
                      <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        {facility}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Working Days */}
              {selectedInstitute.workingDays.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Working Days</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedInstitute.workingDays.map((day, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {day}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                {selectedInstitute.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        handleApprove(selectedInstitute._id);
                        closeModal();
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Approve Institute
                    </button>
                    <button
                      onClick={() => {
                        handleReject(selectedInstitute._id);
                        closeModal();
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Reject Institute
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstituteManagement;