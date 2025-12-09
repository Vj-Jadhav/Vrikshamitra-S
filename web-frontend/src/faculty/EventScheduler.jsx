import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Plus, X, Clock, Users, Edit, Trash2, UserCheck, Filter, Loader, Search, AlertCircle, CheckCircle } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api/events";

const EventScheduler = ({ userId }) => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRegistrations, setShowRegistrations] = useState(false);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [requests, setRequests] = useState([]); // Pending requests from Institute

  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    description: '',
    location: '',
    maxParticipants: 50
  });

  const [registrationData, setRegistrationData] = useState({
    studentName: '',
    studentId: '',
    email: ''
  });

  // Fetch events from backend
  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    try {
      let url = API_URL;
      const headers = {};
      const token = localStorage.getItem("token");
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      if (userId) {
        // Use the new faculty events endpoint
        // Assuming base URL logic. If API_URL is full path, we might need to adjust.
        // Let's assume API_URL is http://localhost:5000/api/events
        // We need http://localhost:5000/api/faculty/:id/events

        // Construct URL safely
        const baseUrl = API_URL.replace('/api/events', '/api');
        url = `${baseUrl}/faculty/${userId}/events`;
      }

      const res = await axios.get(url, { headers });
      setEvents(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading events');
      console.error("Error loading events", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    if (!userId) return;
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      // Construct URL safely
      const baseUrl = API_URL.replace('/api/events', '/api');
      const url = `${baseUrl}/faculty/${userId}/requests`;

      const res = await axios.get(url, { headers });
      setRequests(res.data);
    } catch (err) {
      console.error("Error fetching requests:", err);
    }
  };

  useEffect(() => {
    fetchEvents();
    if (userId) fetchRequests();
  }, [userId]);

  const handleAcceptRequest = async (requestId) => {
    if (!window.confirm("Accept this event assignment?")) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const baseUrl = API_URL.replace('/api/events', '/api');

      await axios.post(`${baseUrl}/faculty/request/${requestId}/accept`, {}, { headers });

      alert("Request Accepted! Waiting for NGO confirmation.");
      fetchRequests(); // Refresh requests
      fetchEvents();   // Refresh events (if they appear there now)
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to accept");
    } finally {
      setActionLoading(false);
    }
  };

  // Filter and search events
  useEffect(() => {
    let result = events;

    // Apply filter
    switch (filter) {
      case 'upcoming':
        result = result.filter(event => new Date(`${event.date}T${event.time}`) > new Date());
        break;
      case 'past':
        result = result.filter(event => new Date(`${event.date}T${event.time}`) <= new Date());
        break;
      case 'full':
        result = result.filter(event => (event.registrations?.length || 0) >= event.maxParticipants);
        break;
      default:
        break;
    }

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(event =>
        event.title.toLowerCase().includes(term) ||
        event.description.toLowerCase().includes(term) ||
        event.location.toLowerCase().includes(term)
      );
    }

    // Sort by date
    result.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));

    setFilteredEvents(result);
  }, [events, filter, searchTerm]);

  // Create new event
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    try {
      await axios.post(API_URL, newEvent);
      await fetchEvents();
      resetForm();
      setShowCreateModal(false);
      setSuccess('Event created successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating event');
    } finally {
      setActionLoading(false);
    }
  };

  // Update event
  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    try {
      await axios.put(`${API_URL}/${editingEvent._id}`, newEvent);
      await fetchEvents();
      resetForm();
      setShowCreateModal(false);
      setSuccess('Event updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating event');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete event
  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    setActionLoading(true);
    try {
      await axios.delete(`${API_URL}/${eventId}`);
      await fetchEvents();
      setSuccess('Event deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting event');
    } finally {
      setActionLoading(false);
    }
  };

  // Register for event
  const handleRegisterForEvent = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    try {
      await axios.post(`${API_URL}/${selectedEvent._id}/register`, registrationData);
      await fetchEvents();
      setRegistrationData({ studentName: '', studentId: '', email: '' });
      setShowRegistrationForm(false);
      setSuccess('Registered for event successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error registering for event');
    } finally {
      setActionLoading(false);
    }
  };

  // Remove registration
  const handleRemoveRegistration = async (eventId, regId) => {
    if (!window.confirm("Are you sure you want to remove this registration?")) return;

    try {
      await axios.delete(`${API_URL}/${eventId}/registration/${regId}`);
      await fetchEvents();
      setSelectedEvent(prev => ({
        ...prev,
        registrations: prev.registrations.filter(r => r._id !== regId)
      }));
      setSuccess('Registration removed successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error removing registration');
    }
  };

  // Handle CSV Upload
  const handleCsvUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setActionLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_URL}/${selectedEvent._id}/bulk-register`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      await fetchEvents();
      // Force refresh of selected event
      const updatedEvent = events.find(ev => ev._id === selectedEvent._id);
      if (updatedEvent) {
        // If needed, update local state, but fetchEvents should handle it
      }

      setSuccess(res.data.message);
      setShowRegistrations(false);
      setTimeout(() => setSuccess(''), 3000);

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error uploading CSV');
    } finally {
      setActionLoading(false);
      e.target.value = null;
    }
  };

  // Edit modal setup
  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setNewEvent({
      title: event.title,
      date: event.date,
      time: event.time,
      description: event.description,
      location: event.location,
      maxParticipants: event.maxParticipants
    });
    setShowCreateModal(true);
  };

  // View registrations
  const handleViewRegistrations = (event) => {
    setSelectedEvent(event);
    setShowRegistrations(true);
  };

  // Open registration form
  const handleOpenRegistration = (event) => {
    setSelectedEvent(event);
    setShowRegistrationForm(true);
  };

  const resetForm = () => {
    setNewEvent({
      title: '',
      date: '',
      time: '',
      description: '',
      location: '',
      maxParticipants: 50
    });
    setEditingEvent(null);
  };

  const resetRegistrationForm = () => {
    setRegistrationData({
      studentName: '',
      studentId: '',
      email: ''
    });
  };

  // Utility functions
  const getUpcomingEventsCount = () => {
    return events.filter(e => new Date(`${e.date}T${e.time}`) > new Date()).length;
  };

  const isEventFull = (event) => {
    return (event.registrations?.length || 0) >= event.maxParticipants;
  };

  const isEventPast = (event) => {
    return new Date(`${event.date}T${event.time}`) < new Date();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const currentDate = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Calendar className="text-emerald-600" size={32} />
              Event Calendar
            </h1>
            <p className="text-gray-600 mt-1">
              {getUpcomingEventsCount()} upcoming events • {events.length} total
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-colors shadow-lg"
          >
            <Plus size={20} />
            Create Event
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <CheckCircle size={20} />
            {success}
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-xl shadow border">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter */}
            <div className="flex gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">All Events</option>
                <option value="upcoming">Upcoming</option>
                <option value="past">Past</option>
                <option value="full">Full Events</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pending Requests Section */}
        {requests.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-yellow-800 mb-4 flex items-center gap-2">
              <AlertCircle size={24} />
              Pending Event Assignments
            </h2>
            <div className="grid gap-4">
              {requests.map(req => (
                <div key={req._id} className="bg-white p-4 rounded-lg shadow-sm border border-yellow-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{req.instituteName}</h3>
                    <p className="text-gray-600">
                      <strong>Trees:</strong> {req.treeCount} ({req.treeType}) | <strong>Class:</strong> {req.targetGrade}
                    </p>
                    <p className="text-gray-600">
                      <strong>Date:</strong> {req.date ? new Date(req.date).toLocaleDateString() : 'Not set'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleAcceptRequest(req._id)}
                    disabled={actionLoading}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50"
                  >
                    Accept Assignment
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Events List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader className="animate-spin text-emerald-500" size={32} />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border-dashed border-2">
            <Calendar size={48} className="mx-auto text-gray-400" />
            <p className="text-gray-500 mt-4 text-lg">
              {events.length === 0 ? 'No events yet' : 'No events match your search'}
            </p>
            {events.length === 0 && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 bg-emerald-500 text-white px-6 py-2 rounded-lg"
              >
                Create Your First Event
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredEvents.map(event => (
              <div key={event._id} className="bg-white p-6 rounded-xl shadow border hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-bold text-xl text-gray-900">{event.title}</h3>
                      {isEventPast(event) && (
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm">Past</span>
                      )}
                      {isEventFull(event) && !isEventPast(event) && (
                        <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm">Full</span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm flex items-center gap-2 text-gray-600">
                        <Calendar size={16} />
                        {formatDate(event.date)}
                      </p>
                      <p className="text-sm flex items-center gap-2 text-gray-600">
                        <Clock size={16} />
                        {formatTime(event.time)}
                      </p>
                      <p className="text-sm flex items-center gap-2 text-blue-600">
                        📍 {event.location}
                      </p>
                      <p className={`text-sm flex items-center gap-2 ${isEventFull(event) ? 'text-red-600' : 'text-emerald-600'
                        }`}>
                        <Users size={14} />
                        {event.registrations?.length || 0} / {event.maxParticipants} registered
                      </p>
                    </div>

                    {event.description && (
                      <p className="text-gray-600 mt-3">{event.description}</p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
                    {!isEventPast(event) && !isEventFull(event) && (
                      <button
                        onClick={() => handleOpenRegistration(event)}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded flex items-center justify-center gap-1 transition-colors"
                      >
                        <UserCheck size={14} /> Register
                      </button>
                    )}

                    <button
                      onClick={() => handleViewRegistrations(event)}
                      className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded flex items-center justify-center gap-1 transition-colors"
                    >
                      <Users size={14} /> View
                    </button>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditEvent(event)}
                        disabled={actionLoading}
                        className="flex-1 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
                      >
                        <Edit size={14} /> Edit
                      </button>

                      <button
                        onClick={() => handleDeleteEvent(event._id)}
                        disabled={actionLoading}
                        className="flex-1 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Event Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/40 flex justify-center items-center p-4 z-50">
            <div className="bg-white p-6 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-xl text-gray-900">
                  {editingEvent ? "Edit Event" : "Create Event"}
                </h3>
                <X
                  onClick={() => { setShowCreateModal(false); resetForm(); }}
                  className="cursor-pointer text-gray-500 hover:text-gray-700"
                  size={24}
                />
              </div>

              <form
                onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter event title"
                    value={newEvent.title}
                    required
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    placeholder="Describe your event..."
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    rows={3}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    placeholder="Event location"
                    value={newEvent.location}
                    required
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={newEvent.date}
                      required
                      min={currentDate}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time *
                    </label>
                    <input
                      type="time"
                      value={newEvent.time}
                      required
                      onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Participants
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newEvent.maxParticipants}
                    onChange={(e) => setNewEvent({ ...newEvent, maxParticipants: parseInt(e.target.value) || 1 })}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowCreateModal(false); resetForm(); }}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    disabled={actionLoading}
                  >
                    {actionLoading && <Loader className="animate-spin" size={16} />}
                    {editingEvent ? "Update Event" : "Create Event"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Registration Form Modal */}
        {showRegistrationForm && selectedEvent && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-xl text-gray-900">Register for {selectedEvent.title}</h2>
                <X
                  onClick={() => { setShowRegistrationForm(false); resetRegistrationForm(); }}
                  className="cursor-pointer text-gray-500 hover:text-gray-700"
                  size={24}
                />
              </div>

              <form onSubmit={handleRegisterForEvent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={registrationData.studentName}
                    required
                    onChange={(e) => setRegistrationData({ ...registrationData, studentName: e.target.value })}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student ID *
                  </label>
                  <input
                    type="text"
                    value={registrationData.studentId}
                    required
                    onChange={(e) => setRegistrationData({ ...registrationData, studentId: e.target.value })}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={registrationData.email}
                    required
                    onChange={(e) => setRegistrationData({ ...registrationData, email: e.target.value })}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowRegistrationForm(false); resetRegistrationForm(); }}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    disabled={actionLoading}
                  >
                    {actionLoading && <Loader className="animate-spin" size={16} />}
                    Register
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Registrations Modal */}
        {showRegistrations && selectedEvent && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="font-bold text-2xl text-gray-900">{selectedEvent.title} - Registrations</h2>
                  <p className="text-gray-600 mt-1">
                    {selectedEvent.registrations?.length || 0} of {selectedEvent.maxParticipants} registered
                  </p>
                </div>
                <X
                  onClick={() => setShowRegistrations(false)}
                  className="cursor-pointer text-gray-500 hover:text-gray-700"
                  size={24}
                />
              </div>

              {(selectedEvent.registrations?.length || 0) === 0 ? (
                <div className="text-center py-12">
                  <Users size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 text-lg">No registrations yet.</p>
                </div>
              ) : (
                <div className="overflow-y-auto flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedEvent.registrations?.map(reg => (
                      <div key={reg._id} className="border border-gray-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 truncate">{reg.studentName}</p>
                            <p className="text-sm text-gray-600">ID: {reg.studentId}</p>
                            {reg.email && (
                              <p className="text-sm text-blue-600 truncate">{reg.email}</p>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemoveRegistration(selectedEvent._id, reg._id)}
                            className="ml-2 text-red-500 hover:text-red-700 transition-colors"
                            title="Remove registration"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        <p className="text-xs text-gray-500">
                          Registered on {new Date(reg.registeredAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventScheduler;