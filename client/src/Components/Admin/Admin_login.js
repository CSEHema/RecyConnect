import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import image from "../../static/images/Untitled_design.png";

function generateCaptcha(length = 5) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let captcha = "";
  for (let i = 0; i < length; i++) {
    captcha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return captcha;
}

function Admin_login() {
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [userCaptcha, setUserCaptcha] = useState("");
  const [captchaError, setCaptchaError] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setCaptcha(generateCaptcha());
  }, []);

  const refreshCaptcha = () => {
    setCaptcha(generateCaptcha());
    setUserCaptcha("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (userCaptcha.trim() !== captcha.trim()) {
      setCaptchaError("CAPTCHA does not match.");
      return;
    } else {
      setCaptchaError("");
    }

    try {
      const res = await axios.post("http://localhost:5000/api/auth/admin-login", {
        name,
        password,
      });

      if (res.data.success) {
        navigate("/admin_dashboard");
      } else {
        setError(res.data.message || "Invalid name or password.");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Try again.");
    }
  };

  return (
    <div className="container-fluid px-0">
      <div className="row g-0 min-vh-100">
        {/* LEFT SIDE - FULL COVER IMAGE */}
        <div
          className="col-md-6 d-none d-md-block"
          style={{
            backgroundImage: `url(${image})`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          }}
        ></div>

        {/* RIGHT SIDE - LOGIN FORM */}
        <div className="col-12 col-md-6 d-flex flex-column bg-light">
          <div className="d-flex flex-grow-1 align-items-center justify-content-center px-3 py-5">
            <div className="col-12 col-sm-10 col-md-10 col-lg-9 col-xl-8">
              <div className="p-4 bg-white bg-opacity-75 rounded-4 shadow">
                <h3 className="text-center fw-bold mb-4 text-success">
                  Admin Login
                </h3>

                <form onSubmit={handleSubmit}>
                  {/* Name */}
                  <div className="mb-3">
                    <label htmlFor="adminName" className="form-label">
                      Admin Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="adminName"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  {/* Password */}
                  <div className="mb-3">
                    <label htmlFor="adminPassword" className="form-label">
                      Password
                    </label>
                    <div className="input-group">
                      <input
                        type={visible ? "text" : "password"}
                        className="form-control"
                        id="adminPassword"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary text-success"
                        onClick={() => setVisible((prev) => !prev)}
                      >
                        {visible ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  {/* CAPTCHA */}
                  <div className="mb-3">
                    <label className="form-label">CAPTCHA</label>
                    <div className="d-flex align-items-center mb-2">
                      <div className="bg-light border rounded px-3 py-2 me-2 fw-bold fs-4 font-monospace">
                        {captcha}
                      </div>
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={refreshCaptcha}
                      >
                        ↻ Refresh
                      </button>
                    </div>
                    <input
                      type="text"
                      className="form-control"
                      value={userCaptcha}
                      onChange={(e) => setUserCaptcha(e.target.value)}
                      required
                    />
                    {captchaError && (
                      <div className="form-text text-danger">{captchaError}</div>
                    )}
                  </div>

                  {error && <p className="text-danger">{error}</p>}

                  <button
                    type="submit"
                    className="btn btn-success text-light w-100"
                  >
                    Login
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin_login;
