import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import all components
import Front from "./Components/Front";

import User_login from "./Components/User/User_login";
import User_registration from "./Components/User/User_registration";
import User_dashboard from "./Components/User/User_dashboard";

import Vendor_login from "./Components/Vendor/Vendor_login";
import Vendor_registration from "./Components/Vendor/Vendor_registration";
import Vendor_dashboard from "./Components/Vendor/Vendor_dashboard";

import Admin_login from "./Components/Admin/Admin_login";
import Admin_dashboard from "./Components/Admin/Admin_DashBoard";

function App() {
  return (
    <Router>
      <Routes>
        {/* Home page */}
        <Route path="/" element={<Front />} />

        {/* User routes */}
        <Route path="/user_login" element={<User_login />} />
        <Route path="/user_registration" element={<User_registration />} />
        <Route path="/user_dashboard" element={<User_dashboard />} />

        {/* Vendor routes */}
        <Route path="/vendor_login" element={<Vendor_login />} />
        <Route path="/vendor_registration" element={<Vendor_registration />} />
        <Route path="/vendor_dashboard" element={<Vendor_dashboard />} />

        {/* Admin routes */}
        <Route path="/admin_login" element={<Admin_login />} />
        <Route path="/admin_dashboard" element={<Admin_dashboard />} />

        {/* Fallback for invalid URLs */}
        <Route path="*" element={<h2 style={{ textAlign: "center", marginTop: "2rem" }}>404 - Page Not Found</h2>} />
      </Routes>
    </Router>
  );
}

export default App;
