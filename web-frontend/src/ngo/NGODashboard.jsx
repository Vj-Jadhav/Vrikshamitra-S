import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API = process.env.REACT_APP_BASE_URL;

const NGODashboard = () => {
    const [requests, setRequests] = useState([]);
    const [events, setEvents] = useState([]);
    const [ngo, setNgo] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const storedNgo = localStorage.getItem('ngoUser');
        if (!storedNgo) {
            navigate('/ngo/login');
            return;
        }
        setNgo(JSON.parse(storedNgo));
    }, [navigate]);

    useEffect(() => {
        if (ngo) {
            fetchData();
        }
    }, [ngo]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Pending Requests
            const reqRes = await axios.get(`${API}/api/ngo/requests/pending`, {
                params: { pincode: ngo.pincode }
            });
            setRequests(reqRes.data);

            // Fetch Active Events (Accepted)
            const eventsRes = await axios.get(`${API}/api/ngo/events/${ngo._id}`);
            setEvents(eventsRes.data);
        } catch (err) {
            console.error("Error fetching data", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (requestId) => {
        try {
            await axios.post(`${API}/api/ngo/requests/accept`, {
                requestId,
                ngoId: ngo._id
            });
            alert('Request accepted! Event created.');
            fetchData(); // Refresh list
        } catch (err) {
            console.error(err);
            alert('Failed to accept request');
        }
    };

    const handleMarkDelivered = async (eventId) => {
        try {
            await axios.post(`${API}/api/ngo/events/delivered`, {
                eventId
            });
            alert('Marked as delivered!');
            fetchData();
        } catch (err) {
            console.error(err);
            alert('Failed to update status');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('ngoUser');
        navigate('/ngo/login');
    };

    if (!ngo) return null;

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <div>
                    <h2 style={styles.logo}>NGO Portal</h2>
                    <p style={styles.welcome}>Welcome, {ngo.darpanId} ({ngo.pincode})</p>
                </div>
                <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
            </header>

            <main style={styles.main}>
                {/* Pending Requests Section */}
                <section style={styles.section}>
                    <h3 style={styles.sectionTitle}>🌱 Pending Tree Requests in your Pincode ({ngo.pincode})</h3>
                    {loading ? <p>Loading...</p> : requests.length === 0 ? (
                        <div style={styles.emptyState}>No pending requests found.</div>
                    ) : (
                        <div style={styles.grid}>
                            {requests.map(req => (
                                <div key={req._id} style={styles.card}>
                                    <div style={styles.cardHeader}>
                                        <h4>{req.instituteName}</h4>
                                        <span style={styles.badge}>New Request</span>
                                    </div>
                                    <p><strong>Request:</strong> {req.treeCount} {req.treeType} Trees</p>
                                    <p><strong>Date:</strong> {new Date(req.createdAt).toLocaleDateString()}</p>
                                    <button
                                        onClick={() => handleAccept(req._id)}
                                        style={styles.acceptBtn}
                                    >
                                        Accept & Create Event
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Active Events Section */}
                <section style={styles.section}>
                    <h3 style={styles.sectionTitle}>📅 My Active Plant Provisioning Events</h3>
                    {events.length === 0 ? (
                        <div style={styles.emptyState}>No active events.</div>
                    ) : (
                        <div style={styles.grid}>
                            {events.map(ev => (
                                <div key={ev._id} style={styles.card}>
                                    <div style={styles.cardHeader}>
                                        <h4>{ev.title}</h4>
                                        <span style={{
                                            ...styles.badge,
                                            background: ev.deliveryStatus === 'delivered' ? '#4caf50' : '#ff9800'
                                        }}>
                                            {ev.deliveryStatus === 'delivered' ? 'Delivered' : 'Pending Delivery'}
                                        </span>
                                    </div>
                                    <p><strong>Institute:</strong> {ev.instituteName}</p>
                                    <p><strong>Venue:</strong> {ev.venue}</p>
                                    <p><strong>Scheduled:</strong> {new Date(ev.date).toLocaleDateString()}</p>

                                    {ev.deliveryStatus !== 'delivered' && (
                                        <button
                                            onClick={() => handleMarkDelivered(ev._id)}
                                            style={styles.deliverBtn}
                                        >
                                            Mark Trees Delivered
                                        </button>
                                    )}

                                    {ev.deliveryStatus === 'delivered' && (
                                        <div style={{ marginTop: '1rem' }}>
                                            <p style={{ color: '#2d6a4f', fontWeight: 'bold' }}>✅ Trees Delivered Successfully</p>
                                            {ev.photos && ev.photos.length > 0 ? (
                                                <div style={{ marginTop: '10px' }}>
                                                    <p style={{ fontSize: '0.9rem', marginBottom: '5px' }}>📸 Plantation Photos:</p>
                                                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                                                        {ev.photos.map((photo, idx) => (
                                                            <a key={idx} href={photo.url} target="_blank" rel="noopener noreferrer">
                                                                <img src={photo.url} alt="Plantation" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <p style={{ fontSize: '0.85rem', color: '#666', fontStyle: 'italic' }}>Waiting for institute to upload photos...</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

const styles = {
    container: {
        background: '#f8fdf9',
        minHeight: '100vh',
    },
    header: {
        background: '#2d6a4f',
        color: 'white',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    logo: {
        margin: 0,
        fontSize: '1.5rem',
    },
    welcome: {
        margin: 0,
        fontSize: '0.9rem',
        opacity: 0.9,
    },
    logoutBtn: {
        background: 'rgba(255,255,255,0.2)',
        color: 'white',
        border: 'none',
        padding: '0.5rem 1rem',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    main: {
        padding: '2rem',
        maxWidth: '1200px',
        margin: '0 auto',
    },
    section: {
        marginBottom: '3rem',
    },
    sectionTitle: {
        color: '#1b4332',
        borderBottom: '2px solid #e8f5e9',
        paddingBottom: '0.5rem',
        marginBottom: '1.5rem',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px',
    },
    card: {
        background: 'white',
        padding: '1.5rem',
        borderRadius: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        border: '1px solid #e8f5e9',
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'start',
        marginBottom: '1rem',
    },
    badge: {
        background: '#e3f2fd',
        color: '#1565c0',
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '0.8rem',
        fontWeight: 'bold',
    },
    acceptBtn: {
        width: '100%',
        background: '#2d6a4f',
        color: 'white',
        padding: '10px',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: '600',
        marginTop: '1rem',
    },
    deliverBtn: {
        width: '100%',
        background: '#ff9800', // Orange for action
        color: 'white',
        padding: '10px',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: '600',
        marginTop: '1rem',
    },
    emptyState: {
        textAlign: 'center',
        padding: '2rem',
        color: '#666',
        background: '#fff',
        borderRadius: '8px',
    },
    infoText: {
        color: '#2d6a4f',
        fontWeight: '500',
        marginTop: '0.5rem',
    },
    warningText: {
        color: '#f57c00',
        fontSize: '0.9rem',
        marginTop: '0.5rem',
    },
};

export default NGODashboard;
