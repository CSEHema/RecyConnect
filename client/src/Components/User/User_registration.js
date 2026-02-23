import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { isValidPhoneNumber } from 'libphonenumber-js';
import { Badge, Button, Modal, Image, Row, Col, Form } from "react-bootstrap";
import image from '../../static/images/recycle_connect.gif';
import axios from 'axios';

function generateCaptcha(length = 5) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let captcha = "";
  for (let i = 0; i < length; i++) {
    captcha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return captcha;
}

function User_registration() {
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState(false);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phno, setPhno] = useState("");
  const [address, setAddress] = useState("");
  const [purposes, setPurposes] = useState([]);
  const [purposeInput, setPurposeInput] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [userCaptcha, setUserCaptcha] = useState("");
  const [captchaError, setCaptchaError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setCaptcha(generateCaptcha());
  }, []);

  const refreshCaptcha = () => {
    setCaptcha(generateCaptcha());
    setUserCaptcha("");
  };

  const validate = (email, password, phno) => {
    let result = { emailValid: true, passwordErrors: [], phErrors: [] };
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) result.emailValid = false;
    if (!isValidPhoneNumber(`+${phno}`)) result.phErrors.push('Invalid Phone Number');
    if (password.length < 8) result.passwordErrors.push("Password must be at least 8 characters.");
    return result;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = validate(email, password, phno);
    let isValid = true;

    if (!result.emailValid || result.passwordErrors.length > 0 || result.phErrors.length > 0) {
      setError(result);
      isValid = false;
    } else {
      setError(false);
    }

    if (userCaptcha.trim() !== captcha.trim()) {
      setCaptchaError("CAPTCHA does not match.");
      isValid = false;
    }

    if (isValid) {
      axios.post('http://localhost:5000/api/auth/register', {
        name, email, password, phno, address, purposes
      })
      .then(() => navigate("/user_login"))
      .catch((err) => setError(err.response?.data));
    }
  };

  return (
    <div className="container-fluid px-0">
      <div className="row g-0 min-vh-100">
        
        {/* LEFT SIDE: Original Large Image Section */}
        <div
          className="col-md-6 d-none d-md-block"
          style={{
            backgroundImage: `url(${image})`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          }}
        ></div>

        {/* RIGHT SIDE: Spaced out Form Section */}
        <div className="col-12 col-md-6 d-flex align-items-center justify-content-center bg-light p-4 p-lg-5">
          <div className="w-100" style={{ maxWidth: "550px" }}> 
            <div className="p-4 p-md-5 bg-white shadow-sm rounded-4">
              <h3 className="text-center fw-bold mb-4 text-success">Register as User</h3>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>

                <div className="mb-3">
                  <label className="form-label">Email address</label>
                  <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  {error && error.emailValid === false && <p className="text-danger small">Invalid email address.</p>}
                </div>

                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <div className="input-group">
                    <input type={visible ? "text" : "password"} className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <button className="btn btn-outline-secondary" type="button" onClick={() => setVisible(!visible)}>
                      {visible ? "Hide" : "Show"}
                    </button>
                  </div>
                  {error && error.passwordErrors?.map((err, i) => <p key={i} className="text-danger small">{err}</p>)}
                </div>

                <div className="mb-3">
                  <label className="form-label">Phone Number</label>
                  <PhoneInput country={'in'} value={phno} onChange={setPhno} inputStyle={{ width: '100%', height: '40px' }} />
                  {error && error.phErrors?.map((err, i) => <p key={i} className="text-danger small">{err}</p>)}
                </div>

                <div className="mb-3">
                  <label className="form-label">Address</label>
                  <textarea className="form-control" rows="2" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter your full address" required></textarea>
                </div>

                {/* Tags Section like Vendor */}
                <div className="mb-3">
                  <label className="form-label">What do you want to sell? (max 4)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Type a product and press Enter (e.g. scrap metal, e-waste)"
                    value={purposeInput}
                    onChange={(e) => setPurposeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (purposeInput.trim() && !purposes.includes(purposeInput.trim()) && purposes.length < 4) {
                          setPurposes([...purposes, purposeInput.trim()]);
                          setPurposeInput("");
                        }
                      }
                    }}
                  />
                  <div className="mt-2 d-flex flex-wrap gap-2">
                    {purposes.map((p, i) => (
                      <Badge key={i} bg="success" className="p-2">
                        {p} <span className="ms-1" style={{cursor: 'pointer'}} onClick={() => setPurposes(purposes.filter((_, idx) => idx !== i))}>&times;</span>
                      </Badge>
                    ))}
                  </div>
                </div>

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
                />
                  {captchaError && <p className="text-danger small">{captchaError}</p>}
                </div>
                <div className="form-check mb-3">
                <input
                  type="checkbox"
                  className="form-check-input border border-success"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  required={true}
                />  
                <label className="form-check-label" htmlFor="rememberMe">
                  By clicking here, you are accepting our<a className="text-success"> Privacy policy, Terms & Conditions</a>
                </label>
              </div>


                <button type="submit" className="btn btn-success w-100 py-2 fw-bold">Sign Up</button>
                <p className="text-center mt-3 small">Already have an account? <a href="/user_login" className="text-success fw-bold">Log In</a></p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default User_registration;
