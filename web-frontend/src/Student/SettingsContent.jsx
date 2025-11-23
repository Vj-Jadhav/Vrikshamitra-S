import React, { useState, useEffect } from "react";
import { Calendar, MapPin, Clock, Users, UserCheck, X, AlertCircle, CheckCircle, Loader, Search } from "lucide-react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api/events";

const EventSchedulerStudent = ({ studentId }) => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registration, setRegistration] = useState({
    studentId: studentId || "",
    studentName: "",
    email: "",
    phone: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch events
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(API_URL);
      setEvents(data);
    } catch (err) {
      console.error("Error fetching events:", err);
      setErrorMessage("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Check if student is already registered for an event
  const isAlreadyRegistered = (event) => {
    if (!studentId) return false;
    return event.registrations.some((r) => r.studentId === studentId);
  };

  // Get user's registration info for an event
  const getUserRegistration = (event) => {
    if (!studentId) return null;
    return event.registrations.find((r) => r.studentId === studentId);
  };

  // Filter and search events
  useEffect(() => {
    let result = events;

    // Apply filter
    const now = new Date();
    switch (filter) {
      case 'upcoming':
        result = result.filter(event => new Date(`${event.date}T${event.time}`) > now);
        break;
      case 'past':
        result = result.filter(event => new Date(`${event.date}T${event.time}`) <= now);
        break;
      case 'registered':
        result = result.filter(event => isAlreadyRegistered(event));
        break;
      case 'available':
        result = result.filter(event => 
          new Date(`${event.date}T${event.time}`) > now && 
          !isAlreadyRegistered(event) &&
          event.registrations.length < event.maxParticipants
        );
        break;
      default:
        break;
    }

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(event => 
        event.title.toLowerCase().includes(term) ||
        event.description?.toLowerCase().includes(term) ||
        event.location?.toLowerCase().includes(term)
      );
    }

    // Sort by date (upcoming first)
    result.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
    
    setFilteredEvents(result);
  }, [events, filter, searchTerm, studentId]);

  // Get registration status for an event
  const getRegistrationStatus = (event) => {
    if (isAlreadyRegistered(event)) {
      return "registered";
    }
    if (event.registrations.length >= event.maxParticipants) {
      return "full";
    }
    if (new Date(`${event.date}T${event.time}`) <= new Date()) {
      return "past";
    }
    return "available";
  };

  // Handle registration
  const handleRegister = async () => {
    if (!registration.studentId || !registration.studentName || !registration.email) {
      setErrorMessage("Please fill in all required fields");
      return;
    }

    // Double-check if already registered (in case of multiple tabs/windows)
    if (isAlreadyRegistered(selectedEvent)) {
      setErrorMessage("You are already registered for this event");
      return;
    }

    setActionLoading(true);
    setErrorMessage("");
    
    try {
      const res = await axios.post(`${API_URL}/${selectedEvent._id}/register`, registration);

      // Update events state to reflect new registration immediately
      setEvents((prevEvents) =>
        prevEvents.map((evt) =>
          evt._id === selectedEvent._id ? res.data : evt
        )
      );

      setShowRegisterModal(false);
      setRegistration({ 
        studentId: studentId || "", 
        studentName: "", 
        email: "", 
        phone: "" 
      });
      
      setSuccessMessage(`Successfully registered for ${selectedEvent.title}!`);
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err) {
      if (err.response && err.response.data.message) {
        if (err.response.data.message.includes("already registered")) {
          // If backend also detects duplicate, update local state
          fetchEvents(); // Refresh to get latest data
          setErrorMessage("You are already registered for this event");
        } else {
          setErrorMessage(err.response.data.message);
        }
      } else {
        setErrorMessage("Registration failed. Please try again.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format time
  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get available spots
  const getAvailableSpots = (event) => {
    return event.maxParticipants - event.registrations.length;
  };

  // Get button text and styles based on event status
  const getButtonConfig = (event) => {
    const status = getRegistrationStatus(event);
    const userRegistration = getUserRegistration(event);
    
    switch (status) {
      case "registered":
        return {
          text: "Already Registered",
          subtitle: userRegistration ? `Registered on ${new Date(userRegistration.registeredAt).toLocaleDateString()}` : "You're registered",
          className: "bg-green-100 text-green-700 border border-green-300 cursor-default",
          icon: <CheckCircle size={16} />,
          disabled: true
        };
      case "full":
        return {
          text: "Event Full",
          subtitle: "No spots available",
          className: "bg-red-100 text-red-700 border border-red-300 cursor-default",
          icon: <Users size={16} />,
          disabled: true
        };
      case "past":
        return {
          text: "Event Ended",
          subtitle: "This event has already occurred",
          className: "bg-gray-100 text-gray-500 border border-gray-300 cursor-default",
          icon: <Clock size={16} />,
          disabled: true
        };
      default:
        return {
          text: "Register Now",
          subtitle: `${getAvailableSpots(event)} spots available`,
          className: "bg-emerald-500 hover:bg-emerald-600 text-white border border-emerald-500 cursor-pointer",
          icon: <UserCheck size={16} />,
          disabled: false
        };
    }
  };

  const openRegistrationModal = (event) => {
    // Prevent opening modal if already registered
    if (isAlreadyRegistered(event)) {
      setErrorMessage("You are already registered for this event");
      return;
    }

    setSelectedEvent(event);
    setShowRegisterModal(true);
    setErrorMessage("");
    
    // Pre-fill student ID if available
    if (studentId && !registration.studentId) {
      setRegistration(prev => ({ ...prev, studentId }));
    }
  };

  const closeRegistrationModal = () => {
    setShowRegisterModal(false);
    setRegistration({ 
      studentId: studentId || "", 
      studentName: "", 
      email: "", 
      phone: "" 
    });
    setErrorMessage("");
  };

  // Get user's registered events count
  const getRegisteredEventsCount = () => {
    return events.filter(event => isAlreadyRegistered(event)).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin text-emerald-500 mx-auto mb-4" size={32} />
          <p className="text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Calendar className="text-emerald-600" size={32} />
              Event Calendar
            </h1>
            <p className="text-gray-600 mt-1">
              Discover and register for upcoming events
              {studentId && (
                <span className="ml-2 text-emerald-600 font-semibold">
                  - {getRegisteredEventsCount()} events registered
                </span>
              )}
            </p>
          </div>
          
          {studentId && (
            <div className="bg-white px-4 py-2 rounded-lg border shadow-sm">
              <p className="text-sm text-gray-600">
                Student ID: <span className="font-semibold text-emerald-600">{studentId}</span>
              </p>
            </div>
          )}
        </div>

        {/* Alerts */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle size={20} />
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <CheckCircle size={20} />
            {successMessage}
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
                  placeholder="Search events by title, description, or location..."
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
                <option value="upcoming">Upcoming Events</option>
                <option value="available">Available to Register</option>
                <option value="registered">My Registrations</option>
                <option value="past">Past Events</option>
              </select>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border-dashed border-2">
            <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">
              {events.length === 0 ? 'No events available yet' : 'No events match your search'}
            </p>
            {events.length > 0 && (
              <p className="text-gray-400 mt-2">Try changing your filters or search term</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const buttonConfig = getButtonConfig(event);
              const availableSpots = getAvailableSpots(event);
              const isPast = new Date(`${event.date}T${event.time}`) <= new Date();
              const userRegistration = getUserRegistration(event);

              return (
                <div 
                  key={event._id} 
                  className={`bg-white rounded-xl shadow border hover:shadow-md transition-all duration-200 ${
                    isPast ? 'opacity-75' : ''
                  } ${isAlreadyRegistered(event) ? 'ring-2 ring-green-200' : ''}`}
                >
                  <div className="p-6">
                    {/* Event Header */}
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-xl text-gray-900 leading-tight">
                        {event.title}
                      </h3>
                      {isAlreadyRegistered(event) && (
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1">
                          <CheckCircle size={12} />
                          Registered
                        </span>
                      )}
                    </div>

                    {/* Event Description */}
                    {event.description && (
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {event.description}
                      </p>
                    )}

                    {/* Event Details */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-blue-600">
                        <MapPin size={16} />
                        <span className="text-sm">{event.location || "Location TBA"}</span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={16} />
                        <span className="text-sm">{formatDate(event.date)}</span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock size={16} />
                        <span className="text-sm">{formatTime(event.time)}</span>
                      </div>

                      <div className={`flex items-center gap-2 ${
                        availableSpots === 0 ? 'text-red-600' : 'text-purple-600'
                      }`}>
                        <Users size={16} />
                        <span className="text-sm font-semibold">
                          {availableSpots} of {event.maxParticipants} spots available
                        </span>
                      </div>

                      {/* Registration Date (if registered) */}
                      {userRegistration && (
                        <div className="flex items-center gap-2 text-green-600 text-sm">
                          <CheckCircle size={14} />
                          Registered on {new Date(userRegistration.registeredAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    {/* Register Button */}
                    <div className="mt-4">
                      <button
                        onClick={() => openRegistrationModal(event)}
                        disabled={buttonConfig.disabled}
                        className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                          buttonConfig.disabled 
                            ? buttonConfig.className 
                            : `${buttonConfig.className} hover:scale-[1.02] transform`
                        }`}
                      >
                        {buttonConfig.icon}
                        {buttonConfig.text}
                      </button>
                      {buttonConfig.subtitle && (
                        <p className={`text-xs text-center mt-2 ${
                          buttonConfig.disabled ? 'text-gray-500' : 'text-emerald-600'
                        }`}>
                          {buttonConfig.subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Registration Modal */}
        {showRegisterModal && selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
            <div className="bg-white w-full max-w-md rounded-xl shadow-lg">
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Register for Event
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{selectedEvent.title}</p>
                </div>
                <button
                  onClick={closeRegistrationModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={actionLoading}
                >
                  <X size={24} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {errorMessage && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
                    <AlertCircle size={16} />
                    {errorMessage}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Student ID *
                    </label>
                    <input
                      type="text"
                      value={registration.studentId}
                      onChange={(e) =>
                        setRegistration({ ...registration, studentId: e.target.value })
                      }
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Enter your student ID"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={registration.studentName}
                      onChange={(e) =>
                        setRegistration({ ...registration, studentName: e.target.value })
                      }
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={registration.email}
                      onChange={(e) =>
                        setRegistration({ ...registration, email: e.target.value })
                      }
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={registration.phone}
                      onChange={(e) =>
                        setRegistration({ ...registration, phone: e.target.value })
                      }
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 p-6 border-t">
                <button
                  onClick={closeRegistrationModal}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRegister}
                  disabled={actionLoading}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {actionLoading && <Loader className="animate-spin" size={16} />}
                  Confirm Registration
                </button>
              </div>
            </div>
          </div>
                )}
      </div>
    </div>
  );
};

export default EventSchedulerStudent;

