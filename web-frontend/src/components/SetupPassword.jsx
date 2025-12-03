import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function SetupPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const [state, setState] = useState(location.state || {});
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  
  useEffect(() => {
    console.log("Setup Password Page Loaded with state:", state);
    
    if (!state.email) {
      navigate('/');
    }
  }, []);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Setting up password:", { email: state.email, otp, password });
    alert("Password setup would complete here");
    navigate('/');
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-2xl font-bold mb-4">Setup Password</h1>
        <div className="mb-4 p-3 bg-blue-50 rounded">
          <p><strong>Email:</strong> {state.email}</p>
          <p><strong>Role:</strong> {state.role}</p>
          {state.otpExpires && (
            <p><strong>OTP Expires:</strong> {new Date(state.otpExpires).toLocaleString()}</p>
          )}
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">OTP Code</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter OTP from email"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter new password"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            Set Password
          </button>
        </form>
        
        <button
          onClick={() => navigate('/login-debug')}
          className="w-full mt-4 text-sm text-gray-500"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}