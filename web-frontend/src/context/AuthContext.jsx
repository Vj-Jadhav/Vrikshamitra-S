// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from "react";

// 1️⃣ Create context
export const AuthContext = createContext();

// 2️⃣ Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state

  // 3️⃣ Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("ecoUser");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false); // Authentication check complete
  }, []);

  // 4️⃣ Login function
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("ecoUser", JSON.stringify(userData));
  };

  // 5️⃣ Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("ecoUser");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("instituteData");
    localStorage.removeItem("ngoUser");
  };

  // 6️⃣ Provide context to children
  return (
    <AuthContext.Provider value={{ user, login, logout, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};