// src/government/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import { Search, Filter, Users, Mail, Phone, Building, MoreVertical, Edit, Trash2, UserPlus } from 'lucide-react';
import { API } from "../utils/api";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [instituteFilter, setInstituteFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

//   const fetchUsers = async () => {
//     try {
//       const res = await API.get('/government/users');
//       setUsers(res.data);
//     } catch (error) {
//       console.error('Error fetching users:', error);
//     } finally {
//       setLoading(false);
//     }
//   };
const fetchUsers = async () => {
  try {
    setLoading(true);

    // Simulate backend delay
    await new Promise((res) => setTimeout(res, 500));

    // --- SAMPLE USERS (you can modify these anytime) ---
    const sampleUsers = [
      {
        _id: "u1",
        name: "Alice Johnson",
        email: "alice.johnson@example.com",
        phone: "555-0123",
        role: "admin",
        status: "active",
        instituteName: "Greenwood College",
      },
      {
        _id: "u2",
        name: "James Walker",
        email: "james.walker@example.com",
        phone: "555-9876",
        role: "faculty",
        status: "active",
        instituteName: "Bright Future Institute",
      },
      {
        _id: "u3",
        name: "Sophia Martinez",
        email: "sophia.m@example.com",
        role: "student",
        status: "inactive",
        instituteName: "Riverdale Academy",
      },
      {
        _id: "u4",
        name: "Michael Chen",
        email: "michael.chen@example.com",
        role: "faculty",
        status: "active",
        instituteName: "Greenwood College",
      },
      {
        _id: "u5",
        name: "Emma Lee",
        email: "emma.lee@example.com",
        role: "student",
        status: "active",
        instituteName: "Bright Future Institute",
      },
      {
        _id: "u6",
        name: "Daniel Brooks",
        email: "daniel.brooks@example.com",
        role: "student",
        status: "suspended",
        instituteName: "Riverdale Academy",
      }
    ];

    setUsers(sampleUsers);
  } catch (error) {
    console.error("Error loading mock users:", error);
  } finally {
    setLoading(false);
  }
};

  const handleEditUser = (userId) => {
    // Implement edit user functionality
    console.log('Edit user:', userId);
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await API.delete(`/government/users/${userId}`);
        fetchUsers(); // Refresh the list
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

//   const filteredUsers = users.filter(user => {
//     const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesRole = roleFilter === 'all' || user.role === roleFilter;
//     const matchesInstitute = instituteFilter === 'all' || user.instituteId === instituteFilter;
    
//     return matchesSearch && matchesRole && matchesInstitute;
//   });

const filteredUsers = users.filter(user => {
  const name = user.name || "";
  const email = user.email || "";
  const instituteName = user.instituteName || "";

  const matchesSearch =
    name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.toLowerCase().includes(searchTerm.toLowerCase());

  const matchesRole =
    roleFilter === "all" || user.role === roleFilter;

  const matchesInstitute =
    instituteFilter === "all" || instituteName === instituteFilter;

  return matchesSearch && matchesRole && matchesInstitute;
});


//   const getInstitutes = () => {
//     const institutes = [...new Set(users.map(user => user.instituteName))];
//     return institutes.filter(Boolean);
//   };

const institutes = [...new Set(users
  .map(user => user.instituteName)
  .filter(Boolean)
)];


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
        <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <UserPlus size={20} />
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="faculty">Faculty</option>
          <option value="student">Student</option>
        </select>
        <select
          value={instituteFilter}
          onChange={(e) => setInstituteFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Institutes</option>
          {/* {getInstitutes().map(institute => (
            <option key={institute} value={institute}>{institute}</option>
          ))} */}
            {/*for dummy testing*/}
            {institutes.map(institute => (
                <option key={institute} value={institute}>{institute}</option>
            ))}
        </select>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <div key={user._id} className="bg-white rounded-xl shadow-lg border-2 border-blue-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                  {user.name?.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{user.name}</h3>
                  <p className="text-sm text-gray-600">{user.role}</p>
                </div>
              </div>
              <div className="relative">
                <button className="p-1 hover:bg-gray-100 rounded">
                  <MoreVertical size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail size={16} />
                <span>{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone size={16} />
                  <span>{user.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Building size={16} />
                <span>{user.instituteName || 'No Institute'}</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                user.status === 'active' 
                  ? 'bg-green-100 text-green-800'
                  : user.status === 'inactive'
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {user.status}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditUser(user._id)}
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDeleteUser(user._id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Users size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">No users found</p>
        </div>
      )}
    </div>
  );
};

export default UserManagement;