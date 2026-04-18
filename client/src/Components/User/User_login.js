import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import image from '../../static/images/Untitled_1.png';

// Helper to generate a fresh Captcha string
function generateCaptcha(length = 5) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let captcha = "";
  for (let i = 0; i < length; i++) {
    captcha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return captcha;
}

function User_login({ onLoginSuccess }) {
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState(false);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [userCaptcha, setUserCaptcha] = useState("");
  const [captchaError, setCaptchaError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  // 1. Initial Load: Set Captcha and check "Remember Me"
  useEffect(() => {
    setCaptcha(generateCaptcha());
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const refreshCaptcha = () => {
    setCaptcha(generateCaptcha());
    setUserCaptcha("");
  };

  // 2. Validation Helpers
  const validate_email = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validate_password = (psw) => {
    let errors = [];
    if (!/^.{8,16}$/.test(psw)) {
      errors.push("The password should contain from 8 to 16 characters.");
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9.,])(?!.*[.,]).+$/.test(psw)) {
      errors.push("Password must contain at least one uppercase, one lowercase, and one special character.");
    }
    return errors;
  };

  // 3. Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Front-end Validations
    const passwordValidation = validate_password(password);
    const isEmailValid = validate_email(email);
    const isCaptchaValid = userCaptcha.trim() === captcha.trim();

    if (!isEmailValid || passwordValidation.length > 0) {
      setError({ emailValid: isEmailValid, passwordErrors: passwordValidation });
      return;
    }

    if (!isCaptchaValid) {
      setCaptchaError("CAPTCHA does not match.");
      return;
    }

    // Clear UI Errors before API call
    setError(false);
    setCaptchaError("");

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });

      // Handle "Remember Me" logic
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      // CRITICAL: Send the actual database user data to App.js
      // This ensures the Dashboard sees real data, not static placeholders.
      if (onLoginSuccess) {
        onLoginSuccess(res.data.user); 
      }

      // Store token separately if your backend sends one
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }

      // Final redirect
      navigate("/user_dashboard");

    } catch (err) {
      setError({
        emailValid: true,
        passwordErrors: [err.response?.data?.error || "Login failed. Please check your credentials."],
      });
      refreshCaptcha(); // Force fresh captcha on failure
    }
  };

  return (
    <div className="container-fluid px-0">
      <div className="row g-0 min-vh-100">
        {/* LEFT SIDE: Visuals */}
        <div
          className="col-md-6 d-none d-md-block"
          style={{
            backgroundImage: `url(${image})`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          }}
        ></div>

        {/* RIGHT SIDE: Interactive Login */}
        <div className="col-12 col-md-6 d-flex flex-column bg-light">
          <div className="d-flex flex-grow-1 align-items-center justify-content-center px-3 py-5">
            <div className="col-12 col-sm-10 col-md-10 col-lg-9 col-xl-8">
              <div className="p-4 bg-white bg-opacity-75 rounded-4 shadow">
                <h3 className="text-center fw-bold mb-4 text-success">User Login</h3>
                <form onSubmit={handleSubmit}>
                  
                  {/* Email Input */}
                  <div className="mb-3">
                    <label className="form-label">Email address</label>
                    <input
                      type="email"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    {error && error.emailValid === false && (
                      <p className="text-danger small mt-1">Please enter a valid email.</p>
                    )}
                  </div>

                  {/* Password Input */}
                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <div className="input-group">
                      <input
                        type={visible ? "text" : "password"}
                        className="form-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setVisible(!visible)}
                      >
                        {visible ? "Hide" : "Show"}
                      </button>
                    </div>
                    {error && error.passwordErrors?.map((err, i) => (
                      <p key={i} className="text-danger small mt-1 mb-0">{err}</p>
                    ))}
                  </div>

                  {/* Captcha Section */}
                  <div className="mb-3">
                    <label className="form-label">Verification</label>
                    <div className="d-flex align-items-center mb-2">
                      <div className="bg-light border rounded px-3 py-2 me-2 fw-bold fs-4 font-monospace">
                        {captcha}
                      </div>
                      <button type="button" className="btn btn-sm btn-outline-success" onClick={refreshCaptcha}>
                        ↻ Refresh
                      </button>
                    </div>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter the code shown above"
                      value={userCaptcha}
                      onChange={(e) => setUserCaptcha(e.target.value)}
                      required
                    />
                    {captchaError && <div className="text-danger small mt-1">{captchaError}</div>}
                  </div>

                  {/* Options */}
                  <div className="form-check mb-3">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="rememberMe">Remember Me</label>
                  </div>

                  <button type="submit" className="btn btn-success w-100 py-2">Sign In</button>
                  
                  <p className="text-center mt-3">
                    New here? <a href="/user_registration" className="text-success fw-bold">Create an account</a>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default User_login;
