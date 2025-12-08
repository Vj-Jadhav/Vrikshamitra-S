import React, { useState, useEffect } from "react";
import axios from "axios";

const API = process.env.REACT_APP_BASE_URL;
const PINCODE_API = "https://api.postalpincode.in/pincode/";

function PlantDriveManagement() {
  const [form, setForm] = useState({
    city: "",
    location: "",
    pincode: "",
    requiredPlants: "",
    deadline: "",
  });
  const [pincodeData, setPincodeData] = useState(null);
  const [pincodeError, setPincodeError] = useState("");
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

const fetchTargets = async () => {
  setLoading(true);
  setError("");
  try {
    // Just fetch planting targets directly
    const res = await axios.get(`${API}/api/planting-targets`);
    
    if (res.data && res.data.success) {
      setTargets(res.data.data);
    } else {
      setError("Failed to load planting targets");
    }
  } catch (err) {
    console.error("Error fetching planting targets:", err);
    setError("Error loading planting targets");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchTargets();
  }, []);

  const fetchLocationByPincode = async (pincode) => {
    if (!pincode || pincode.length !== 6) {
      setPincodeData(null);
      setPincodeError(pincode ? "Pincode must be 6 digits" : "");
      return;
    }

    setPincodeLoading(true);
    try {
      const response = await axios.get(`${PINCODE_API}${pincode}`);
      const data = response.data[0];

      if (data.Status === "Success") {
        const postOffice = data.PostOffice[0];
        setPincodeData({
          district: postOffice.District,
          state: postOffice.State,
          country: postOffice.Country,
          region: postOffice.Region,
          division: postOffice.Division,
        });
        setPincodeError("");

        // Auto-fill city and location
        setForm((prev) => ({
          ...prev,
          city: postOffice.District,
          location: `${postOffice.Name}, ${postOffice.District}`,
        }));
      } else {
        setPincodeData(null);
        setPincodeError("Invalid pincode");
      }
    } catch (err) {
      console.error("Pincode API error:", err);
      setPincodeData(null);
      setPincodeError("Failed to fetch location data");
    } finally {
      setPincodeLoading(false);
    }
  };

  const handlePincodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setForm({ ...form, pincode: value });

    if (value.length === 6) {
      fetchLocationByPincode(value);
    } else {
      setPincodeData(null);
      setPincodeError(value ? "Enter 6-digit pincode" : "");
    }
  };

  const handleAddTarget = async () => {
    const { city, location, pincode, requiredPlants, deadline } = form;

    if (
      !city.trim() ||
      !location.trim() ||
      !pincode.trim() ||
      !requiredPlants.trim() ||
      !deadline
    ) {
      alert("Please fill all fields");
      return;
    }

    if (pincode.length !== 6) {
      alert("Please enter a valid 6-digit pincode");
      return;
    }

    const plantsNum = Number(requiredPlants);
    if (isNaN(plantsNum) || plantsNum <= 0 || !Number.isInteger(plantsNum)) {
      alert("Required plants must be a positive whole number");
      return;
    }

    if (new Date(deadline) < new Date()) {
      alert("Deadline cannot be in the past");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${API}/api/planting-targets/create`, {
        city: city.trim(),
        location: location.trim(),
        pincode: pincode.trim(),
        requiredPlants: plantsNum,
        deadline,
      });
      alert("Target added successfully");
      fetchTargets();
      setForm({
        city: "",
        location: "",
        pincode: "",
        requiredPlants: "",
        deadline: "",
      });
      setPincodeData(null);
      setPincodeError("");
    } catch (err) {
      console.error("Submit error:", err);
      alert(err.response?.data?.message || "Failed to add target. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffDays = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "#ffeaea";
    if (diffDays <= 7) return "#fff3cd";
    if (diffDays <= 30) return "#d1ecf1";
    return "#e8f5e9";
  };

  const getStatusTextColor = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffDays = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "#e63946";
    if (diffDays <= 7) return "#856404";
    if (diffDays <= 30) return "#0c5460";
    return "#2d6a4f";
  };

  const getStatusText = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffDays = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Overdue";
    if (diffDays <= 7) return "Urgent";
    if (diffDays <= 30) return "Upcoming";
    return "On Track";
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>🌱 City Plantation Drive Management</h1>
        <p style={styles.subtitle}>
          Manage and track plantation targets across cities
        </p>
      </header>

      <main style={styles.mainContent}>
        <section style={styles.addTargetSection}>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Add New Plantation Target</h2>
              <span style={styles.requiredNote}>* All fields are required</span>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Pincode <span style={styles.required}>*</span>
                <span style={styles.pincodeHint}>(6-digit Indian pincode)</span>
              </label>
              <div style={styles.pincodeInputWrapper}>
                <input
                  type="text"
                  placeholder="Enter 6-digit pincode"
                  value={form.pincode}
                  onChange={handlePincodeChange}
                  maxLength="6"
                  style={styles.formInput}
                />
                {pincodeLoading && <span style={styles.loadingSpinner}></span>}
              </div>

              {pincodeError && (
                <div style={styles.errorMessage}>{pincodeError}</div>
              )}

              {pincodeData && (
                <div style={styles.pincodeDetails}>
                  <div style={styles.locationInfo}>
                    <span style={styles.infoLabel}>📍 Location Details:</span>
                    <div style={styles.infoGrid}>
                      <div style={styles.infoItem}>
                        <span style={styles.infoTitle}>District:</span>
                        <span style={styles.infoValue}>
                          {pincodeData.district}
                        </span>
                      </div>
                      <div style={styles.infoItem}>
                        <span style={styles.infoTitle}>State:</span>
                        <span style={styles.infoValue}>
                          {pincodeData.state}
                        </span>
                      </div>
                      <div style={styles.infoItem}>
                        <span style={styles.infoTitle}>Region:</span>
                        <span style={styles.infoValue}>
                          {pincodeData.region}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  City <span style={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="City name"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  style={{
                    ...styles.formInput,
                    ...(pincodeData ? styles.disabledInput : {}),
                  }}
                  disabled={pincodeData}
                />
                {pincodeData && (
                  <small style={styles.fieldHint}>
                    Auto-filled from pincode
                  </small>
                )}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Specific Location <span style={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Central Park, Main Road"
                  value={form.location}
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                  style={styles.formInput}
                />
              </div>
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Plants Required <span style={styles.required}>*</span>
                </label>
                <input
                  type="number"
                  placeholder="Enter number"
                  value={form.requiredPlants}
                  onChange={(e) =>
                    setForm({ ...form, requiredPlants: e.target.value })
                  }
                  style={styles.formInput}
                  min="1"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Deadline <span style={styles.required}>*</span>
                </label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(e) =>
                    setForm({ ...form, deadline: e.target.value })
                  }
                  style={styles.formInput}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>

            <button
              onClick={handleAddTarget}
              style={{
                ...styles.submitBtn,
                ...(submitting || !pincodeData ? styles.disabledBtn : {}),
              }}
              disabled={submitting || !pincodeData}
            >
              {submitting ? (
                <>
                  <span style={styles.spinner}></span>
                  Adding Target...
                </>
              ) : (
                "➕ Add Plantation Target"
              )}
            </button>
          </div>
        </section>

        <section style={styles.targetsSection}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>📊 Existing Plantation Targets</h2>
            <div style={styles.stats}>
              <span style={styles.statItem}>
                Total Targets: <strong>{targets.length}</strong>
              </span>
              <span style={styles.statItem}>
                Total Plants:{" "}
                <strong>
                  {targets.reduce((sum, t) => sum + t.requiredPlants, 0)}
                </strong>
              </span>
            </div>
          </div>

          {loading ? (
            <div style={styles.loadingState}>
              <div style={styles.loader}></div>
              <p>Loading targets...</p>
            </div>
          ) : error ? (
            <div style={styles.errorState}>
              <div style={styles.errorIcon}>⚠️</div>
              <p>{error}</p>
              <button onClick={fetchTargets} style={styles.retryBtn}>
                Retry
              </button>
            </div>
          ) : targets.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>🌱</div>
              <p>No plantation targets added yet. Add your first target!</p>
            </div>
          ) : (
            <div style={styles.tableContainer}>
              <table style={styles.targetsTable}>
                <thead>
                  <tr>
                    <th style={styles.tableHeader}>ID</th>
                    <th style={styles.tableHeader}>City</th>
                    <th style={styles.tableHeader}>Location</th>
                    <th style={styles.tableHeader}>Pincode</th>
                    <th style={styles.tableHeader}>Plants Required</th>
                    <th style={styles.tableHeader}>Deadline</th>
                    <th style={styles.tableHeader}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {targets.map((t, index) => (
                    <tr key={t._id} style={styles.tableRow}>
                      <td style={styles.tableCell}>{index + 1}</td>
                      <td style={{ ...styles.tableCell, ...styles.cityCell }}>
                        {t.city}
                      </td>
                      <td
                        style={{ ...styles.tableCell, ...styles.locationCell }}
                      >
                        {t.location}
                      </td>
                      <td
                        style={{ ...styles.tableCell, ...styles.pincodeCell }}
                      >
                        {t.pincode || "N/A"}
                      </td>
                      <td style={styles.tableCell}>
                        <span style={styles.plantCount}>
                          {t.requiredPlants.toLocaleString()}
                        </span>
                      </td>
                      <td
                        style={{ ...styles.tableCell, ...styles.deadlineCell }}
                      >
                        {new Date(t.deadline).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td style={styles.tableCell}>
                        <span
                          style={{
                            ...styles.statusBadge,
                            backgroundColor: getStatusColor(t.deadline),
                            color: getStatusTextColor(t.deadline),
                          }}
                        >
                          {getStatusText(t.deadline)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
    padding: "20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  header: {
    textAlign: "center",
    marginBottom: "40px",
    padding: "20px",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  title: {
    color: "#2d6a4f",
    marginBottom: "8px",
    fontSize: "2.2rem",
  },
  subtitle: {
    color: "#666",
    fontSize: "1.1rem",
  },
  mainContent: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  addTargetSection: {
    marginBottom: "40px",
  },
  card: {
    background: "white",
    borderRadius: "12px",
    padding: "30px",
    boxShadow: "0 6px 15px rgba(0, 0, 0, 0.08)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
    paddingBottom: "15px",
    borderBottom: "2px solid #e8f5e9",
  },
  cardTitle: {
    color: "#1b4332",
    margin: "0",
  },
  requiredNote: {
    color: "#e63946",
    fontSize: "0.9rem",
  },
  formGroup: {
    marginBottom: "24px",
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    marginBottom: "20px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "600",
    color: "#2d6a4f",
  },
  required: {
    color: "#e63946",
  },
  pincodeHint: {
    fontSize: "0.85rem",
    color: "#666",
    marginLeft: "8px",
    fontWeight: "normal",
  },
  pincodeInputWrapper: {
    position: "relative",
  },
  formInput: {
    width: "100%",
    padding: "12px 16px",
    border: "2px solid #ddd",
    borderRadius: "8px",
    fontSize: "1rem",
    transition: "all 0.3s ease",
    boxSizing: "border-box",
  },
  disabledInput: {
    backgroundColor: "#f5f5f5",
    color: "#666",
  },
  loadingSpinner: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    width: "20px",
    height: "20px",
    border: "2px solid #f3f3f3",
    borderTop: "2px solid #2d6a4f",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  errorMessage: {
    color: "#e63946",
    fontSize: "0.9rem",
    marginTop: "8px",
    padding: "8px 12px",
    backgroundColor: "#ffeaea",
    borderRadius: "6px",
    borderLeft: "4px solid #e63946",
  },
  pincodeDetails: {
    marginTop: "15px",
    padding: "15px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    borderLeft: "4px solid #2d6a4f",
  },
  locationInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  infoLabel: {
    fontWeight: "600",
    color: "#2d6a4f",
    fontSize: "0.95rem",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "12px",
  },
  infoItem: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  infoTitle: {
    fontSize: "0.85rem",
    color: "#666",
  },
  infoValue: {
    fontWeight: "600",
    color: "#333",
  },
  fieldHint: {
    display: "block",
    marginTop: "4px",
    color: "#4a8b71",
    fontSize: "0.85rem",
    fontStyle: "italic",
  },
  submitBtn: {
    width: "100%",
    padding: "14px",
    background: "linear-gradient(135deg, #2d6a4f 0%, #40916c 100%)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "1.1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
  },
  disabledBtn: {
    opacity: "0.6",
    cursor: "not-allowed",
  },
  spinner: {
    width: "18px",
    height: "18px",
    border: "2px solid white",
    borderTop: "2px solid transparent",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
    padding: "20px",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
  },
  sectionTitle: {
    color: "#1b4332",
    margin: "0",
  },
  stats: {
    display: "flex",
    gap: "30px",
  },
  statItem: {
    color: "#666",
    fontSize: "1rem",
  },
  loadingState: {
    textAlign: "center",
    padding: "60px 20px",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
  },
  loader: {
    width: "50px",
    height: "50px",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #2d6a4f",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 20px",
  },
  errorState: {
    textAlign: "center",
    padding: "60px 20px",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
  },
  errorIcon: {
    fontSize: "3rem",
    marginBottom: "20px",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
  },
  emptyIcon: {
    fontSize: "3rem",
    marginBottom: "20px",
  },
  retryBtn: {
    marginTop: "20px",
    padding: "10px 24px",
    backgroundColor: "#2d6a4f",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  tableContainer: {
    overflowX: "auto",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
  },
  targetsTable: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHeader: {
    padding: "16px 20px",
    textAlign: "left",
    color: "white",
    fontWeight: "600",
    fontSize: "0.95rem",
    borderBottom: "3px solid #1b4332",
    background: "linear-gradient(135deg, #2d6a4f 0%, #40916c 100%)",
  },
  tableRow: {
    transition: "background-color 0.2s",
    borderBottom: "1px solid #eee",
  },
  tableCell: {
    padding: "16px 20px",
    color: "#333",
  },
  cityCell: {
    fontWeight: "600",
    color: "#2d6a4f",
  },
  locationCell: {
    maxWidth: "250px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  pincodeCell: {
    fontFamily: "monospace",
    fontWeight: "600",
    color: "#666",
  },
  plantCount: {
    display: "inline-block",
    padding: "4px 12px",
    backgroundColor: "#e8f5e9",
    color: "#2d6a4f",
    borderRadius: "20px",
    fontSize: "0.9rem",
    fontWeight: "600",
  },
  deadlineCell: {
    whiteSpace: "nowrap",
    fontWeight: "500",
  },
  statusBadge: {
    display: "inline-block",
    padding: "6px 16px",
    borderRadius: "20px",
    fontSize: "0.85rem",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
};

// Add CSS animation to global styles
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default PlantDriveManagement;
