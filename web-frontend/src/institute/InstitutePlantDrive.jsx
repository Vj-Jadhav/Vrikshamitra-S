import React, { useEffect, useState } from "react";
import axios from "axios";

const API = process.env.REACT_APP_BASE_URL;

function InstitutePlantDrive() {
  const [targets, setTargets] = useState([]);
  const [filteredTargets, setFilteredTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [institutePincode, setInstitutePincode] = useState(null);

  const [eventForm, setEventForm] = useState({
    targetId: "",
    treesAccepted: "",
    eventTitle: "",
    description: "",
    date: "",
    venue: "",
  });

  const fetchInstituteData = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("Token:", token);

      // Decode the token to see what's in it
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          console.log("Token payload:", payload);
          console.log("User ID in token:", payload.id);
          console.log("Role in token:", payload.role);
        } catch (e) {
          console.error("Failed to decode token:", e);
        }
      }

      if (!token) {
        alert("Please login first");
        window.location.href = "/login";
        return;
      }

      const res = await axios.get(`${API}/api/institute/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("API Response:", res.data);

      if (res.data && res.data.success && res.data.data) {
        const pincode = res.data.data.pincode;
        console.log("Pincode from response:", pincode);

        if (pincode) {
          setInstitutePincode(pincode);
          return pincode;
        } else {
          console.warn("No pincode found. Full data:", res.data.data);
        }
      }
    } catch (err) {
      console.error("❌ Failed to fetch institute data:");
      console.error("Status:", err.response?.status);
      console.error("Error data:", err.response?.data);
    }
    return null;
  };

  // fetch govt planting targets
  const fetchTargets = async () => {
    setLoading(true);
    try {
      // First get institute pincode
      const pincode = await fetchInstituteData();

      if (!pincode) {
        alert(
          "Unable to fetch institute location. Please update your institute profile with a pincode."
        );
        setLoading(false);
        return;
      }

      // Try to fetch planting targets
      try {
        const res = await axios.get(`${API}/api/planting-targets`, {
          params: { pincode }
        });

        // Check response structure
        if (res.data && res.data.success && res.data.data) {
          const allTargets = res.data.data;
          setTargets(allTargets);
          setFilteredTargets(allTargets); // Backend filters by pincode, so all results are relevant

          if (allTargets.length === 0) {
            // If no exact match, maybe try fetching by just area prefix manually or tell user
            // For now, let's keep it simple as backend does exact match.
            // If we want nearby, we'd need another API call or backend logic update.
            // Let's stick to exact match as per request "same pincode".
          }
        } else {
          console.warn(
            "Unexpected response structure from planting-targets:",
            res.data
          );
          alert("No planting drives available at the moment.");
        }
      } catch (targetsError) {
        console.error("Error fetching planting targets:", targetsError);

        // If the endpoint doesn't exist, show a fallback message
        if (targetsError.response && targetsError.response.status === 404) {
          alert(
            "Planting targets feature is not available yet. Please check back later."
          );
        } else {
          alert("Failed to load planting drives. Please try again later.");
        }
      }
    } catch (err) {
      console.error("Failed to load Plant Drive data:", err);
      alert("Failed to load Plant Drive data");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchTargets();
  }, []);

  // If user wants to search by different pincode (optional)
  const searchByPincode = (pincode) => {
    if (!pincode || pincode.length !== 6) {
      alert("Enter valid 6-digit pincode");
      return;
    }

    const list = targets.filter((t) => t.pincode === pincode);
    if (list.length === 0) {
      // Show nearby pincodes
      const pincodePrefix = pincode.substring(0, 3);
      const nearbyList = targets.filter((t) =>
        t.pincode.startsWith(pincodePrefix)
      );
      setFilteredTargets(nearbyList);
      if (nearbyList.length === 0) {
        alert("No drives found in this area. Showing all available drives.");
        setFilteredTargets(targets.slice(0, 5)); // Show first 5 drives
      }
    } else {
      setFilteredTargets(list);
    }
  };

  const handleAcceptDrive = async (target) => {
    const num = Number(eventForm.treesAccepted);

    if (!num || num <= 0) {
      alert("Enter valid number of trees to accept");
      return;
    }
    if (num > target.requiredPlants) {
      alert("Cannot accept more trees than required");
      return;
    }

    setAccepting(true);

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API}/api/institute/plant-drive/accept`,
        {
          targetId: target._id,
          treesAccepted: num,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Drive accepted! Now create event.");
      setEventForm((prev) => ({ ...prev, targetId: target._id }));
    } catch (err) {
      console.error(err);
      alert("Failed to accept drive");
    }

    setAccepting(false);
  };

  const handleCreateEvent = async () => {
    const { targetId, eventTitle, description, date, venue } = eventForm;

    if (!targetId || !eventTitle || !description || !date || !venue) {
      alert("Fill all event fields");
      return;
    }

    setCreatingEvent(true);

    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API}/api/institute/events/create`, eventForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Event created successfully!");

      // reset form
      setEventForm({
        targetId: "",
        treesAccepted: "",
        eventTitle: "",
        description: "",
        date: "",
        venue: "",
      });

      // Refresh the drives list
      fetchTargets();
    } catch (err) {
      console.error(err);
      alert("Failed to create event");
    }

    setCreatingEvent(false);
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerContainer}>
        <h1 style={styles.header}>🌱 Institute Plantation Drive</h1>
        {institutePincode && (
          <div style={styles.pincodeBadge}>
            📍 Pincode: <strong>{institutePincode}</strong>
          </div>
        )}
      </div>

      {/* Loading state */}
      {loading ? (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p>Loading available plantation drives...</p>
        </div>
      ) : (
        <>
          {/* Optional search for other pincodes */}
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>
              Looking for drives in another area?
            </h2>
            <div style={styles.searchContainer}>
              <input
                type="text"
                placeholder="Enter different pincode"
                maxLength={6}
                onChange={(e) => searchByPincode(e.target.value)}
                style={styles.input}
              />
              <small style={styles.helperText}>
                Your institute pincode: {institutePincode}
              </small>
            </div>
          </div>

          {/* Show filtered drives automatically */}
          {filteredTargets.length > 0 ? (
            <div style={styles.card}>
              <div style={styles.drivesHeader}>
                <h2>Available Drives Near You</h2>
                <span style={styles.countBadge}>
                  {filteredTargets.length} drive
                  {filteredTargets.length > 1 ? "s" : ""} found
                </span>
              </div>

              {filteredTargets.map((t) => (
                <div key={t._id} style={styles.driveBox}>
                  <div style={styles.driveHeader}>
                    <h3>
                      {t.location}, {t.city}
                    </h3>
                    <span style={styles.pincodeTag}>📌 {t.pincode}</span>
                  </div>

                  <div style={styles.driveDetails}>
                    <div style={styles.detailItem}>
                      <span style={styles.label}>🌳 Required Plants:</span>
                      <span style={styles.value}>{t.requiredPlants}</span>
                    </div>
                    <div style={styles.detailItem}>
                      <span style={styles.label}>⏳ Deadline:</span>
                      <span style={styles.value}>{formatDate(t.deadline)}</span>
                    </div>
                    <div style={styles.detailItem}>
                      <span style={styles.label}>
                        🏢 Government Department:
                      </span>
                      <span style={styles.value}>
                        {t.department || "Not specified"}
                      </span>
                    </div>
                  </div>

                  <div style={styles.acceptSection}>
                    <input
                      type="number"
                      placeholder="Trees you want to plant"
                      value={eventForm.treesAccepted}
                      onChange={(e) =>
                        setEventForm({
                          ...eventForm,
                          treesAccepted: e.target.value,
                        })
                      }
                      style={styles.numberInput}
                      min="1"
                      max={t.requiredPlants}
                    />

                    <button
                      disabled={accepting}
                      onClick={() => handleAcceptDrive(t)}
                      style={styles.acceptBtn}
                    >
                      {accepting ? "Accepting..." : "✅ Accept Drive"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.card}>
              <div style={styles.noDrives}>
                <h3>No drives found in your area</h3>
                <p>
                  There are currently no government plantation drives in
                  pincode: {institutePincode}
                </p>
                <p>
                  Check back later or contact local authorities for new drives.
                </p>
              </div>
            </div>
          )}

          {/* Create Event Form (only shows when a drive is accepted) */}
          {eventForm.targetId && (
            <div style={styles.card}>
              <h2 style={styles.sectionTitle}>Create Plantation Event</h2>

              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Event Title *</label>
                  <input
                    type="text"
                    placeholder="e.g., Green Campus Initiative 2024"
                    value={eventForm.eventTitle}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, eventTitle: e.target.value })
                    }
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Event Date *</label>
                  <input
                    type="date"
                    value={eventForm.date}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, date: e.target.value })
                    }
                    style={styles.input}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Venue *</label>
                  <input
                    type="text"
                    placeholder="e.g., College Campus Ground"
                    value={eventForm.venue}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, venue: e.target.value })
                    }
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroupFull}>
                  <label style={styles.label}>Description *</label>
                  <textarea
                    placeholder="Describe your plantation event..."
                    value={eventForm.description}
                    onChange={(e) =>
                      setEventForm({
                        ...eventForm,
                        description: e.target.value,
                      })
                    }
                    style={styles.textarea}
                    rows="4"
                  />
                </div>
              </div>

              <button
                disabled={creatingEvent}
                onClick={handleCreateEvent}
                style={styles.createButton}
              >
                {creatingEvent ? "Creating Event..." : "🎉 Create Event"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default InstitutePlantDrive;

const styles = {
  container: {
    padding: "30px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  headerContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    flexWrap: "wrap",
    gap: "15px",
  },
  header: {
    fontSize: "2rem",
    color: "#2d6a4f",
    margin: 0,
  },
  pincodeBadge: {
    background: "#e8f5e9",
    padding: "8px 16px",
    borderRadius: "20px",
    fontSize: "0.9rem",
    color: "#2d6a4f",
    border: "1px solid #c8e6c9",
  },
  card: {
    background: "#fff",
    padding: "25px",
    borderRadius: "12px",
    marginBottom: "25px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 20px",
    textAlign: "center",
  },
  spinner: {
    width: "50px",
    height: "50px",
    border: "5px solid #f3f3f3",
    borderTop: "5px solid #2d6a4f",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "20px",
  },
  sectionTitle: {
    marginTop: "0",
    color: "#2d6a4f",
    fontSize: "1.5rem",
  },
  searchContainer: {
    maxWidth: "400px",
  },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    marginTop: "8px",
    marginBottom: "8px",
    fontSize: "16px",
    boxSizing: "border-box",
  },
  numberInput: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    width: "200px",
    marginRight: "15px",
  },
  textarea: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "16px",
    fontFamily: "inherit",
    boxSizing: "border-box",
  },
  helperText: {
    color: "#666",
    fontSize: "0.85rem",
    display: "block",
    marginTop: "5px",
  },
  drivesHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "10px",
  },
  countBadge: {
    background: "#2d6a4f",
    color: "white",
    padding: "5px 12px",
    borderRadius: "20px",
    fontSize: "0.9rem",
  },
  driveBox: {
    background: "#f8fdf9",
    padding: "20px",
    borderRadius: "10px",
    marginBottom: "20px",
    border: "1px solid #e0f2e1",
  },
  driveHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "15px",
    flexWrap: "wrap",
    gap: "10px",
  },
  pincodeTag: {
    background: "#e3f2fd",
    color: "#1976d2",
    padding: "4px 10px",
    borderRadius: "15px",
    fontSize: "0.85rem",
  },
  driveDetails: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "15px",
    marginBottom: "20px",
  },
  detailItem: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  label: {
    fontSize: "0.9rem",
    color: "#666",
    fontWeight: "500",
  },
  value: {
    fontSize: "1rem",
    color: "#333",
    fontWeight: "600",
  },
  acceptSection: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "15px",
    marginTop: "15px",
  },
  acceptBtn: {
    background: "#40916c",
    color: "white",
    padding: "12px 24px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "16px",
    transition: "background 0.3s",
    minWidth: "160px",
  },
  noDrives: {
    textAlign: "center",
    padding: "40px 20px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
    marginBottom: "25px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
  },
  formGroupFull: {
    gridColumn: "1 / -1",
  },
  createButton: {
    background: "#2d6a4f",
    color: "white",
    padding: "15px 30px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontSize: "18px",
    fontWeight: "600",
    width: "100%",
    maxWidth: "300px",
    margin: "0 auto",
    display: "block",
    transition: "background 0.3s",
  },
};

// Add CSS animation for spinner
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(
  `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`,
  styleSheet.cssRules.length
);
