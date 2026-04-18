import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";

// Import all components
import Front from "./Components/Front";
import User_login from "./Components/User/User_login";
import User_registration from "./Components/User/User_registration";
import User_dashboard from "./Components/User/User_dashboard";
import Vendor_login from "./Components/Vendor/Vendor_login";
import Vendor_registration from "./Components/Vendor/Vendor_registration";
import Vendor_dashboard from "./Components/Vendor/Vendor_dashboard";

/**
 * PROTECTED ROUTE COMPONENT
 * Redirects to login if the user state is empty
 */
const ProtectedRoute = ({ user, children }) => {
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  const navigate = useNavigate();

  // 1. Initialize user state from localStorage (Persists data on Refresh)
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("authenticatedUser");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error("Error parsing user from localStorage", error);
      return null;
    }
  });

  // 2. Update user state and storage after successful login
  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem("authenticatedUser", JSON.stringify(userData));
  };

  // 3. Clear all session data on Logout
  const handleLogout = () => {
    localStorage.clear(); // Clears token, userType, and authenticatedUser
    setUser(null);
    navigate("/");
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Front />} />
      
      <Route 
        path="/user_login" 
        element={<User_login onLoginSuccess={handleLoginSuccess} />} 
      />
      <Route path="/user_registration" element={<User_registration />} />

     <Route 
  path="/vendor_login" 
  element={<Vendor_login onLoginSuccess={handleLoginSuccess} />} 
/>
      <Route path="/vendor_registration" element={<Vendor_registration />} />

      {/* Protected User Dashboard */}
      <Route 
        path="/user_dashboard" 
        element={
          <ProtectedRoute user={user}>
            <User_dashboard onLogout={handleLogout} user={user} />
          </ProtectedRoute>
        } 
      />

      {/* Protected Vendor Dashboard */}
      <Route 
        path="/vendor_dashboard" 
        element={
          <ProtectedRoute user={user}>
            <Vendor_dashboard onLogout={handleLogout} user={user} />
          </ProtectedRoute>
        } 
      />

      {/* Fallback 404 */}
      <Route 
        path="*" 
        element={<h2 style={{ textAlign: "center", marginTop: "2rem" }}>404 - Page Not Found</h2>} 
      />
    </Routes>
  );
}

export default App;
