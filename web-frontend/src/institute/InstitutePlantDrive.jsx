import React, { useEffect, useState } from "react";
import axios from "axios";

const API = process.env.REACT_APP_BASE_URL;

function InstitutePlantDrive({ instituteId: propInstituteId }) {
  const [loading, setLoading] = useState(true);
  const [institutePincode, setInstitutePincode] = useState(null);
  const [instituteId, setInstituteId] = useState(propInstituteId || null);
  const [instituteName, setInstituteName] = useState("");
  const [requests, setRequests] = useState([]);
  const [govTargets, setGovTargets] = useState([]);
  const [pledgeInputs, setPledgeInputs] = useState({});
  const [activeTargetIds, setActiveTargetIds] = useState([]);
  const [availableNGOs, setAvailableNGOs] = useState([]);
  const [pincodeTargets, setPincodeTargets] = useState([]);
  const [error, setError] = useState("");

  // Photo upload state
  const [activeUploadId, setActiveUploadId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // If we have a prop ID, ensure state matches it
    if (propInstituteId) {
      setInstituteId(propInstituteId);
    }
  }, [propInstituteId]);

  useEffect(() => {
    const initializeData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          setError("No authentication token found. Please login again.");
          return;
        }

        // Try to get from localStorage first
        const storedData = JSON.parse(localStorage.getItem("instituteData"));

        // Valid if exists AND (matches propId OR no propId was passed)
        // This prevents showing previous user's data
        const isValidStorage = storedData && storedData._id && storedData.pincode &&
          (!propInstituteId || storedData._id === propInstituteId);

        if (isValidStorage) {
          setInstituteId(storedData._id);
          setInstitutePincode(storedData.pincode);
          setInstituteName(storedData.name || storedData.instituteName);
          setLoading(false);
        } else {
          // Fallback: Fetch profile from API or clear stale data
          if (storedData && propInstituteId && storedData._id !== propInstituteId) {
            localStorage.removeItem("instituteData"); // Clear stale data
          }

          const res = await axios.get(`${API}/api/institute/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (res.data && res.data.success) {
            const data = res.data.data;

            // Double check if the fetched data matches the expected user (if prop provided)
            if (propInstituteId && data._id !== propInstituteId) {
              console.warn("Fetched profile does not match logged in user ID");
            }

            setInstituteId(data._id);
            setInstitutePincode(data.pincode);
            setInstituteName(data.name || data.instituteName);

            // Update localStorage
            localStorage.setItem("instituteData", JSON.stringify(data));
          } else {
            setError("Failed to load institute profile");
          }
          setLoading(false);
        }
      } catch (err) {
        console.error("Error initializing institute data:", err);
        setError("Failed to initialize institute data. Please refresh the page.");
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  // Handle photo file selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Handle photo upload
  const handleUploadPhoto = async (eventId) => {
    if (!selectedFile) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('photo', selectedFile);
      formData.append('eventId', eventId);
      formData.append('caption', 'Institute Plantation Photo');

      const token = localStorage.getItem("token");
      await axios.post(`${API}/api/institute/events/upload-photo`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      alert("Photo uploaded successfully!");
      setActiveUploadId(null);
      setSelectedFile(null);
      fetchMyRequests(); // Refresh
    } catch (err) {
      console.error(err);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // Fetch institute requests/events/pledges
  const fetchMyRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!instituteId || !token) return;

      const [eventsRes, requestsRes, pledgesRes] = await Promise.all([
        axios.get(`${API}/api/institute/${instituteId}/events`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API}/api/institute/${instituteId}/requests`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/api/institute/${instituteId}/pledges`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      let combined = [];
      const eventTargetIds = [];

      if (eventsRes.data && eventsRes.data.success) {
        combined = [...combined, ...eventsRes.data.data.map(e => {
          if (e.targetId) eventTargetIds.push(e.targetId);
          return { ...e, type: 'event' };
        })];
      }

      if (requestsRes.data && requestsRes.data.success) {
        combined = [...combined, ...requestsRes.data.data.map(r => {
          if (r.targetId) eventTargetIds.push(r.targetId);
          return { ...r, type: 'request' };
        })];
      }

      setActiveTargetIds(eventTargetIds);

      if (pledgesRes.data && pledgesRes.data.success) {
        const activePledges = pledgesRes.data.data.filter(p => !eventTargetIds.includes(p._id));
        combined = [...combined, ...activePledges.map(p => ({ ...p, type: 'pledge' }))];
      }

      combined.sort((a, b) => new Date(b.date || b.createdAt || b.deadline) - new Date(a.date || a.createdAt || a.deadline));
      setRequests(combined);
    } catch (err) {
      console.error("Could not fetch events/requests:", err);
    }
  };

  // Fetch ALL government targets (from the government-added data)
  const fetchAllGovTargets = async () => {
    try {
      const token = localStorage.getItem("token");
      // Use the correct endpoint that returns targets (optionally filtered by pincode)
      // Since we want ALL targets initially (based on user code), we can just fetch all or fetch by pincode.
      // The user wants 'pincodeTargets' to be filtered.
      const res = await axios.get(`${API}/api/institute/plant-drives?pincode=${institutePincode || ''}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data && res.data.success) {
        const allTargets = res.data.data || [];
        setGovTargets(allTargets);

        // Filter targets for institute's pincode
        if (institutePincode) {
          const filteredTargets = allTargets.filter(target =>
            target.pincode && target.pincode.toString() === institutePincode.toString()
          );
          setPincodeTargets(filteredTargets);
        }
      }
    } catch (err) {
      console.error("Error fetching gov targets:", err);
      setError("Failed to load government planting targets");
    }
  };

  // Fetch available NGOs for the institute's pincode
  const fetchAvailableNGOs = async () => {
    if (!institutePincode) return;

    try {
      const token = localStorage.getItem("token");
      // Try different possible endpoints
      let res;

      try {
        // Try the specific pincode endpoint
        res = await axios.get(`${API}/api/institute/available-ngos?pincode=${institutePincode}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        // If fails, try to get all NGOs and filter on client-side
        console.log("Falling back to all NGOs endpoint");
        res = await axios.get(`${API}/api/ngo/available-ngos?pincode=${institutePincode}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data && res.data.success) {
          const allNGOs = res.data.data || [];
          // Filter NGOs by pincode
          const filteredNGOs = allNGOs.filter(ngo =>
            ngo.pincode && ngo.pincode.toString() === institutePincode.toString()
          );
          setAvailableNGOs(filteredNGOs);
          return;
        }
      }

      if (res.data && res.data.success) {
        setAvailableNGOs(res.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching NGOs", err);
      // Set empty array as fallback
      setAvailableNGOs([]);
    }
  };

  // Handle pledge submission
  const handlePledgeSubmit = async (targetId) => {
    const treesAccepted = pledgeInputs[targetId];
    if (!treesAccepted || treesAccepted <= 0) {
      alert("Please enter a valid number of trees to pledge.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      // Find the target to get max allowed trees
      const target = govTargets.find(t => t._id === targetId);
      if (target && treesAccepted > target.requiredPlants) {
        alert(`Cannot pledge more than ${target.requiredPlants} trees for this location.`);
        return;
      }

      const res = await axios.post(`${API}/api/institute/plant-drive/accept`,
        { targetId, treesAccepted },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data && res.data.success) {
        alert("Pledge accepted successfully!");
        fetchAllGovTargets(); // Refresh government targets
        fetchMyRequests(); // Refresh pledges
        setPledgeInputs(prev => {
          const newState = { ...prev };
          delete newState[targetId];
          return newState;
        });
      } else {
        alert(res.data?.message || "Failed to submit pledge");
      }
    } catch (err) {
      console.error("Error submitting pledge:", err);
      alert(err.response?.data?.message || "Failed to submit pledge. Please try again.");
    }
  };

  // Handle NGO request
  const handleRequestToNGO = async (target, pledgeInfo) => {
    try {
      const token = localStorage.getItem("token");

      // If no NGOs available in the area
      if (availableNGOs.length === 0) {
        alert("No NGOs available in your area. Please try again later.");
        return;
      }

      // For simplicity, select the first NGO
      // You can implement a selection modal here
      const selectedNGO = availableNGOs[0];

      const payload = {
        targetId: target._id,
        ngoId: selectedNGO._id,
        instituteId: instituteId,
        instituteName: instituteName,
        pincode: institutePincode,
        location: target.location,
        city: target.city,
        treeCount: pledgeInfo.treesAccepted,
        treeType: 'Mixed',
        eventTitle: `Plantation Drive at ${target.location}`,
        description: `Planting drive for government target at ${target.location}, ${target.city}`,
        proposedDate: target.deadline,
        date: target.deadline,
        venue: target.location,
        status: 'pending'
      };

      // Try creating planting request
      let res;
      try {
        res = await axios.post(`${API}/api/institute/planting-request/create`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        // Fallback to generic request endpoint
        console.log("Trying fallback request endpoint");
        res = await axios.post(`${API}/api/institute/requests/create`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      if (res.data && res.data.success) {
        alert("Request sent to NGO successfully!");

        // Try to create an event in the institute's events
        try {
          const eventPayload = {
            ...payload,
            ngoName: selectedNGO.name,
            status: 'pending'
          };

          await axios.post(`${API}/api/institute/events/create`, eventPayload, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } catch (eventErr) {
          console.log("Event creation failed, but request was sent:", eventErr);
        }

        // Refresh data
        fetchMyRequests();
        fetchAllGovTargets();
      } else {
        alert(res.data?.message || "Failed to send request to NGO");
      }
    } catch (err) {
      console.error("Error requesting NGO:", err);
      alert(err.response?.data?.message || "Failed to send request to NGO. Please try again.");
    }
  };

  // Fetch all data when instituteId is available
  useEffect(() => {
    if (instituteId) {
      fetchMyRequests();
      fetchAllGovTargets();
    }
  }, [instituteId]);

  // Fetch NGOs when pincode is available
  useEffect(() => {
    if (institutePincode) {
      fetchAvailableNGOs();
    }
  }, [institutePincode]);

  const getPledgeInfo = (target) => {
    if (!instituteId || !target.acceptedBy) return null;
    return target.acceptedBy.find(entry => entry.instituteId === instituteId);
  };

  const getStatusColor = (deadline) => {
    if (!deadline) return "#f0f0f0";

    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffDays = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "#ffeaea";
    if (diffDays <= 7) return "#fff3cd";
    if (diffDays <= 30) return "#d1ecf1";
    return "#e8f5e9";
  };

  const getStatusText = (deadline) => {
    if (!deadline) return "No Deadline";

    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffDays = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Overdue";
    if (diffDays <= 7) return "Urgent";
    if (diffDays <= 30) return "Upcoming";
    return "On Track";
  };

  if (loading) return <div style={styles.loadingContainer}>Loading...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.headerContainer}>
        <h1 style={styles.header}>Plantation Drive Management</h1>
        {institutePincode && (
          <div style={styles.pincodeBadge}>
            📍 Your Pincode: <strong>{institutePincode}</strong>
            <div style={{ fontSize: '0.8rem', marginTop: '5px' }}>
              Available NGOs in area: {availableNGOs.length}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div style={styles.errorAlert}>
          ⚠️ {error}
          <button
            onClick={() => {
              setError("");
              if (instituteId) {
                fetchAllGovTargets();
                fetchMyRequests();
              }
            }}
            style={styles.retryButton}
          >
            Retry
          </button>
        </div>
      )}

      <div style={styles.contentGrid}>
        {/* Government Targets Section - Filtered by pincode */}
        <div style={{ ...styles.card, gridColumn: '1 / -1' }}>
          <div style={styles.sectionHeader}>
            <h3 style={{ margin: '0', color: '#2c7a7b' }}>
              🏛️ Government Planting Targets for Your Area
            </h3>
            <div style={styles.stats}>
              <span style={styles.statItem}>
                Total in Area: <strong>{pincodeTargets.length}</strong>
              </span>
              <span style={styles.statItem}>
                Nationwide: <strong>{govTargets.length}</strong>
              </span>
            </div>
          </div>

          {pincodeTargets.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>🌱</div>
              <p>No active government planting drives for your pincode ({institutePincode}).</p>
              <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '10px' }}>
                Check all targets below to see nationwide drives.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {pincodeTargets.map(target => {
                const pledge = getPledgeInfo(target);
                const hasActiveRequest = activeTargetIds.includes(target._id);
                const remainingTrees = target.requiredPlants - (target.acceptedBy?.reduce((sum, p) => sum + (p.treesAccepted || 0), 0) || 0);

                return (
                  <div key={target._id} style={{
                    ...styles.targetCard,
                    backgroundColor: getStatusColor(target.deadline)
                  }}>
                    <div style={styles.targetHeader}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 5px 0', color: '#2b6cb0' }}>
                          {target.location}, {target.city}
                        </h4>
                        <p style={{ margin: '0', fontSize: '0.9rem', color: '#2c5282' }}>
                          Required: <strong>{target.requiredPlants.toLocaleString()}</strong> trees
                          {remainingTrees > 0 && (
                            <span style={{ color: '#e53e3e', marginLeft: '10px' }}>
                              Remaining: {remainingTrees.toLocaleString()}
                            </span>
                          )}
                        </p>
                        <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', color: '#2c5282' }}>
                          Deadline: {new Date(target.deadline).toLocaleDateString()}
                        </p>
                        <p style={{ margin: '5px 0 0 0', fontSize: '0.8rem', color: '#666' }}>
                          Status: <strong>{getStatusText(target.deadline)}</strong>
                        </p>
                      </div>

                      <div style={styles.targetActions}>
                        {pledge ? (
                          <div style={styles.pledgeSection}>
                            <div style={styles.pledgeBadge}>
                              ✅ You Pledged: {pledge.treesAccepted} Trees
                            </div>

                            {hasActiveRequest ? (
                              <div style={styles.requestSentBadge}>
                                ✅ Request Sent to NGO
                              </div>
                            ) : (
                              <button
                                onClick={() => handleRequestToNGO(target, pledge)}
                                style={styles.requestButton}
                              >
                                Request to NGO
                              </button>
                            )}
                          </div>
                        ) : (
                          <div style={styles.pledgeForm}>
                            <input
                              type="number"
                              placeholder="Enter Qty"
                              min="1"
                              max={Math.min(target.requiredPlants, remainingTrees)}
                              style={styles.pledgeInput}
                              value={pledgeInputs[target._id] || ''}
                              onChange={(e) => setPledgeInputs(prev => ({
                                ...prev,
                                [target._id]: parseInt(e.target.value) || ''
                              }))}
                            />
                            <button
                              onClick={() => handlePledgeSubmit(target._id)}
                              style={styles.acceptButton}
                              disabled={remainingTrees <= 0}
                            >
                              {remainingTrees <= 0 ? 'Fulfilled' : 'Accept'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* All Government Targets (Nationwide) */}
        {govTargets.length > 0 && (
          <div style={{ ...styles.card, gridColumn: '1 / -1' }}>
            <div style={styles.sectionHeader}>
              <h3 style={{ margin: '0', color: '#2c7a7b' }}>
                🌍 All Government Planting Targets (Nationwide)
              </h3>
              <button
                onClick={fetchAllGovTargets}
                style={styles.refreshButton}
              >
                🔄 Refresh
              </button>
            </div>

            <div style={styles.tableContainer}>
              <table style={styles.targetsTable}>
                <thead>
                  <tr>
                    <th style={styles.tableHeader}>City</th>
                    <th style={styles.tableHeader}>Location</th>
                    <th style={styles.tableHeader}>Pincode</th>
                    <th style={styles.tableHeader}>Plants Required</th>
                    <th style={styles.tableHeader}>Deadline</th>
                    <th style={styles.tableHeader}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {govTargets.map(target => (
                    <tr key={target._id} style={{
                      ...styles.tableRow,
                      backgroundColor: target.pincode === institutePincode ? '#f0fff4' : 'transparent'
                    }}>
                      <td style={styles.tableCell}>
                        {target.city}
                        {target.pincode === institutePincode &&
                          <span style={styles.myAreaBadge}>Your Area</span>
                        }
                      </td>
                      <td style={styles.tableCell}>{target.location}</td>
                      <td style={styles.tableCell}>{target.pincode || 'N/A'}</td>
                      <td style={styles.tableCell}>
                        <span style={styles.plantCount}>
                          {target.requiredPlants.toLocaleString()}
                        </span>
                      </td>
                      <td style={styles.tableCell}>
                        {target.deadline ? new Date(target.deadline).toLocaleDateString() : 'No deadline'}
                      </td>
                      <td style={styles.tableCell}>
                        <span style={{
                          ...styles.statusBadge,
                          backgroundColor: getStatusColor(target.deadline)
                        }}>
                          {getStatusText(target.deadline)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Status / History List */}
        <div style={{ ...styles.card, gridColumn: '1 / -1' }}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>📅 Your Plantation Events & Requests</h2>
            <button
              onClick={fetchMyRequests}
              style={styles.refreshButton}
            >
              🔄 Refresh
            </button>
          </div>

          {requests.length === 0 ? (
            <p style={{ color: '#666', textAlign: 'center', marginTop: '20px' }}>
              No events or requests yet.
            </p>
          ) : (
            <div style={styles.list}>
              {requests.map(item => (
                <div key={item._id} style={styles.listItem}>
                  <div style={styles.itemHeader}>
                    <strong style={{ fontSize: '1.1rem' }}>
                      {item.title ||
                        (item.type === 'pledge' ? `Pledge for ${item.requiredPlants} Trees` :
                          `Request for ${item.treeCount} trees`)}
                    </strong>

                    <div style={{
                      ...styles.statusBadge,
                      backgroundColor: item.type === 'request' ?
                        (item.status === 'approved' ? '#c6f6d5' :
                          item.status === 'rejected' ? '#fed7d7' : '#fefcbf') :
                        item.type === 'pledge' ? '#e6fffa' : '#bee3f8',
                      color: item.type === 'request' ?
                        (item.status === 'approved' ? '#22543d' :
                          item.status === 'rejected' ? '#742a2a' : '#744210') :
                        item.type === 'pledge' ? '#2c7a7b' : '#2b6cb0'
                    }}>
                      {item.type === 'request' ? `Request: ${item.status || 'pending'}` :
                        item.type === 'pledge' ? 'Pledged Target' : `Event: ${item.status || 'active'}`}
                    </div>
                  </div>

                  {item.ngoName && (
                    <p style={{ fontSize: '0.9rem', margin: '5px 0' }}>
                      <strong>NGO:</strong> {item.ngoName}
                    </p>
                  )}

                  <p style={{ fontSize: '0.9rem', margin: '5px 0', color: '#4a5568' }}>
                    <strong>Location:</strong> {item.location || item.venue || 'N/A'}
                  </p>

                  <p style={{ fontSize: '0.9rem', margin: '5px 0', color: '#4a5568' }}>
                    <strong>Date:</strong> {item.date ? new Date(item.date).toLocaleDateString() :
                      item.deadline ? new Date(item.deadline).toLocaleDateString() :
                        item.proposedDate ? new Date(item.proposedDate).toLocaleDateString() : 'N/A'}
                  </p>

                  {item.type === 'request' && item.status === 'pending' && (
                    <div style={{ marginTop: '10px', padding: '8px', background: '#fff3cd', borderRadius: '4px' }}>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#856404' }}>
                        ⏳ Waiting for NGO response
                      </p>
                    </div>
                  )}

                  {item.deliveryStatus === 'delivered' && (
                    <div style={{ marginTop: '15px', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                      <p style={{ color: '#276749', fontWeight: 'bold', marginBottom: '8px' }}>✅ Trees Delivered</p>

                      {/* Show existing photos if any */}
                      {item.photos && item.photos.length > 0 && (
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                          {item.photos.map((p, i) => (
                            <img key={i} src={p.url} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }} alt="Plantation" />
                          ))}
                        </div>
                      )}

                      {activeUploadId === item._id ? (
                        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                          <input type="file" onChange={handleFileChange} accept="image/*" disabled={uploading} style={{ fontSize: '0.8rem' }} />
                          <button onClick={() => handleUploadPhoto(item._id)} disabled={uploading || !selectedFile} style={styles.requestButton}>
                            {uploading ? '...' : 'Upload'}
                          </button>
                          <button onClick={() => { setActiveUploadId(null); setSelectedFile(null); }} style={styles.refreshButton}>Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => setActiveUploadId(item._id)} style={styles.acceptButton}>
                          📸 Upload Photo
                        </button>
                      )}
                    </div>
                  )}

                  {item.type === 'request' && item.status === 'approved' && (
                    <div style={{ marginTop: '10px', padding: '8px', background: '#d4edda', borderRadius: '4px' }}>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#155724', fontWeight: 'bold' }}>
                        ✅ NGO Approved - Prepare for plantation
                      </p>
                    </div>
                  )}


                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "30px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '1.2rem',
    color: '#4a5568'
  },
  errorAlert: {
    backgroundColor: '#fff3cd',
    color: '#856404',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #ffeaa7',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  retryButton: {
    backgroundColor: '#4a8b71',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem'
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
    padding: "12px 20px",
    borderRadius: "12px",
    fontSize: "0.9rem",
    color: "#2d6a4f",
    border: "1px solid #c8e6c9",
    minWidth: '200px'
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '30px',
  },
  card: {
    background: "#fff",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '15px'
  },
  refreshButton: {
    backgroundColor: '#4299e1',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  stats: {
    display: 'flex',
    gap: '20px',
    fontSize: '0.9rem'
  },
  statItem: {
    background: '#edf2f7',
    padding: '8px 15px',
    borderRadius: '20px',
    color: '#4a5568'
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#666'
  },
  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '15px'
  },
  targetCard: {
    border: '1px solid #9ae6b4',
    padding: '15px',
    borderRadius: '8px',
  },
  targetHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '10px',
  },
  targetActions: {
    minWidth: '200px',
    textAlign: 'right',
  },
  pledgeSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '8px',
  },
  pledgeBadge: {
    padding: '8px 12px',
    background: '#c6f6d5',
    color: '#22543d',
    borderRadius: '6px',
    fontSize: '0.9rem',
    fontWeight: 'bold',
  },
  requestSentBadge: {
    fontSize: '0.85rem',
    color: '#2b6cb0',
    fontWeight: '600',
    padding: '4px 8px',
    background: '#ebf8ff',
    borderRadius: '4px',
  },
  requestButton: {
    padding: '8px 16px',
    background: '#e53e3e',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '0.9rem',
    transition: 'background 0.3s',
  },
  pledgeForm: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end',
  },
  pledgeInput: {
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #cbd5e0',
    width: '100px',
    fontSize: '0.9rem',
  },
  acceptButton: {
    padding: '8px 16px',
    background: '#319795',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '0.9rem',
    transition: 'background 0.3s',
  },
  sectionTitle: {
    marginTop: "0",
    color: "#2d6a4f",
    fontSize: "1.5rem",
    marginBottom: '0'
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  listItem: {
    padding: '15px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    background: '#fafafa'
  },
  itemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
    flexWrap: 'wrap',
    gap: '10px'
  },
  statusBadge: {
    padding: '5px 10px',
    borderRadius: '15px',
    fontSize: '0.8rem',
    fontWeight: 'bold',
  },
  deliveredBadge: {
    marginTop: '10px',
    fontSize: '0.85rem',
    color: '#2e7d32',
    fontWeight: 'bold',
    background: '#e8f5e9',
    padding: '8px',
    borderRadius: '6px',
    textAlign: 'center'
  },
  tableContainer: {
    overflowX: 'auto',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
  },
  targetsTable: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '600px'
  },
  tableHeader: {
    padding: '12px 15px',
    textAlign: 'left',
    backgroundColor: '#f8f9fa',
    borderBottom: '2px solid #dee2e6',
    color: '#495057',
    fontWeight: '600'
  },
  tableRow: {
    borderBottom: '1px solid #e9ecef',
    transition: 'background-color 0.2s'
  },
  tableCell: {
    padding: '12px 15px',
    verticalAlign: 'middle'
  },
  plantCount: {
    display: 'inline-block',
    padding: '4px 10px',
    backgroundColor: '#e8f5e9',
    color: '#2d6a4f',
    borderRadius: '12px',
    fontSize: '0.85rem',
    fontWeight: '600'
  },
  myAreaBadge: {
    display: 'inline-block',
    marginLeft: '8px',
    padding: '2px 8px',
    backgroundColor: '#4299e1',
    color: 'white',
    borderRadius: '10px',
    fontSize: '0.7rem',
    fontWeight: '600'
  }
};

export default InstitutePlantDrive;