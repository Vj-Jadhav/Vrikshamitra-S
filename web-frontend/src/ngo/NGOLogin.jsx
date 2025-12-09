import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API = process.env.REACT_APP_BASE_URL;

const NGOLogin = () => {
    const [darpanId, setDarpanId] = useState('');
    const [pincode, setPincode] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const res = await axios.post(`${API}/api/ngo/login`, {
                darpanId,
                pincode
            });

            if (res.status === 200) {
                // Store NGO details in localStorage
                localStorage.setItem('ngoUser', JSON.stringify(res.data.ngo));
                navigate('/ngo/dashboard');
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>NGO Login</h2>
                <h4 style={styles.subtitle}>Enter your Darpan ID & Pincode</h4>

                {error && <div style={styles.error}>{error}</div>}

                <form onSubmit={handleLogin} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Darpan ID</label>
                        <input
                            type="text"
                            value={darpanId}
                            onChange={(e) => setDarpanId(e.target.value)}
                            style={styles.input}
                            placeholder="e.g. MH/2024/012345"
                            required
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Pincode</label>
                        <input
                            type="text"
                            value={pincode}
                            onChange={(e) => setPincode(e.target.value)}
                            style={styles.input}
                            placeholder="e.g. 400001"
                            maxLength="6"
                            required
                        />
                    </div>

                    <button type="submit" style={styles.button}>Login</button>
                </form>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
        background: '#f4f7f6',
    },
    card: {
        background: '#fff',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px',
    },
    title: {
        textAlign: 'center',
        color: '#2d6a4f',
        marginBottom: '0.5rem',
    },
    subtitle: {
        textAlign: 'center',
        color: '#666',
        marginBottom: '1.5rem',
        fontWeight: 'normal',
    },
    error: {
        background: '#ffebee',
        color: '#d32f2f',
        padding: '10px',
        borderRadius: '4px',
        marginBottom: '1rem',
        fontSize: '0.9rem',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
    },
    inputGroup: {
        marginBottom: '1rem',
    },
    label: {
        display: 'block',
        marginBottom: '0.5rem',
        color: '#333',
        fontWeight: '500',
    },
    input: {
        width: '100%',
        padding: '0.8rem',
        border: '1px solid #ddd',
        borderRadius: '6px',
        fontSize: '1rem',
        boxSizing: 'border-box', // Crucial for padding to not affect width
    },
    button: {
        background: '#2d6a4f',
        color: '#fff',
        padding: '0.8rem',
        border: 'none',
        borderRadius: '6px',
        fontSize: '1rem',
        cursor: 'pointer',
        fontWeight: '600',
        marginTop: '1rem',
        transition: 'background 0.3s',
    },
};

export default NGOLogin;
