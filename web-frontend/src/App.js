import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentSetup from "./firstLogin/StudentSetup";
import StudentDashboard from "./pages/StudentDashboard";
import FacultyDashboard from "./pages/FacultyDashboard";
import Home from "./pages/Home";
import GovernmentDashboard from "./pages/GovernmentDashboard";
import InstituteRegistration from "./pages/InstituteRegistration";
import InstituteDashboard from "./pages/InstituteDashboard";
import LoginDebug from "./components/LoginDebug";
import PlantDriveManagement from "./government/PlantDriveManagement";

// NGO Components
const NGOLogin = React.lazy(() => import("./ngo/NGOLogin"));
const NGODashboard = React.lazy(() => import("./ngo/NGODashboard"));
const NGORegistration = React.lazy(() => import("./ngo/NGORegistration"));

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/setup-password" element={<StudentSetup />} />
          <Route path="/login-debug" element={<LoginDebug />} />

          <Route
            path="/StudentDashboard"
            element={
              <ProtectedRoute>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/FacultyDashboard"
            element={
              <ProtectedRoute>
                <FacultyDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/GovernmentDashboard"
            element={<GovernmentDashboard />}
          />

          <Route
            path="/plant-drive-management"
            element={<PlantDriveManagement />}
          />

          <Route
            path="/Institute-Registration"
            element={<InstituteRegistration />}
          />

          <Route
            path="/InstituteDashboard"
            element={
              <ProtectedRoute>
                <InstituteDashboard />
              </ProtectedRoute>
            }
          />

          {/* NGO Routes */}
          <Route
            path="/ngo/login"
            element={
              <React.Suspense fallback={<div>Loading...</div>}>
                <NGOLogin />
              </React.Suspense>
            }
          />
          <Route
            path="/ngo/register"
            element={
              <React.Suspense fallback={<div>Loading...</div>}>
                <NGORegistration />
              </React.Suspense>
            }
          />
          <Route
            path="/ngo/dashboard"
            element={
              <React.Suspense fallback={<div>Loading...</div>}>
                <NGODashboard />
              </React.Suspense>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
