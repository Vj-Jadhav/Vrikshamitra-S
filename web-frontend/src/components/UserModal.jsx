import React from "react";
import { X, Save } from "lucide-react";

export default function UserModal({
  editingUser,
  newUser,
  onClose,
  onSave,
  onUserChange
}) {
  const currentUser = editingUser || newUser;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">
            {editingUser ? 'Edit User' : 'Add New User'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input
              type="text"
              value={currentUser.name}
              onChange={(e) => onUserChange({...currentUser, name: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={currentUser.email}
              onChange={(e) => onUserChange({...currentUser, email: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
            <select
              value={currentUser.role}
              onChange={(e) => onUserChange({...currentUser, role: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="Student">Student</option>
              <option value="Teacher">Teacher</option>
            </select>
          </div>
          {currentUser.role === 'Student' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">EcoPoints</label>
              <input
                type="number"
                value={currentUser.ecoPoints}
                onChange={(e) => onUserChange({...currentUser, ecoPoints: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          )}
        </div>
        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 hover:shadow-md transition-shadow"
          >
            <Save className="w-4 h-4" />
            <span>{editingUser ? 'Update' : 'Add'} User</span>
          </button>
        </div>
      </div>
    </div>
  );
}