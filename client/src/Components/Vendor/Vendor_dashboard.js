import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  Image,
  Badge,
  Modal,
  Spinner,
  Table,
  Alert,
  Tabs,
  Tab
} from "react-bootstrap";
import { Link } from "react-router-dom";

// Standardizing assets
import banner from "../../static/images/user_dash_banner.png";
import profilePic from "../../static/images/Untitled_1.png"; 
import jug from "../../static/images/plastic_jug.jpg";

const API_BASE_URL = "https://recyconnect.onrender.com";

const Vendor_dashboard = ({ onLogout, user }) => {
  // ---------------------------------------------------------
  // 1. STATE MANAGEMENT
  // ---------------------------------------------------------
  const [activeTab, setActiveTab] = useState("discover");
  const [loading, setLoading] = useState(true);
  const [availableWaste, setAvailableWaste] = useState([]);
  const [myPickups, setMyPickups] = useState([]); // Awaiting Approval
  const [confirmedPickups, setConfirmedPickups] = useState([]); // User Accepted
  const [myHistory, setMyHistory] = useState([]); // Finalized Transactions
  
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState(null);

  // ---------------------------------------------------------
  // 2. DATA FETCHING (SYNCED WITH USER ACTIONS)
  // ---------------------------------------------------------
  const fetchData = useCallback(async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      const [listingsRes, requestsRes, confirmedRes, historyRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/user/listings`),
        axios.get(`${API_BASE_URL}/vendor/requests/${user.email}`),
        axios.get(`${API_BASE_URL}/history/vendor/${user.email}`), // Fetches SoldItems
        axios.get(`${API_BASE_URL}/history/vendor/${user.email}/completed`).catch(() => ({ data: [] }))
      ]);

      setAvailableWaste(listingsRes.data || []);
      setMyPickups(requestsRes.data || []);
      setConfirmedPickups(confirmedRes.data || []); 
      setMyHistory(historyRes.data || []);
      setError(null);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to sync with the server. Please try refreshing.");
    } finally {
      setLoading(false);
    }
  }, [user.email]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ---------------------------------------------------------
  // 3. HANDLERS
  // ---------------------------------------------------------
  const handlePlaceOrder = async (item) => {
    try {
      const requestData = {
        itemId: item._id,
        itemName: item.name,
        qty: item.qty,
        price: item.price,
        vendorName: user.name,
        vendorEmail: user.email,
        vendorPhone: user.phno || user.phone,
        vendorAddress: user.address,
        userId: item.userId,
        imageUrl: item.imageUrl || ""
      };

      await axios.post(`${API_BASE_URL}/user/requests`, requestData);
      alert("Pickup request sent! Wait for the homeowner to accept.");
      fetchData(); 
    } catch (err) {
      alert("Order failed: " + (err.response?.data?.error || err.message));
    }
  };

  const openUserProfile = (data) => {
    setSelectedUser(data);
    setShowUserModal(true);
  };

  // ---------------------------------------------------------
  // 4. CSS STYLES
  // ---------------------------------------------------------
  const styles = `
    .dashboard-layout { display: flex; flex-direction: column; min-height: 100vh; background-color: #f8f9fa; }
    .main-content-wrapper { display: flex; flex-grow: 1; overflow: hidden; }
    .top-navbar { background: #1b5e20; color: #fff; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; z-index: 1000; }
    .sidebar { width: 280px; background-color: #fff; border-right: 1px solid #dee2e6; padding: 30px 0; }
    .nav-item { padding: 15px 30px; cursor: pointer; color: #444; font-weight: 500; transition: 0.3s; display: flex; align-items: center; border-left: 4px solid transparent; }
    .nav-item:hover { background: #f1f8e9; color: #1b5e20; }
    .nav-item.active { background: #e8f5e9; color: #1b5e20; border-left: 4px solid #1b5e20; font-weight: 700; }
    .main-content { flex-grow: 1; overflow-y: auto; padding: 40px; }
    .content-banner { height: 200px; background: linear-gradient(rgba(27, 94, 32, 0.8), rgba(27, 94, 32, 0.8)), url(${banner}); background-size: cover; border-radius: 15px; margin-bottom: 30px; display: flex; align-items: center; justify-content: center; color: white; text-align: center; }
    .item-card { background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); display: flex; align-items: center; transition: 0.2s; border: 1px solid #eee; }
    .item-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .item-img-large { width: 100px; height: 100px; object-fit: cover; border-radius: 10px; margin-right: 20px; }
    .price-tag { font-size: 1.2rem; color: #1b5e20; font-weight: 700; }
  `;

  return (
    <div className="dashboard-layout">
      <style>{styles}</style>
      
      {/* HEADER */}
      <nav className="top-navbar shadow-sm">
        <Link to="/" className="text-white text-decoration-none fw-bold fs-3">
          Recy<span style={{ color: "#81c784" }}>Connect</span>
        </Link>
        <div className="d-flex align-items-center gap-3">
          <span>{user?.name} (Vendor)</span>
          <Button variant="outline-light" size="sm" className="rounded-pill" onClick={onLogout}>Logout</Button>
        </div>
      </nav>

      <div className="main-content-wrapper">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="text-center mb-5 px-3">
            <Image src={profilePic} roundedCircle width="80" height="80" className="border shadow-sm mb-3" />
            <h6 className="fw-bold text-success mb-0">{user?.name}</h6>
            <small className="text-muted">{user?.email}</small>
          </div>
          <div className={`nav-item ${activeTab === 'discover' ? 'active' : ''}`} onClick={() => setActiveTab('discover')}>
            <i className="bi bi-search me-3"></i> Discover Waste
          </div>
          <div className={`nav-item ${activeTab === 'pickups' ? 'active' : ''}`} onClick={() => setActiveTab('pickups')}>
            <i className="bi bi-truck me-3"></i> Active Pickups 
            {confirmedPickups.length > 0 && <Badge bg="danger" pill className="ms-2">{confirmedPickups.length}</Badge>}
          </div>
         
        </aside>

        {/* MAIN CONTENT */}
        <main className="main-content">
          <div className="content-banner shadow-sm">
            <div>
              <h2 className="fw-bold">Welcome back, {user?.name.split(' ')[0]}!</h2>
              <p className="mb-0 opacity-75">You have {confirmedPickups.length} confirmed pickups ready for collection.</p>
            </div>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

          {/* TAB: DISCOVER */}
          {activeTab === "discover" && (
            <Container fluid className="px-0">
              <h4 className="text-success fw-bold mb-4">Available Market Inventory</h4>
              {loading ? <Spinner animation="border" variant="success" /> : availableWaste.map(item => (
                <div key={item._id} className="item-card">
                  <Image src={item.imageUrl || jug} className="item-img-large" />
                  <div className="flex-grow-1">
                    <h5 className="fw-bold mb-1 text-capitalize">{item.name}</h5>
                    <div className="text-muted mb-2 small">{item.weight} • {item.qty} units</div>
                    <div className="price-tag">₹{item.price}</div>
                  </div>
                  <div className="text-end">
                    <Button variant="success" className="mb-2 w-100" onClick={() => handlePlaceOrder(item)}>Place Order</Button>
                    <Button variant="outline-dark" size="sm" className="w-100" onClick={() => openUserProfile(item)}>Seller Details</Button>
                  </div>
                </div>
              ))}
            </Container>
          )}

          {/* TAB: ACTIVE PICKUPS (UPDATED LOGIC) */}
          {activeTab === "pickups" && (
            <Container fluid className="px-0">
              <h4 className="text-primary fw-bold mb-4">Logistics Management</h4>
              
              {/* SECTION: CONFIRMED BY USER */}
              <h5 className="text-success fw-bold mb-3"><i className="bi bi-check2-circle me-2"></i>Confirmed - Ready for Pickup</h5>
              {confirmedPickups.length === 0 ? <p className="text-muted small ms-2">No items accepted by homeowners yet.</p> : (
                confirmedPickups.map(order => (
                  <div key={order._id} className="item-card border-success border-start border-5">
                    <Image src={order.imageUrl || jug} className="item-img-large" />
                    <div className="flex-grow-1">
                      <h5 className="fw-bold text-success mb-0">{order.itemName}</h5>
                      <div className="badge bg-success mb-2">USER ACCEPTED</div>
                      <div className="text-dark small">Price to Pay: <strong>₹{order.price}</strong></div>
                    </div>
                    <Button variant="success" onClick={() => openUserProfile(order)}>Get Pickup Address</Button>
                  </div>
                ))
              )}

              <hr className="my-5" />

              {/* SECTION: PENDING APPROVAL */}
              <h5 className="text-success fw-bold mb-3"><i className="bi bi-hourglass-split me-2"></i>Awaiting Homeowner Approval</h5>
              {myPickups.map(order => (
                <div key={order._id} className="item-card border-warning border-start border-5 opacity-75">
                  <div className="flex-grow-1 ps-3">
                    <h6 className="fw-bold mb-0">{order.itemName}</h6>
                    <small className="text-muted">Request sent to: {order.userId}</small>
                  </div>
                  <Badge bg="warning" text="dark">PENDING</Badge>
                </div>
              ))}
            </Container>
          )}

          {/* TAB: HISTORY */}
          {activeTab === "history" && (
            <Container fluid className="px-0">
              <h4 className="text-secondary fw-bold mb-4">Past Transactions</h4>
              <Table hover className="bg-white shadow-sm rounded">
                <thead className="table-light">
                  <tr>
                    <th>Item</th>
                    <th>Price</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {myHistory.length === 0 ? <tr><td colSpan="4" className="text-center">No history found.</td></tr> : 
                    myHistory.map(h => (
                      <tr key={h._id}>
                        <td>{h.itemName}</td>
                        <td className="fw-bold text-success">₹{h.price}</td>
                        <td>{new Date(h.soldDate || h.createdAt).toLocaleDateString()}</td>
                        <td><Badge bg="secondary">Completed</Badge></td>
                      </tr>
                    ))
                  }
                </tbody>
              </Table>
            </Container>
          )}
        </main>
      </div>

      {/* USER/SELLER DETAILS MODAL */}
      <Modal show={showUserModal} onHide={() => setShowUserModal(false)} centered>
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>Logistics Info</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedUser && (
            <div className="text-center">
              <Image src={profilePic} roundedCircle width="100" className="mb-3 border" />
              <h4 className="fw-bold">{selectedUser.userName || "Homeowner"}</h4>
              <hr />
              <div className="text-start">
                <p><strong><i className="bi bi-telephone-fill me-2"></i> Phone:</strong> {selectedUser.phone || "Contact via App"}</p>
                <p><strong><i className="bi bi-geo-alt-fill me-2"></i> Pickup Address:</strong><br/>
                   <span className="text-primary">{selectedUser.address || "Fetching address..."}</span>
                </p>
              </div>
              <Button variant="outline-success" className="w-100 mt-3" onClick={() => window.print()}>Print Address Label</Button>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Vendor_dashboard;
