// InstituteEventCreation.jsx
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { API } from "../utils/api";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function InstituteEventCreation() {
  const { user } = useContext(AuthContext);
  const [faculties, setFaculties] = useState([]);
  const [form, setForm] = useState({
    treeType: "Mixed",
    treeCount: "",
    assignedFaculty: "",
    targetGrade: "",
    date: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (user && (user._id || user.id)) {
      fetchFaculties(user._id || user.id);
    }
  }, [user]);

  const fetchFaculties = async (instId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/api/institute/${instId}/faculty`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.success) {
        setFaculties(res.data.data);
      }
    } catch (err) {
      console.error("Fetch Faculties error", err);
    }
  };

  function onChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token");
      const instituteId = user?.instituteId || user?._id;

      if (!instituteId) {
        throw new Error("Institute information not found. Please log in again.");
      }

      await axios.post(
        `${BASE_URL}/api/institute/planting-request/create`,
        {
          instituteId,
          instituteName: user.name || user.instituteName,
          pincode: user.pincode || "000000", // Should get from profile if missing
          treeType: form.treeType,
          treeCount: Number(form.treeCount),
          assignedFaculty: form.assignedFaculty,
          targetGrade: form.targetGrade,
          date: form.date
        },
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            'Content-Type': 'application/json'
          }
        }
      );

      setMessage({
        type: "success",
        text: "Event Request created! Assigned Faculty has been notified."
      });

      // Reset form
      setForm({
        treeType: "Mixed",
        treeCount: "",
        assignedFaculty: "",
        targetGrade: "",
        date: ""
      });

      setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 5000);

    } catch (err) {
      console.error("Error creating request:", err);
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to create event request."
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Create New Event Request</h2>
        <p className="text-gray-600">
          Initiate a new Plantation Drive by defining the scope and assigning a Faculty Coordinator.
        </p>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${message.type === "success"
            ? "bg-green-50 text-green-800 border border-green-200"
            : "bg-red-50 text-red-800 border border-red-200"
          }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Faculty Coordinator *
            </label>
            <select
              name="assignedFaculty"
              value={form.assignedFaculty}
              onChange={onChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="">-- Choose Faculty --</option>
              {faculties.map(fac => (
                <option key={fac._id} value={fac._id}>
                  {fac.name} ({fac.department})
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              They will be responsible for accepting this request and coordinating with NGOs.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date of Event *
            </label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={onChange}
              required
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Grade/Class
            </label>
            <input
              type="text"
              name="targetGrade"
              placeholder="e.g. Class 9A or CS Dept"
              value={form.targetGrade}
              onChange={onChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Trees *
            </label>
            <input
              type="number"
              name="treeCount"
              value={form.treeCount}
              onChange={onChange}
              required
              min="1"
              placeholder="Ex: 50"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Tree Type
            </label>
            <select
              name="treeType"
              value={form.treeType}
              onChange={onChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="Mixed">Mixed (Recommended)</option>
              <option value="Neem">Neem</option>
              <option value="Peepal">Peepal</option>
              <option value="Banyan">Banyan</option>
              <option value="Mango">Mango</option>
              <option value="Ashoka">Ashoka</option>
            </select>
          </div>

        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition ${loading
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
              }`}
          >
            {loading ? "Processing..." : "Create Request"}
          </button>
        </div>
      </form>

      <div className="mt-10 pt-6 border-t border-gray-200">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">Workflow Steps</h4>
        <div className="space-y-4 text-gray-600">
          <div className="flex items-start">
            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-3 text-sm text-blue-600 font-bold">1</div>
            <p>You create this request and assign a Faculty.</p>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-yellow-100 flex items-center justify-center mr-3 text-sm text-yellow-600 font-bold">2</div>
            <p>Faculty accepts the request from their Dashboard.</p>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mr-3 text-sm text-green-600 font-bold">3</div>
            <p>Request becomes visible to local NGOs. An NGO accepts it.</p>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center mr-3 text-sm text-purple-600 font-bold">4</div>
            <p>Event is confirmed! Faculty executes the drive.</p>
          </div>
        </div>
      </div>
    </div>
  );
}