// src/institute/FacultyManagement.jsx
import React, { useState, useEffect } from 'react';
import { Search, Plus, Mail, Phone, BookOpen, Users } from 'lucide-react';
import { API } from '../utils/api';

const FacultyManagement = ({ instituteId }) => {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newFaculty, setNewFaculty] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    subjects: ''
  });

  useEffect(() => {
    if (instituteId) fetchFaculty();
  }, [instituteId]);

  const fetchFaculty = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/faculty/institute/${instituteId}`);
      setFaculty(res.data);
    } catch (error) {
      console.error("Error fetching faculty:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFaculty = async () => {
    // Validate required fields
    if (!newFaculty.name || !newFaculty.email || !newFaculty.department) {
      alert("Please fill in all required fields (Name, Email, Department).");
      return;
    }

    try {
      const payload = {
        ...newFaculty,
        subjects: newFaculty.subjects.split(',').map(s => s.trim()),
        instituteId
      };
      const res = await API.post('/faculty', payload);
      setFaculty([...faculty, res.data]); // Add new faculty to state
      setShowModal(false);
      setNewFaculty({ name: '', email: '', phone: '', department: '', subjects: '' });
    } catch (err) {
      console.error("Failed to add faculty:", err);
      alert(err.response?.data?.message || "Failed to add faculty");
    }
  };

  const filteredFaculty = faculty.filter(fac =>
    fac.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterDept === '' || fac.department === filterDept)
  );

  const departments = [...new Set(faculty.map(f => f.department))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Faculty Management</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600"
        >
          <Plus size={20} /> Add Faculty
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search faculty by name..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={filterDept}
              onChange={e => setFilterDept(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Faculty Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFaculty.map(fac => (
          <div key={fac._id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg text-gray-800">{fac.name}</h3>
                <p className="text-blue-500 font-medium">{fac.department}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${fac.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {fac.status}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail size={16} /><span className="text-sm">{fac.email}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone size={16} /><span className="text-sm">{fac.phone}</span>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <BookOpen size={16} /><span className="text-sm font-medium">Subjects</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {fac.subjects.map((subject, idx) => (
                  <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">{subject}</span>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>Joined: {new Date(fac.joinDate).toLocaleDateString()}</span>
              <button className="text-blue-500 hover:text-blue-700 font-medium">View Profile</button>
            </div>
          </div>
        ))}
      </div>

      {filteredFaculty.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Users className="mx-auto text-gray-300 mb-4" size={48} />
          <div className="text-gray-500">No faculty members found</div>
        </div>
      )}

      {/* Add Faculty Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Faculty</h2>
            <input type="text" placeholder="Name" className="w-full border px-3 py-2 rounded mb-2" value={newFaculty.name} onChange={e => setNewFaculty({ ...newFaculty, name: e.target.value })} />
            <input type="email" placeholder="Email" className="w-full border px-3 py-2 rounded mb-2" value={newFaculty.email} onChange={e => setNewFaculty({ ...newFaculty, email: e.target.value })} />
            <input type="text" placeholder="Phone" className="w-full border px-3 py-2 rounded mb-2" value={newFaculty.phone} onChange={e => setNewFaculty({ ...newFaculty, phone: e.target.value })} />
            <input type="text" placeholder="Department" className="w-full border px-3 py-2 rounded mb-2" value={newFaculty.department} onChange={e => setNewFaculty({ ...newFaculty, department: e.target.value })} />
            <input type="text" placeholder="Subjects (comma separated)" className="w-full border px-3 py-2 rounded mb-4" value={newFaculty.subjects} onChange={e => setNewFaculty({ ...newFaculty, subjects: e.target.value })} />

            <div className="flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancel</button>
              <button onClick={handleAddFaculty} className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600">Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyManagement;
