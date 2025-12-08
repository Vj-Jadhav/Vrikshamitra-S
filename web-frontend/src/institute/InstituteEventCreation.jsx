// InstituteEventCreation.jsx
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

export default function InstituteEventCreation() {
  const { user } = useContext(AuthContext);
  const [ngos, setNgos] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    venue: "",
    ngoId: "",
    itemsRequested: "",
    eventType: "tree-planting",
    expectedParticipants: 50,
    coordinatorName: "",
    coordinatorPhone: "",
    coordinatorEmail: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchNgos();
    // Set coordinator info from user data
    if (user) {
      setForm(prev => ({
        ...prev,
        coordinatorName: user.name || "",
        coordinatorEmail: user.email || ""
      }));
    }
  }, [user]);

  async function fetchNgos() {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/api/ngos`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" }
      });
      setNgos(res.data);
    } catch (err) {
      console.error("Fetch NGOs error", err);
      setMessage({
        type: "error",
        text: "Unable to load NGOs. Please try again later."
      });
    }
  }

  function onChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ 
      ...prev, 
      [name]: name === 'expectedParticipants' ? parseInt(value) || 0 : value 
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

      // Make a single API call with combined event and request data
      const response = await axios.post(
        `${BASE_URL}/api/institute/${instituteId}/events`,
        {
          title: form.title,
          description: form.description,
          date: form.date,
          venue: form.venue,
          ngoId: form.ngoId,
          itemsRequested: form.itemsRequested,
          eventType: form.eventType,
          expectedParticipants: form.expectedParticipants,
          coordinatorName: form.coordinatorName,
          coordinatorPhone: form.coordinatorPhone,
          coordinatorEmail: form.coordinatorEmail
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
        text: response.data.message || "Event created and request sent to NGO successfully!"
      });

      // Reset form
      setForm({
        title: "",
        description: "",
        date: "",
        venue: "",
        ngoId: "",
        itemsRequested: "",
        eventType: "tree-planting",
        expectedParticipants: 50,
        coordinatorName: user?.name || "",
        coordinatorPhone: "",
        coordinatorEmail: user?.email || ""
      });

      // Clear success message after 5 seconds
      setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 5000);

    } catch (err) {
      console.error("Error creating event:", err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          "Something went wrong while creating the event.";
      
      // Handle validation errors
      if (err.response?.data?.errors) {
        const validationErrors = err.response.data.errors
          .map(error => `${error.field}: ${error.message}`)
          .join(', ');
        setMessage({
          type: "error",
          text: `Validation errors: ${validationErrors}`
        });
      } else {
        setMessage({
          type: "error",
          text: errorMessage
        });
      }
    } finally {
      setLoading(false);
    }
  }

  // Event types for dropdown
  const eventTypes = [
    { value: 'tree-planting', label: 'Tree Planting' },
    { value: 'cleanup', label: 'Cleanup Drive' },
    { value: 'awareness', label: 'Awareness Campaign' },
    { value: 'workshop', label: 'Workshop/Seminar' },
    { value: 'fundraiser', label: 'Fundraiser' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Institute Event</h2>
        <p className="text-gray-600">Create an eco-event and request support from NGOs</p>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === "success" 
            ? "bg-green-50 text-green-800 border border-green-200" 
            : "bg-red-50 text-red-800 border border-red-200"
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Title *
            </label>
            <input
              name="title"
              value={form.title}
              onChange={onChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="E.g., Annual Tree Plantation Drive"
              maxLength={200}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={onChange}
              required
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="Describe your event, objectives, and expected outcomes..."
              maxLength={2000}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Type *
            </label>
            <select
              name="eventType"
              value={form.eventType}
              onChange={onChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            >
              {eventTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expected Participants *
            </label>
            <input
              type="number"
              name="expectedParticipants"
              value={form.expectedParticipants}
              onChange={onChange}
              required
              min="1"
              max="10000"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={onChange}
              required
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Venue *
            </label>
            <input
              name="venue"
              value={form.venue}
              onChange={onChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="E.g., College Campus, City Park"
              maxLength={500}
            />
          </div>
        </div>

        {/* NGO Selection */}
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">NGO Support Request</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select NGO *
              </label>
              <select
                name="ngoId"
                value={form.ngoId}
                onChange={onChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                <option value="">-- Select an NGO --</option>
                {ngos.map((n) => (
                  <option key={n._id} value={n._id}>
                    {n.name} — {n.location} ({n.focusAreas?.join(', ')})
                  </option>
                ))}
              </select>
              {ngos.length === 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  No NGOs available. Please contact administrator.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Items/Support Requested *
              </label>
              <input
                name="itemsRequested"
                value={form.itemsRequested}
                onChange={onChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="E.g., 500 tree saplings, 100 gardening tools, 50 seed packets"
              />
              <p className="text-sm text-gray-500 mt-1">
                Be specific about quantity and type of support needed
              </p>
            </div>
          </div>
        </div>

        {/* Coordinator Information */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Coordinator Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Coordinator Name *
              </label>
              <input
                name="coordinatorName"
                value={form.coordinatorName}
                onChange={onChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Full name of event coordinator"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Coordinator Email *
              </label>
              <input
                type="email"
                name="coordinatorEmail"
                value={form.coordinatorEmail}
                onChange={onChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="coordinator@institute.edu"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Coordinator Phone
              </label>
              <input
                name="coordinatorPhone"
                value={form.coordinatorPhone}
                onChange={onChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="+91 98765 43210"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition ${
              loading 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Event & Sending Request...
              </span>
            ) : (
              'Create Event & Send Request to NGO'
            )}
          </button>
          
          <p className="text-sm text-gray-500 text-center mt-3">
            The NGO will review your request and respond within 3-5 working days
          </p>
        </div>
      </form>

      {/* Information Section */}
      <div className="mt-10 pt-6 border-t border-gray-200">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">What happens next?</h4>
        <div className="space-y-4 text-gray-600">
          <div className="flex items-start">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              <span className="text-blue-600 font-semibold">1</span>
            </div>
            <p>
              <span className="font-medium">NGO Review:</span> The selected NGO will review your request and either accept or reject it.
            </p>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
              <span className="text-green-600 font-semibold">2</span>
            </div>
            <p>
              <span className="font-medium">Event Approval:</span> Once accepted, the event status changes to "approved" and you can start adding students.
            </p>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
              <span className="text-purple-600 font-semibold">3</span>
            </div>
            <p>
              <span className="font-medium">Student Participation:</span> Use <code className="bg-gray-100 px-2 py-1 rounded text-sm">POST /api/events/:id/students</code> to add students and track their participation.
            </p>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
              <span className="text-yellow-600 font-semibold">4</span>
            </div>
            <p>
              <span className="font-medium">Eco Points:</span> Students receive eco points based on their participation, which can be tracked in their profiles.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}