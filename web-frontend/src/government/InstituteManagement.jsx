// src/government/InstituteManagement.jsx
import React, { useState, useEffect } from 'react';
import { Search, Filter, Building, CheckCircle, XCircle, MoreVertical, MapPin, Users, Info, Mail, Phone, Globe, Calendar, FileText } from 'lucide-react';
import { API } from "../utils/api";

const InstituteManagement = () => {
  const [institutes, setInstitutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInstitute, setSelectedInstitute] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchInstitutes();
  }, []);

  const fetchInstitutes = async () => {
  try {
    setLoading(true);

    const res = await API.get("/auth/");

    const formatted = res.data.data.map(inst => ({
      _id: inst._id,

      // BASIC DETAILS
      name: inst.instituteName,
      type: inst.instituteType,
      location: `${inst.city || ""}, ${inst.state || ""}, ${inst.country || ""}`,

      // CONTACT
      contactEmail: inst.email,
      phone: inst.phone,
      website: inst.website,
      address: inst.address,
      contactPerson: inst.principalName || "N/A",

      // DETAILS
      established: inst.establishedYear,
      accreditation: inst.accreditation,
      description: inst.infrastructure || "No description provided",

      // USERS
      userCount: inst.totalStudents || 0,

      // STATUS
      status:
    inst.approvalStatus === true
      ? "approved"
      : inst.approvalStatus === false
      ? "rejected"
      : "pending",

      // PROGRAMS (based on type)
      programs: inst.programs || inst.courses || inst.grades || [],

      // FACILITIES (if infrastructure is comma-separated)
      facilities: inst.infrastructure
        ? inst.infrastructure.split(",").map(i => i.trim())
        : []
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
      await API.put(`/auth/${instituteId}/approve`);
      fetchInstitutes(); // Refresh the list
    } catch (error) {
      console.error('Error approving institute:', error);
    }
  };

  const handleReject = async (instituteId) => {
    try {
      await API.put(`/auth/${instituteId}/reject`);
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

  const filteredInstitutes = institutes.filter(institute => {
    const matchesSearch = institute.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         institute.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || institute.status === statusFilter;
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
                        <div className="text-sm text-gray-500">{institute.type}</div>
                      </div>
                    </div>
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
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center">
                  <Building className="h-10 w-10 text-blue-500 mr-3" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedInstitute.name}</h3>
                    <p className="text-gray-600">{selectedInstitute.type}</p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle size={24} />
                </button>
              </div>

              {/* Status Badge */}
              <div className="mb-6">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  selectedInstitute.status === 'approved' 
                    ? 'bg-green-100 text-green-800'
                    : selectedInstitute.status === 'pending'
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {selectedInstitute.status.toUpperCase()}
                </span>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Description</h4>
                <p className="text-gray-700">{selectedInstitute.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Information */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Mail size={16} className="text-gray-500 mr-2" />
                      <span className="text-gray-700">{selectedInstitute.contactEmail}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone size={16} className="text-gray-500 mr-2" />
                      <span className="text-gray-700">{selectedInstitute.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <Globe size={16} className="text-gray-500 mr-2" />
                      <span className="text-gray-700">{selectedInstitute.website}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin size={16} className="text-gray-500 mr-2" />
                      <span className="text-gray-700">{selectedInstitute.address}</span>
                    </div>
                    <div className="flex items-center">
                      <Users size={16} className="text-gray-500 mr-2" />
                      <span className="text-gray-700">Contact Person: {selectedInstitute.contactPerson}</span>
                    </div>
                  </div>
                </div>

                {/* Institute Details */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Institute Details</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Calendar size={16} className="text-gray-500 mr-2" />
                      <span className="text-gray-700">Established: {selectedInstitute.established}</span>
                    </div>
                    <div className="flex items-center">
                      <FileText size={16} className="text-gray-500 mr-2" />
                      <span className="text-gray-700">Accreditation: {selectedInstitute.accreditation}</span>
                    </div>
                    <div className="flex items-center">
                      <Users size={16} className="text-gray-500 mr-2" />
                      <span className="text-gray-700">Total Users: {selectedInstitute.userCount}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Programs */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Programs Offered</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedInstitute.programs.map((program, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {program}
                    </span>
                  ))}
                </div>
              </div>

              {/* Facilities */}
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