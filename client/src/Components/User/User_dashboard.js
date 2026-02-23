import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  Modal,
  Image,
  Badge,
  Row,
  Col,
  Form
} from "react-bootstrap";
import {Link} from "react-router-dom";

// Assets
import USER_BANNER from "../../static/images/user_dash_banner.png"; 
import USER_PROFILE_ICON from "../../static/images/Untitled_1.png";
import VENDOR_PROFILE_IMG from "../../static/images/Untitled_1.png";
import jug from "../../static/images/plastic_jug.jpg";
import jute from "../../static/images/jute.jpg";

const API_BASE_URL = "http://localhost:5000/api";

const User_dashboard = ({onLogout}) => {
  const [activeTab, setActiveTab] = useState("listings");
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form States
  const [newItemName, setNewItemName] = useState("");
  const [newItemWeight, setNewItemWeight] = useState("");
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemImage, setNewItemImage] = useState(null);

  // Safety Lock State
  const [isProcessing, setIsProcessing] = useState(false);

  // Data States
  const [listings, setListings] = useState([]);
  const [vendorRequests, setVendorRequests] = useState([]);
  const [history, setHistory] = useState([]); 

  // --- 1. DATA FETCHING ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resListings, resRequests] = await Promise.all([
          axios.get(`${API_BASE_URL}/user/listings`),
          axios.get(`${API_BASE_URL}/user/requests`)
        ]);
        setListings(resListings.data);
        setVendorRequests(resRequests.data);
      } catch (err) {
        console.warn("Backend offline. Loading local dummy data.");
        setListings([
          { _id: "p1", name: "Plastic Bottles", weight: "5kg", qty: 2, initialQty: 5, images: [`${jug}`] },
          { _id: "p2", name: "Old Jute Bags", weight: "2kg", qty: 0, initialQty: 10, images: [`${jute}`] },
        ]);
        setVendorRequests([
          { 
            _id: "r1", itemId: "p1", itemName: "Plastic Bottles", vendorName: "Green Recycle Corp", 
            vendorEmail: "contact@greenrecycle.com", vendorPhone: "+91 98765 43210",
            vendorAddress: "123 Eco Park, Hyderabad", preferredItems: ["Plastic", "Glass"], distance: "2.5 km"
          },
        ]);
      }
    };
    fetchData();
  }, []);

  // --- 2. CORE LOGIC: UPDATE LOCAL STATE ---
  // This function handles the visual logic for stock and history
  const performLocalUpdate = (requestId, itemId) => {
    const targetItem = listings.find(item => item._id === itemId);
    if (!targetItem) return;

    // A. Update Stock (Safe functional update)
    setListings(prev => prev.map(item => 
      item._id === itemId ? { ...item, qty: Math.max(0, item.qty - 1) } : item
    ));

    // B. Move to History (Deduplicated)
    const acceptedReq = vendorRequests.find(req => req._id === requestId);
    if (acceptedReq) {
      setHistory(prev => {
        if (prev.find(h => h._id === requestId)) return prev;
        return [{
          ...acceptedReq,
          acceptedAt: new Date().toLocaleString(),
          itemSoldName: targetItem.name, 
          itemImage: targetItem.images[0]
        }, ...prev];
      });
    }

    // C. Remove from requests
    setVendorRequests(prev => prev.filter(req => req._id !== requestId));
  };

  // --- 3. BACKEND COORDINATION: ACCEPT ORDER ---
  const handleAcceptOrder = async (requestId, itemId) => {
    if (isProcessing) return;
    
    const targetItem = listings.find(item => item._id === itemId);
    if (!targetItem || targetItem.qty <= 0) {
      alert("Stock Out!");
      return;
    }

    setIsProcessing(true);

    try {
      // Try backend first
      await axios.patch(`${API_BASE_URL}/user/requests/${requestId}/accept`);
      performLocalUpdate(requestId, itemId);
    } catch (err) {
      // SILENT FALLBACK: If backend fails, we still update the UI locally for testing
      console.warn("Backend patch failed, updating UI locally only.");
      performLocalUpdate(requestId, itemId);
    } finally {
      setIsProcessing(false);
    }
  };

  // --- 4. BACKEND COORDINATION: ADD ITEM ---
  const handleAddItem = async (e) => {
    e.preventDefault();
    if (isProcessing) return;
    setIsProcessing(true);

    const itemToAdd = {
      name: newItemName,
      weight: newItemWeight,
      qty: parseInt(newItemQty),
      images: [newItemImage || jug]
    };

    try {
      const res = await axios.post(`${API_BASE_URL}/user/listings`, itemToAdd);
      setListings(prev => [res.data, ...prev]);
    } catch (err) {
      console.warn("Backend add failed, adding locally only.");
      setListings(prev => [{ ...itemToAdd, _id: `local_${Date.now()}` }, ...prev]);
    } finally {
      setIsProcessing(false);
      setShowAddModal(false);
      setNewItemName(""); setNewItemWeight("");
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) setNewItemImage(URL.createObjectURL(file));
  };

  return (
    <>
      <style>{`
        .dashboard-layout { display: flex; flex-direction: column; height: 100vh; background-color: #f8f9fa; }
        .main-content-wrapper { display: flex; flex-grow: 1; overflow: hidden; }
        .top-navbar { background: #1b5e20; color: #fff; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; }
        .sidebar { width: 280px; background-color: #e8f5e9; border-right: 1px solid #c8e6c9; padding: 30px 0; }
        .nav-item { padding: 15px 30px; cursor: pointer; color: #2e7d32; font-weight: 500; font-size: 1.1rem; }
        .nav-item.active { background: #2e7d32; color: white; }
        .main-content { flex-grow: 1; overflow-y: auto; padding: 40px; position: relative; }
        .content-banner { height: 200px; background: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${USER_BANNER}); background-size: cover; background-position: center; border-radius: 15px; margin-bottom: 35px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; }
        .item-card { background: white; border-radius: 12px; padding: 25px; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); display: flex; align-items: center; border-left: 8px solid #1b5e20; }
        .item-img { width: 100px; height: 100px; object-fit: cover; border-radius: 12px; margin-right: 25px; }
        .highlight-item { color: #1b5e20; font-weight: 800; font-size: 1.2rem; }
        .floating-add-btn { position: fixed; bottom: 40px; right: 40px; width: 75px; height: 75px; border-radius: 50%; background: #1b5e20; color: white; border: none; font-size: 35px; box-shadow: 0 4px 15px rgba(0,0,0,0.3); z-index: 100; transition: 0.2s; }
        .floating-add-btn:hover { transform: scale(1.1); }
      `}</style>

      <div className="dashboard-layout">
        <nav className="top-navbar">
  {/* Standardized Logo Branding */}
  <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }} className="fw-bold fs-3">
    Recy<span style={{ color: "#81c784" }}>Connect</span>
  </Link>
  
  <Button variant="outline-light" onClick={onLogout}>Logout</Button>
</nav>

        <div className="main-content-wrapper">
          <aside className="sidebar">
            <div className="text-center mb-5">
              <Image src={USER_PROFILE_ICON} roundedCircle width="110" height="110" className="border shadow-sm mb-3" />
              <h4 className="text-success fw-bold">Bhavya Srinivas</h4>
            </div>
            <div className={`nav-item ${activeTab === 'listings' ? 'active' : ''}`} onClick={() => setActiveTab('listings')}>My Waste Listings</div>
            <div className={`nav-item ${activeTab === 'requests' ? 'active' : ''}`} onClick={() => setActiveTab('requests')}>Vendor Requests ({vendorRequests.length})</div>
            <div className={`nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>Accepted Orders ({history.length})</div>
          </aside>

          <main className="main-content">
            <div className="content-banner">
                <h1 className="display-5 fw-bold">Your small actions, our planet’s big change.</h1>
                <p className="lead fst-italic">Manage your impact. List. Recycle. Repeat.</p>
            </div>

            {activeTab === "listings" && <button className="floating-add-btn" onClick={() => setShowAddModal(true)} disabled={isProcessing}>+</button>}

            {activeTab === "listings" && (
              <div>
                <h3 className="mb-4 text-success fw-bold">Inventory</h3>
                {listings.map(item => (
                  <div key={item._id} className="item-card">
                    <Image src={item.images[0]} className="item-img" />
                    <div className="flex-grow-1">
                      <div className="fw-bold fs-3">{item.name} {item.qty === 0 && <Badge bg="danger" className="ms-2">Stock Out</Badge>}</div>
                      <div className="text-muted">Weight: {item.weight} | <span className="fw-bold text-success">Qty: {item.qty}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "requests" && (
              <div>
                <h3 className="mb-4 text-primary fw-bold">Incoming Requests</h3>
                {vendorRequests.map(req => {
                  const currentStock = listings.find(i => i._id === req.itemId)?.qty || 0;
                  return (
                    <div key={req._id} className="item-card" style={{borderLeftColor: '#1565c0'}}>
                      <div className="flex-grow-1">
                        <div className="fw-bold fs-4 text-primary">{req.vendorName}</div>
                        <div className="fs-5">Item: <span className="highlight-item">{req.itemName}</span></div>
                      </div>
                      <div className="d-flex gap-2">
                        <Button 
                          variant="success" 
                          className="fw-bold px-4" 
                          onClick={() => handleAcceptOrder(req._id, req.itemId)}
                          disabled={isProcessing || currentStock <= 0}
                        >
                          {isProcessing ? "Wait..." : currentStock <= 0 ? "No Stock" : "Accept Order"}
                        </Button>
                        <Button variant="outline-primary" onClick={() => {setSelectedVendor(req); setShowVendorModal(true);}}>Profile</Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === "history" && (
              <div>
                <h3 className="mb-4 text-secondary fw-bold">Confirmed Deals</h3>
                {history.map(entry => (
                  <div key={entry._id} className="item-card" style={{borderLeftColor: '#6c757d'}}>
                    <Image src={entry.itemImage} className="item-img" />
                    <div className="flex-grow-1">
                      <div className="fw-bold fs-4">{entry.vendorName}</div>
                      <div className="fs-5">Item: <span className="highlight-item">{entry.itemSoldName}</span></div>
                      <div className="small text-muted">{entry.acceptedAt}</div>
                    </div>
                    <Button variant="info" className="text-white fw-bold" onClick={() => {setSelectedVendor(entry); setShowVendorModal(true);}}>Vendor Details</Button>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Profile Modal */}
      <Modal show={showVendorModal} onHide={() => setShowVendorModal(false)} centered size="lg">
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title className="fw-bold">Vendor Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedVendor && (
            <Row className="align-items-center">
              <Col md={4} className="text-center border-end">
                <Image src={VENDOR_PROFILE_IMG} roundedCircle width="125" height="125" className="border shadow-sm mb-3" style={{ border: '3px solid #1b5e20' }} />
                <h4 className="fw-bold">{selectedVendor.vendorName}</h4>
                <Badge bg="success">Verified</Badge>
              </Col>
              <Col md={8} className="ps-4">
                <p className="fs-5"><strong>Phone:</strong> {selectedVendor.vendorPhone}</p>
                <p className="fs-5"><strong>Email:</strong> {selectedVendor.vendorEmail}</p>
                <p className="fs-5"><strong>Address:</strong> {selectedVendor.vendorAddress}</p>
                <div className="d-flex flex-wrap gap-2 mt-2">
                  {selectedVendor.preferredItems?.map((tag, i) => <Badge key={i} bg="light" text="dark" className="border px-3 py-2">{tag}</Badge>)}
                </div>
              </Col>
            </Row>
          )}
        </Modal.Body>
      </Modal>

      {/* Add Item Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton className="bg-success text-white"><Modal.Title>Add Waste Listing</Modal.Title></Modal.Header>
        <Modal.Body className="p-4">
          <Form onSubmit={handleAddItem}>
            <Form.Group className="mb-3"><Form.Label className="fw-bold">Item Name</Form.Label><Form.Control type="text" onChange={(e) => setNewItemName(e.target.value)} required /></Form.Group>
            <Row>
              <Col><Form.Group className="mb-3"><Form.Label className="fw-bold">Weight</Form.Label><Form.Control type="text" onChange={(e) => setNewItemWeight(e.target.value)} required /></Form.Group></Col>
              <Col><Form.Group className="mb-3"><Form.Label className="fw-bold">Qty</Form.Label><Form.Control type="number" min="1" value={newItemQty} onChange={(e) => setNewItemQty(e.target.value)} /></Form.Group></Col>
            </Row>
            <Button variant="success" type="submit" className="w-100 fw-bold py-2" disabled={isProcessing}>{isProcessing ? "Wait..." : "Post Listing"}</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default User_dashboard;
