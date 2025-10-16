import React from 'react'
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
      <div className="container-fluid">
        {/* Brand / Site Name */}
        <Link className="navbar-brand fw-bold text-success" to="/">
          RecyConnect
        </Link>

        {/* Toggler for mobile view */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNavDropdown"
          aria-controls="navbarNavDropdown"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navbar links */}
        <div className="collapse navbar-collapse justify-content-end" id="navbarNavDropdown">
          <ul className="navbar-nav">

            {/* Login Dropdown */}
            <li className="nav-item dropdown">
              <Link
                className="nav-link dropdown-toggle"
                to="#"
                id="loginDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Login
              </Link>
              <ul className="dropdown-menu" aria-labelledby="loginDropdown">
                <li>
                  <Link className="dropdown-item" to="/user_login">
                    As User
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/vendor_login">
                    As Vendor
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/admin_login">
                    As Admin
                  </Link>
                </li>
              </ul>
            </li>

            {/* Register Dropdown */}
            <li className="nav-item dropdown ms-3">
              <Link
                className="nav-link dropdown-toggle"
                to="#"
                id="registerDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Register
              </Link>
              <ul className="dropdown-menu" aria-labelledby="registerDropdown">
                <li>
                  <Link className="dropdown-item" to="/user_registration">
                    As User
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/vendor_registration">
                    As Vendor
                  </Link>
                </li>
              </ul>
            </li>

          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
