import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import {
  Button,
  Modal,
  Image,
  Badge,
  Row,
  Col,
  Form,
  Alert,
  Table,
  Card,
  Container,
  Spinner,
  Dropdown
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

// Standardizing Assets & Fallbacks
import USER_BANNER from "../../static/images/user_dash_banner.png"; 
import USER_PROFILE_ICON from "../../static/images/Untitled_1.png";
import VENDOR_PROFILE_IMG from "../../static/images/Untitled_1.png";
import jug from "../../static/images/plastic_jug.jpg";

const API_BASE_URL = "https://recyconnect.onrender.com";

const User_dashboard = ({ onLogout, user }) => {
  const navigate = useNavigate();
  const userId = useMemo(() => user?._id || user?.id, [user]);
  const userName = user?.name || "Member";
  const userEmail = user?.email || "Not Available";
  const userProfilePic = user?.profileImage || USER_PROFILE_ICON;

  // ---------------------------------------------------------
  // 1. STATE MANAGEMENT (STRICTLY PRESERVED)
  // ---------------------------------------------------------
  const [activeTab, setActiveTab] = useState("listings");
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [newItemName, setNewItemName] = useState("");
  const [newItemWeight, setNewItemWeight] = useState("");
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemImageFile, setNewItemImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [listings, setListings] = useState([]);
  const [vendorRequests, setVendorRequests] = useState([]);
  const [history, setHistory] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingRequests, setProcessingRequests] = useState(new Set());
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // ---------------------------------------------------------
  // 2. DATA FETCHING LOGIC (STRICTLY PRESERVED)
  // ---------------------------------------------------------
  const fetchDashboardData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [resListings, resRequests, resHistory] = await Promise.all([
        axios.get(`${API_BASE_URL}/user/listings/${userId}`),
        axios.get(`${API_BASE_URL}/user/requests/${userId}`),
        axios.get(`${API_BASE_URL}/history/user/${userId}`).catch(() => ({ data: [] }))
      ]);

      setListings(resListings.data || []);
      setVendorRequests(resRequests.data || []);
      setHistory(resHistory.data || []);
      setError(null);
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
      setError("Unable to sync data. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // ---------------------------------------------------------
  // 3. HANDLERS (STRICTLY PRESERVED)
  // ---------------------------------------------------------
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.size < 5000000) {
      setNewItemImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      alert("File is too large (Limit 5MB).");
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (isProcessing) return;
    setIsProcessing(true);

    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("name", newItemName);
    formData.append("weight", newItemWeight);
    formData.append("qty", newItemQty);
    formData.append("price", newItemPrice);
    formData.append("address", user?.address || "Primary Location");
    if (newItemImageFile) formData.append("image", newItemImageFile);

    try {
      const res = await axios.post(`${API_BASE_URL}/user/listings`, formData);
      setListings(prev => [res.data, ...prev]);
      setShowAddModal(false);
      resetForm();
      setSuccessMsg("Item listed successfully!");
    } catch (err) {
      setError("Failed to create listing.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAcceptOrder = async (requestId) => {
    if (processingRequests.has(requestId)) return;
    const confirmAccept = window.confirm("Accept this offer and mark item as sold?");
    if (!confirmAccept) return;

    setProcessingRequests(prev => new Set(prev).add(requestId));
    try {
      await axios.patch(`${API_BASE_URL}/user/requests/${requestId}/accept`);
      setSuccessMsg("Order accepted!");
      fetchDashboardData();
    } catch (err) {
      setError("Failed to process acceptance.");
    } finally {
      setProcessingRequests(prev => {
        const next = new Set(prev);
        next.delete(requestId);
        return next;
      });
    }
  };

  const resetForm = () => {
    setNewItemName(""); setNewItemWeight(""); setNewItemQty(1); setNewItemPrice("");
    setNewItemImageFile(null); setImagePreview(null);
  };

  // ---------------------------------------------------------
  // 4. UNIFIED STYLING (THE ENHANCEMENT)
  // ---------------------------------------------------------
  const unifiedStyles = `
    .dashboard-layout { display: flex; flex-direction: column; height: 100vh; background-color: #f4f7f6; }
    .top-navbar { background: #1b5e20; color: #fff; padding: 0.8rem 2rem; display: flex; justify-content: space-between; align-items: center; z-index: 1000; }
    .main-content-wrapper { display: flex; flex-grow: 1; overflow: hidden; }
    
    .sidebar { width: 280px; background: white; display: flex; flex-direction: column; border-right: 1px solid #e0e0e0; padding: 30px 0; }
    .nav-item { padding: 16px 28px; cursor: pointer; color: #555; font-weight: 500; display: flex; align-items: center; transition: 0.2s; border-left: 4px solid transparent; }
    .nav-item:hover { background: #f8f9fa; color: #1b5e20; }
    .nav-item.active { background: #e8f5e9; color: #1b5e20; border-left: 5px solid #1b5e20; font-weight: 700; }
    
    .main-content { flex-grow: 1; overflow-y: auto; padding: 30px; }
    .content-banner { height: 180px; background: linear-gradient(45deg, #1b5e20, #43a047); border-radius: 15px; margin-bottom: 30px; color: white; display: flex; flex-direction: column; justify-content: center; padding-left: 50px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    
    .item-card { background: white; border-radius: 12px; padding: 20px; margin-bottom: 18px; border: 1px solid #eee; display: flex; align-items: center; transition: 0.3s; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
    .item-card:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,0,0,0.08); }
    .item-img { width: 85px; height: 85px; object-fit: cover; border-radius: 10px; margin-right: 20px; border: 1px solid #eee; }
    
    .floating-add { position: fixed; bottom: 30px; right: 30px; width: 60px; height: 60px; border-radius: 50%; background: #1b5e20; color: white; font-size: 28px; box-shadow: 0 5px 15px rgba(0,0,0,0.2); border:none; cursor:pointer; display: flex; align-items: center; justify-content: center; transition: 0.3s; }
    .floating-add:hover { background: #2e7d32; transform: scale(1.1); }
    
    .price-tag { font-size: 1.1rem; color: #1b5e20; font-weight: 700; }
  `;

  return (
    <div className="dashboard-layout">
      <style>{unifiedStyles}</style>

      {/* HEADER */}
      <nav className="top-navbar shadow-sm">
        <Link to="/" className="text-white text-decoration-none fw-bold fs-4">RecyConnect</Link>
        <div className="d-flex align-items-center gap-3">
          <Dropdown align="end">
            <Dropdown.Toggle variant="success" className="rounded-pill px-3 py-1 border-light shadow-sm">
              Hello, {userName.split(' ')[0]}
            </Dropdown.Toggle>
            <Dropdown.Menu className="shadow border-0 mt-2">
              <Dropdown.Item onClick={() => setActiveTab('listings')}>Dashboard</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={onLogout} className="text-danger">Logout</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </nav>

      <div className="main-content-wrapper">
        {/* SIDEBAR */}
        <aside className="sidebar shadow-sm">
          <div className="text-center mb-5 px-3 pt-4">
            <Image 
              src={userProfilePic} 
              roundedCircle 
              width="100" 
              height="100" 
              className="shadow-sm mb-3" 
              style={{ objectFit: 'cover', border: '3px solid #1b5e20', padding: '2px' }} 
            />
            <h5 className="text-dark fw-bold mb-1">{userName}</h5>
            <Badge bg="light" text="dark" className="border px-3 mb-4">Household Member</Badge>
          </div>
          <nav>
            <div className={`nav-item ${activeTab === 'listings' ? 'active' : ''}`} onClick={() => setActiveTab('listings')}>
              <i className="bi bi-grid-fill me-3"></i> My Listings
            </div>
            <div className={`nav-item ${activeTab === 'requests' ? 'active' : ''}`} onClick={() => setActiveTab('requests')}>
              <i className="bi bi-chat-left-dots-fill me-3"></i> Requests 
              {vendorRequests.length > 0 && <Badge bg="danger" pill className="ms-auto">{vendorRequests.length}</Badge>}
            </div>
            <div className={`nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
              <i className="bi bi-check-circle-fill me-3"></i> Confirmed Deals
            </div>
          </nav>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="main-content">
          {successMsg && <Alert variant="success" dismissible onClose={() => setSuccessMsg(null)} className="shadow-sm">{successMsg}</Alert>}
          {error && <Alert variant="danger" dismissible onClose={() => setError(null)} className="shadow-sm">{error}</Alert>}
          
          <div className="content-banner shadow-sm">
            <h2 className="fw-bold m-0">Eco-Dashboard</h2>
            <p className="lead opacity-75 mb-0">Managing your sustainable contributions.</p>
          </div>

          {/* TAB: LISTINGS */}
          {activeTab === "listings" && (
            <Container fluid className="px-0">
              <div className="d-flex justify-content-between mb-4 align-items-center">
                <h4 className="fw-bold m-0">Active Inventory</h4>
                <Button variant="success" className="rounded-pill px-4 shadow-sm" onClick={() => setShowAddModal(true)}>
                  + New Listing
                </Button>
              </div>
              {loading ? (
                <div className="text-center py-5"><Spinner animation="border" variant="success" /></div>
              ) : listings.length === 0 ? (
                <Card className="text-center py-5 border-0 bg-transparent"><p className="text-muted">No active items. Start by adding a listing!</p></Card>
              ) : (
                listings.map(item => (
                  <div key={item._id} className="item-card">
                    <Image src={item.imageUrl || jug} className="item-img" />
                    <div className="flex-grow-1">
                      <h6 className="fw-bold mb-1 text-capitalize">{item.name}</h6>
                      <div className="text-muted small mb-1">{item.weight} • Qty: {item.qty}</div>
                      <div className="price-tag">₹{item.price}</div>
                    </div>
                    <Badge bg="success" className="rounded-pill px-3 py-2">Available</Badge>
                  </div>
                ))
              )}
            </Container>
          )}

          {/* TAB: REQUESTS */}
          {activeTab === "requests" && (
            <Container fluid className="px-0">
              <h4 className="fw-bold mb-4">Incoming Vendor Offers</h4>
              {vendorRequests.length === 0 ? (
                <Card className="text-center py-5 border-0 bg-transparent"><p className="text-muted">No offers yet. Vendors will contact you soon.</p></Card>
              ) : (
                vendorRequests.map(req => (
                  <div key={req._id} className="item-card border-start border-5 border-primary">
                    <div className="flex-grow-1">
                      <strong className="text-primary d-block mb-1">{req.vendorName}</strong>
                      <div className="fw-bold mb-1">Item: {req.itemName}</div>
                      <div className="price-tag">Offer: ₹{req.price}</div>
                    </div>
                    <div className="d-flex gap-2">
                      <Button variant="outline-primary" className="rounded-pill px-3" size="sm" onClick={() => {setSelectedVendor(req); setShowVendorModal(true);}}>
                        Vendor Info
                      </Button>
                      <Button 
                        variant="success" 
                        className="rounded-pill px-3" 
                        size="sm" 
                        onClick={() => handleAcceptOrder(req._id)} 
                        disabled={processingRequests.has(req._id)}
                      >
                        {processingRequests.has(req._id) ? <Spinner size="sm" /> : "Accept Deal"}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </Container>
          )}

          {/* TAB: HISTORY */}
          {activeTab === "history" && (
            <Container fluid className="px-0">
              <h4 className="fw-bold mb-4">Confirmed & Completed Deals</h4>
              <Table hover responsive className="bg-white shadow-sm rounded overflow-hidden">
                <thead className="table-success">
                  <tr>
                    <th className="py-3">Item Name</th>
                    <th className="py-3">Vendor</th>
                    <th className="py-3">Final Amount</th>
                    <th className="py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length === 0 ? (
                    <tr><td colSpan="4" className="text-center py-4 text-muted">No history found.</td></tr>
                  ) : (
                    history.map(entry => (
                      <tr key={entry._id} className="align-middle">
                        <td className="fw-bold">{entry.itemName}</td>
                        <td>{entry.vendorName}</td>
                        <td className="text-success fw-bold">₹{entry.price}</td>
                        <td className="text-center">
                          <Badge bg="success" className="rounded-pill px-3">PENDING PICKUP</Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Container>
          )}
        </main>
      </div>

      {/* FLOATING ACTION BUTTON */}
      <button className="floating-add" onClick={() => setShowAddModal(true)} title="Add New Listing">+</button>

      {/* MODAL: VENDOR DETAILS */}
      <Modal show={showVendorModal} onHide={() => setShowVendorModal(false)} centered>
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>Vendor Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedVendor && (
            <div className="text-center">
              <Image src={VENDOR_PROFILE_IMG} roundedCircle width="100" height="100" className="mb-3 border shadow-sm" />
              <h4 className="fw-bold mb-1">{selectedVendor.vendorName}</h4>
              <p className="text-muted mb-3">{selectedVendor.vendorEmail}</p>
              <hr />
              <div className="text-start bg-light p-3 rounded">
                <p className="mb-2"><strong><i className="bi bi-telephone-fill me-2"></i> Contact:</strong> {selectedVendor.vendorPhone}</p>
                <p className="mb-0"><strong><i className="bi bi-truck me-2"></i> Logistics:</strong> Vendor will contact you for pickup scheduling.</p>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* MODAL: ADD LISTING */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered backdrop="static">
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>List New Recyclable</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form onSubmit={handleAddItem}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Item Name</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="e.g. Plastic Bottles, Newspaper"
                onChange={(e) => setNewItemName(e.target.value)} 
                required 
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Weight/Volume</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="e.g. 5kg"
                    onChange={(e) => setNewItemWeight(e.target.value)} 
                    required 
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Base Price (₹)</Form.Label>
                  <Form.Control 
                    type="number" 
                    placeholder="0.00"
                    onChange={(e) => setNewItemPrice(e.target.value)} 
                    required 
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">Quantity</Form.Label>
              <Form.Control 
                type="number" 
                value={newItemQty}
                onChange={(e) => setNewItemQty(e.target.value)} 
                required 
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">Item Photo</Form.Label>
              <Form.Control type="file" onChange={handleImageUpload} accept="image/*" />
              {imagePreview && (
                <div className="mt-3 text-center">
                  <Image src={imagePreview} thumbnail style={{ maxHeight: '150px' }} />
                </div>
              )}
            </Form.Group>
            <Button 
              variant="success" 
              type="submit" 
              className="w-100 py-2 fw-bold rounded-pill" 
              disabled={isProcessing}
            >
              {isProcessing ? <Spinner size="sm" className="me-2" /> : "Post Listing Now"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default User_dashboard;
