import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  Navbar,
  Image,
  Badge,
  Modal
} from "react-bootstrap";
import { useNavigate ,Link} from "react-router-dom";

// Standardizing assets
import banner from "../../static/images/user_dash_banner.png";
import profilePic from "../../static/images/Untitled_1.png"; 
import jug from "../../static/images/plastic_jug.jpg";

const API_BASE_URL = "http://localhost:5000/api";

const Vendor_dashboard = ({ onLogout }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("discover");
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // States for dynamic data
  const [availableWaste, setAvailableWaste] = useState([]);
  const [myPickups, setMyPickups] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/vendor/discover`);
        setAvailableWaste(res.data);
      } catch (err) {
        // Fallback Dummies with high-quality formatting
        setAvailableWaste([
          { 
            _id: "w1", name: "Plastic Bottles", weight: "12kg", distance: "1.2 km", 
            imageUrl: jug, sellerName: "John Doe", sellerAddress: "Banjara Hills, Hyd",
            sellerPhone: "+91 9876543210", sellerEmail: "john@email.com"
          },
          { 
            _id: "w2", name: "Old Newspaper Bundle", weight: "25kg", distance: "3.5 km", 
            imageUrl: jug, sellerName: "Anjali Rao", sellerAddress: "Jubilee Hills, Hyd",
            sellerPhone: "+91 8888877777", sellerEmail: "anjali@email.com"
          },
        ]);
      }
    };
    fetchData();
  }, []);

  const openUserProfile = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handlePlaceOrder = (item) => {
    setAvailableWaste(prev => prev.filter(i => i._id !== item._id));
    setMyPickups(prev => [{ ...item, status: "Intimation Sent" }, ...prev]);
    alert(`Request sent to ${item.sellerName}!`);
  };

  return (
    <>
      <style>{`
        .dashboard-layout { display: flex; flex-direction: column; height: 100vh; background-color: #f8f9fa; }
        .main-content-wrapper { display: flex; flex-grow: 1; overflow: hidden; }
        
        .top-navbar { background: #1b5e20; color: #fff; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; }
        
        .sidebar { width: 280px; background-color: #e8f5e9; border-right: 1px solid #c8e6c9; padding: 30px 0; }
        .nav-item { padding: 15px 30px; cursor: pointer; color: #2e7d32; font-weight: 500; font-size: 1.1rem; transition: 0.3s; display: flex; align-items: center; }
        .nav-item:hover { background: #c8e6c9; }
        .nav-item.active { background: #2e7d32; color: white; }

        .main-content { flex-grow: 1; overflow-y: auto; padding: 40px; }
        
        .content-banner { 
            height: 250px; 
            background: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${banner}); 
            background-size: cover; background-position: center; border-radius: 15px; margin-bottom: 35px; 
            display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; 
        }

        /* Large Aesthetic Cards matching User Dashboard */
        .item-card { 
            background: white; border-radius: 15px; padding: 20px; margin-bottom: 25px; 
            box-shadow: 0 4px 15px rgba(0,0,0,0.08); display: flex; align-items: center; border-left: 8px solid #1b5e20; 
        }
        .item-img-large { width: 120px; height: 120px; object-fit: cover; border-radius: 12px; margin-right: 25px; }
        .card-title-text { font-size: 1.4rem; font-weight: bold; color: #333; }
        .card-sub-text { font-size: 1.1rem; color: #666; }
      `}</style>

      <div className="dashboard-layout">
        {/* Top Navbar */}
         <nav className="top-navbar">
  {/* Standardized Logo Branding */}
  <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }} className="fw-bold fs-3">
    Recy<span style={{ color: "#81c784" }}>Connect</span>
  </Link>
  
  <Button variant="outline-light" onClick={onLogout}>Logout</Button>
</nav>
        <div className="main-content-wrapper">
          {/* Sidebar */}
          <aside className="sidebar">
            <div className="text-center mb-5">
              <Image src={profilePic} roundedCircle width="100" height="100" className="border shadow-sm mb-3" />
              <h4 className="text-success fw-bold">Rajtha Ramachandran</h4>
            </div>
            <div className={`nav-item ${activeTab === 'discover' ? 'active' : ''}`} onClick={() => setActiveTab('discover')}>
              <i className="bi bi-search me-3"></i> Discover Waste
            </div>
            <div className={`nav-item ${activeTab === 'pickups' ? 'active' : ''}`} onClick={() => setActiveTab('pickups')}>
              <i className="bi bi-truck me-3"></i> Active Pickups
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="main-content">
            <div className="content-banner">
                <h1 className="display-5 fw-bold">Bridging the gap between waste and wealth.</h1>
                <p className="lead fst-italic">Sourcing sustainability, one pickup at a time.</p>
            </div>

            {activeTab === "discover" && (
              <div>
                <h3 className="mb-4 text-success fw-bold">Waste Near You</h3>
                {availableWaste.map(item => (
                  <div key={item._id} className="item-card">
                    <Image src={item.imageUrl} className="item-img-large" />
                    <div className="flex-grow-1">
                      <div className="card-title-text">{item.name}</div>
                      <div className="card-sub-text mb-2">Weight: {item.weight} | <span className="text-primary fw-bold">📍 {item.distance}</span></div>
                      <Badge bg="light" text="dark" className="border">Seller: {item.sellerName}</Badge>
                    </div>
                    <div className="d-flex flex-column gap-2">
                      <Button variant="success" className="fw-bold px-4" onClick={() => handlePlaceOrder(item)}>Place Order</Button>
                      <Button variant="outline-secondary" className="fw-bold btn-sm" onClick={() => openUserProfile(item)}>View Seller</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "pickups" && (
              <div>
                <h3 className="mb-4 text-primary fw-bold">Your Active Pickups</h3>
                {myPickups.length === 0 ? <p className="text-muted">No orders placed yet.</p> : 
                  myPickups.map(order => (
                    <div key={order._id} className="item-card" style={{borderLeftColor: '#0d6efd'}}>
                      <Image src={order.imageUrl} className="item-img-large" />
                      <div className="flex-grow-1">
                        <div className="card-title-text">{order.name}</div>
                        <div className="text-primary fw-bold mb-1">{order.status}</div>
                        <div className="small text-muted">Pick up from: {order.sellerName}</div>
                      </div>
                      <Button variant="outline-primary" onClick={() => openUserProfile(order)}>Contact Seller</Button>
                    </div>
                  ))
                }
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Seller Profile Modal */}
      {/* Modal to view User Profile from Vendor Dashboard */}
<Modal show={showUserModal} onHide={() => setShowUserModal(false)} centered size="lg">
  <Modal.Header closeButton className="bg-success text-white">
    <Modal.Title className="fw-bold">Homeowner Profile</Modal.Title>
  </Modal.Header>
  <Modal.Body className="p-4">
    {selectedUser && (
      <Row className="align-items-center">
        <Col md={4} className="text-center border-end">
          <Image 
            src={profilePic} // Use the user's specific profile icon
            roundedCircle 
            width="120" 
            height="120" 
            className="border shadow-sm mb-3" 
            style={{ objectFit: 'cover', border: '3px solid #1b5e20' }}
          />
          <h4 className="fw-bold text-dark">{selectedUser.sellerName}</h4>
          <Badge bg="success" className="px-3 py-2">Verified Seller</Badge>
        </Col>

        <Col md={8} className="ps-4">
          <h5 className="text-success border-bottom pb-2 mb-3 fw-bold">Contact Information</h5>
          <p className="fs-5 mb-2"><strong>Phone:</strong> <a href={`tel:${selectedUser.sellerPhone}`} className="text-success text-decoration-none">{selectedUser.sellerPhone}</a></p>
          <p className="fs-5 mb-2"><strong>Email:</strong> {selectedUser.sellerEmail}</p>
          <p className="fs-5 mb-3"><strong>Pickup Address:</strong> {selectedUser.sellerAddress}</p>
          
          <h5 className="text-success border-bottom pb-2 mb-3 fw-bold">Selling Items</h5>
          <div className="d-flex flex-wrap gap-2">
            {/* Logic to show the specific tags the user registered with */}
            {selectedUser.purposes?.map((item, i) => (
              <Badge key={i} bg="light" text="dark" className="border px-3 py-2">{item}</Badge>
            ))}
          </div>
        </Col>
      </Row>
    )}
  </Modal.Body>
</Modal>
    </>
  );
};

export default Vendor_dashboard;
