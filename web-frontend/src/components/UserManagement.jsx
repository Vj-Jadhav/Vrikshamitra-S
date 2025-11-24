import axios from "axios";
import { useEffect, useState } from "react";
import UserManagement from "./UserManagement";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("All");

  // Fetch users
  const fetchUsers = async () => {
    const res = await axios.get("http://localhost:5000/api/users");
    setUsers(res.data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Add, edit, delete handlers
  const handleAddUser = async () => {
    const name = prompt("Enter user name:");
    const email = prompt("Enter user email:");
    const role = prompt("Enter role (Student/Teacher):");
    if (!name || !email || !role) return;
    await axios.post("http://localhost:5000/api/users", { name, email, role });
    fetchUsers();
  };

  const handleEditUser = async (user) => {
    const name = prompt("Edit name:", user.name);
    const role = prompt("Edit role:", user.role);
    await axios.put(`http://localhost:5000/api/users/${user._id}`, { name, role });
    fetchUsers();
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Delete this user?")) {
      await axios.delete(`http://localhost:5000/api/users/${id}`);
      fetchUsers();
    }
  };

  // Filter users
  const filteredUsers = users.filter(
    (u) =>
      (filterRole === "All" || u.role === filterRole) &&
      (u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <UserManagement
      users={filteredUsers}
      searchTerm={searchTerm}
      filterRole={filterRole}
      onSearchChange={setSearchTerm}
      onFilterRoleChange={setFilterRole}
      onAddUser={handleAddUser}
      onEditUser={handleEditUser}
      onDeleteUser={handleDeleteUser}
    />
  );
}
