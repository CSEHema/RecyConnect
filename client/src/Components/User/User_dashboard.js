import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Button,
  Modal,
  Image,
  Badge,
  Row,
  Col,
  Form,
  Alert
} from "react-bootstrap";
import { Link } from "react-router-dom";

// Assets
import USER_BANNER from "../../static/images/user_dash_banner.png"; 
import USER_PROFILE_ICON from "../../static/images/Untitled_1.png";
import VENDOR_PROFILE_IMG from "../../static/images/Untitled_1.png";
import jug from "../../static/images/plastic_jug.jpg";
import jute from "../../static/images/jute.jpg";

const API_BASE_URL = "http://localhost:5000/api";

const User_dashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState("listings");
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form states
  const [newItemName, setNewItemName] = useState("");
  const [newItemWeight, setNewItemWeight] = useState("");
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemImageFile, setNewItemImageFile] = useState(null);  // File
  const [imagePreview, setImagePreview] = useState(null);          // object URL

  // Safety / status
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingRequests, setProcessingRequests] = useState(new Set());
  const [error, setError] = useState(null);

  // Data states
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

        // Normalize images coming from backend to always be array of URLs
        const normalizedListings = resListings.data.map(item => ({
          ...item,
          images: item.images && item.images.length
            ? item.images
            : [jug]
        }));

        setListings(normalizedListings);
        setVendorRequests(resRequests.data);
        setError(null);
      } catch (err) {
        console.warn("Backend offline. Loading local dummy data.");
        setListings([
          { _id: "p1", name: "Plastic Bottles", weight: "5kg", qty: 2, initialQty: 5, images: [jug], price: 30 },
          { _id: "p2", name: "Old Jute Bags", weight: "2kg", qty: 0, initialQty: 10, images: [jute], price: 50 },
        ]);
        setVendorRequests([
          { 
            _id: "r1", itemId: "p1", itemName: "Plastic Bottles", qty: 1, price: 30, 
            vendorName: "Green Recycle Corp", vendorEmail: "contact@greenrecycle.com", 
            vendorPhone: "+91 98765 43210", vendorAddress: "123 Eco Park, Hyderabad", 
            preferredItems: ["Plastic", "Glass"], distance: "2.5 km"
          },
        ]);
        setError("Using demo data (backend offline)");
      }
    };
    fetchData();
  }, []);

  // --- Image Preview Cleanup ---
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // --- 2. CORE LOGIC: UPDATE LOCAL STATE ---
  const performLocalUpdate = useCallback((requestId, itemId) => {
    const targetItem = listings.find(item => item._id === itemId);
    if (!targetItem) return;

    // A. Update Stock
    setListings(prev => prev.map(item => 
      item._id === itemId ? { ...item, qty: Math.max(0, item.qty - 1) } : item
    ));

    // B. Move to History using request price/qty
    const acceptedReq = vendorRequests.find(req => req._id === requestId);
    if (acceptedReq) {
      setHistory(prev => {
        if (prev.find(h => h._id === requestId)) return prev;
        return [{
          ...acceptedReq,
          _id: requestId,
          acceptedAt: new Date().toLocaleString(),
          itemSoldName: acceptedReq.itemName,
          itemImage: targetItem.images?.[0] || jug,
          itemPrice: acceptedReq.price,
          itemQty: acceptedReq.qty,
        }, ...prev];
      });
    }

    // C. Remove from requests
    setVendorRequests(prev => prev.filter(req => req._id !== requestId));
  }, [listings, vendorRequests]);

  // --- 3. BACKEND COORDINATION: ACCEPT ORDER ---
  const handleAcceptOrder = async (requestId, itemId) => {
    if (processingRequests.has(requestId) || isProcessing) return;
    
    const targetItem = listings.find(item => item._id === itemId);
    if (!targetItem || targetItem.qty <= 0) {
      setError("Stock unavailable!");
      return;
    }

    setProcessingRequests(prev => new Set(prev).add(requestId));
    setIsProcessing(true);

    try {
      await axios.patch(`${API_BASE_URL}/user/requests/${requestId}/accept`);
      performLocalUpdate(requestId, itemId);
      setError(null);
    } catch (err) {
      console.warn("Backend patch failed, updating UI locally only.");
      performLocalUpdate(requestId, itemId);
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
      setIsProcessing(false);
    }
  };

  // --- 4. FORM VALIDATION ---
  const validateForm = () => {
    if (!newItemName.trim()) return "Item name is required";
    if (!newItemWeight.trim()) return "Weight is required";
    if (!newItemPrice || parseFloat(newItemPrice) <= 0) return "Valid price is required";
    if (newItemQty < 1) return "Quantity must be at least 1";
    return null;
  };

  // --- 5. BACKEND COORDINATION: ADD ITEM ---
  const handleAddItem = async (e) => {
    e.preventDefault();
    if (isProcessing) return;

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsProcessing(true);
    setError(null);

    const itemToAdd = {
      name: newItemName.trim(),
      weight: newItemWeight.trim(),
      qty: parseInt(newItemQty),
      price: parseFloat(newItemPrice),
    };

    let finalImageUrl = jug; // default fallback

    try {
      const formData = new FormData();
      Object.entries(itemToAdd).forEach(([k, v]) => formData.append(k, v));

      if (newItemImageFile) {
        formData.append("image", newItemImageFile);
      }

      const res = await axios.post(`${API_BASE_URL}/user/listings`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Backend succeeded
      const data = res.data;
      finalImageUrl = data.imageUrl || data.image || data.images?.[0] || jug;

      setListings(prev => [
        { 
          ...data, 
          images: [finalImageUrl] 
        },
        ...prev
      ]);

    } catch (err) {
      console.warn("Backend add failed, adding locally only.");

      // Use the preview URL for local items
      if (imagePreview) {
        finalImageUrl = imagePreview;
      }

      setListings(prev => [
        {
          ...itemToAdd,
          _id: `local_${Date.now()}`,
          images: [finalImageUrl]
        },
        ...prev
      ]);
    } finally {
      setIsProcessing(false);
      setShowAddModal(false);
      resetForm();
    }
  };

  // --- 6. Reset Form ---
  const resetForm = useCallback(() => {
    setNewItemName("");
    setNewItemWeight("");
    setNewItemQty(1);
    setNewItemPrice("");
    setNewItemImageFile(null);

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  }, [imagePreview]);

  // --- 7. Image Upload Handler ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setNewItemImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
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
        .floating-add-btn:disabled { opacity: 0.6; transform: none; }
      `}</style>

      <div className="dashboard-layout">
        <nav className="top-navbar">
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
            <div className={`nav-item ${activeTab === 'listings' ? 'active' : ''}`} onClick={() => setActiveTab('listings')}>
              My Waste Listings
            </div>
            <div className={`nav-item ${activeTab === 'requests' ? 'active' : ''}`} onClick={() => setActiveTab('requests')}>
              Vendor Requests ({vendorRequests.length})
            </div>
            <div className={`nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
              Accepted Orders ({history.length})
            </div>
          </aside>

          <main className="main-content">
            {error && (
              <Alert variant="warning" className="mb-4">
                {error}
              </Alert>
            )}
            
            <div className="content-banner">
              <h1 className="display-5 fw-bold">Your small actions, our planet's big change.</h1>
              <p className="lead fst-italic">Manage your impact. List. Recycle. Repeat.</p>
            </div>

            {activeTab === "listings" && (
              <button 
                className="floating-add-btn" 
                onClick={() => setShowAddModal(true)} 
                disabled={isProcessing}
                title={isProcessing ? "Processing..." : "Add New Listing"}
              >
                +
              </button>
            )}

            {activeTab === "listings" && (
              <div>
                <h3 className="mb-4 text-success fw-bold">Inventory</h3>
                {listings.length === 0 ? (
                  <Alert variant="info">No listings yet. Add your first item!</Alert>
                ) : (
                  listings.map(item => (
                    <div key={item._id} className="item-card">
                      <Image src={item.images?.[0] || jug} className="item-img" />
                      <div className="flex-grow-1">
                        <div className="fw-bold fs-3">
                          {item.name} 
                          {item.qty === 0 && <Badge bg="danger" className="ms-2">Stock Out</Badge>}
                        </div>
                        <div className="text-muted">
                          Weight: {item.weight} | 
                          <span className="fw-bold text-success"> Qty: {item.qty}</span> | 
                          <span className="fw-italic text-success"> Price: ₹{item.price}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "requests" && (
              <div>
                <h3 className="mb-4 text-primary fw-bold">Incoming Requests</h3>
                {vendorRequests.length === 0 ? (
                  <Alert variant="info">No vendor requests yet.</Alert>
                ) : (
                  vendorRequests.map(req => {
                    const currentStock = listings.find(i => i._id === req.itemId)?.qty || 0;
                    const isRequestProcessing = processingRequests.has(req._id);
                    
                    return (
                      <div key={req._id} className="item-card" style={{borderLeftColor: '#1565c0'}}>
                        <div className="flex-grow-1">
                          <div className="fw-bold fs-4 text-primary">{req.vendorName}</div>
                          <div className="fs-5">
                            Item: <span className="highlight-item">{req.itemName}</span> | 
                            Price: <span className="fw-bold text-success">₹{req.price || "0"}</span> |
                            Qty: <span className="fw-bold text-success">{req.qty || "0"}</span>
                          </div>
                          {currentStock === 0 && <small className="text-danger">No stock available</small>}
                        </div>
                        <div className="d-flex gap-2">
                          <Button 
                            variant="success" 
                            className="fw-bold px-4" 
                            onClick={() => handleAcceptOrder(req._id, req.itemId)}
                            disabled={isRequestProcessing || isProcessing || currentStock <= 0}
                          >
                            {isRequestProcessing ? "Processing..." : currentStock <= 0 ? "No Stock" : "Accept Order"}
                          </Button>
                          <Button 
                            variant="outline-primary" 
                            onClick={() => {setSelectedVendor(req); setShowVendorModal(true);}}
                            disabled={isProcessing}
                          >
                            Profile
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {activeTab === "history" && (
              <div>
                <h3 className="mb-4 text-secondary fw-bold">Confirmed Deals</h3>
                {history.length === 0 ? (
                  <Alert variant="info">No completed deals yet.</Alert>
                ) : (
                  history.map(entry => (
                    <div key={entry._id} className="item-card" style={{borderLeftColor: '#6c757d'}}>
                      <Image src={entry.itemImage || jug} className="item-img" />
                      <div className="flex-grow-1">
                        <div className="fw-bold fs-4">{entry.vendorName}</div>
                        <div className="fs-5">
                          Item: <span className="highlight-item">
                            {entry.itemSoldName || entry.itemName}
                          </span> |
                          Price: <span className="fw-bold text-success">
                            ₹{entry.itemPrice ?? entry.price ?? 0}
                          </span> |
                          Qty: <span className="fw-bold text-success">
                            {entry.itemQty ?? entry.qty ?? 0}
                          </span>
                        </div>
                        <div className="small text-muted">{entry.acceptedAt}</div>
                      </div>
                      <Button 
                        variant="info" 
                        className="text-white fw-bold" 
                        onClick={() => {setSelectedVendor(entry); setShowVendorModal(true);}}
                      >
                        Vendor Details
                      </Button>
                    </div>
                  ))
                )}
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
                {selectedVendor.distance && (
                  <p className="fs-5"><strong>Distance:</strong> {selectedVendor.distance}</p>
                )}
                <div className="d-flex flex-wrap gap-2 mt-2">
                  {selectedVendor.preferredItems?.map((tag, i) => (
                    <Badge key={i} bg="light" text="dark" className="border px-3 py-2">{tag}</Badge>
                  ))}
                </div>
              </Col>
            </Row>
          )}
        </Modal.Body>
      </Modal>

      {/* Add Item Modal */}
      <Modal show={showAddModal} onHide={() => { setShowAddModal(false); resetForm(); }} centered>
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>Add Waste Listing</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form onSubmit={handleAddItem}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Item Name <span className="text-danger">*</span></Form.Label>
              <Form.Control 
                type="text" 
                placeholder="e.g. Plastic Bottles"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                required 
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Weight <span className="text-danger">*</span></Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="e.g. 5kg"
                    value={newItemWeight}
                    onChange={(e) => setNewItemWeight(e.target.value)}
                    required 
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Price (₹) <span className="text-danger">*</span></Form.Label>
                  <Form.Control 
                    type="number" 
                    min="0"
                    step="0.01"
                    placeholder="Amount"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Quantity</Form.Label>
                  <Form.Control 
                    type="number" 
                    min="1"
                    value={newItemQty}
                    onChange={(e) => setNewItemQty(Math.max(1, parseInt(e.target.value) || 1))}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Item Image</Form.Label>
                  <Form.Control 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload} 
                  />
                </Form.Group>
              </Col>
            </Row>

            {imagePreview && (
              <div className="text-center mb-3">
                <Image src={imagePreview} thumbnail style={{ maxHeight: '150px', maxWidth: '200px' }} />
                <div className="small text-muted mt-1">Preview</div>
              </div>
            )}

            <Button 
              variant="success" 
              type="submit" 
              className="w-100 fw-bold py-2" 
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Post Listing"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default User_dashboard;
