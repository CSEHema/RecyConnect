import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  Modal,
  Image,
  ListGroup,
} from "react-bootstrap";
// Removed axios as the focus is UI mock-up
import VENDOR_BANNER from "../../static/images/vendor_dash_banner.png";
import VENDOR_PROFILE_ICON from "../../static/images/Untitled_design.png";
import jug from "../../static/images/plastic_jug.jpg";
import jute from "../../static/images/jute.jpg";
import watch from "../../static/images/watch.jpg";
import headphones from "../../static/images/headphones.jpg";

// Placeholder Image URLs (Easy to replace with actual assets)
const PRODUCT_IMAGE_PLACEHOLDER = "https://via.placeholder.com/46/d1e8ff/000000?text=P";

const User_dashboard = () => {
  // UI state
  const [activeTab, setActiveTab] = useState("products");
  const [showModal, setShowModal] = useState(false);
  
  // Dynamic Data Placeholder (New)
  const [vendorName, setVendorName] = useState("Rajtha Ramachandran"); 

  // Form fields (Updated to include cost and quantity)
  const [productName, setProductName] = useState("");
  const [productDesc, setProductDesc] = useState("");
  const [productCost, setProductCost] = useState(""); 
  const [productQty, setProductQty] = useState(""); 
  const [productImages, setProductImages] = useState([]);

  // Data
  const [products, setProducts] = useState([]);
  const [receivedOrders, setReceivedOrders] = useState([]);

  // Dummy data (Used until backend integration)
  const dummyProducts = [
    { _id: "p1", name: "Plastic jug", cost: 20, inventoryQty: 10, images: [`${jug}`] },
    { _id: "p2", name: "Smart Watch", cost: 60, inventoryQty: 20, images: [`${watch}`] },
    { _id: "p3", name: "Headphones", cost: 150, inventoryQty: 5, images: [`${headphones}`] },
    { _id: "p4", name: "Jute sheets", cost: 70, inventoryQty: 12, images: [`${jute}`] },
  ];

  const dummyReceived = [
    { _id: "r1", productId: "p1", productName: "Plastic jug", productCost: 20, images: [`${jug}`], orders: [{ user: "User1", qty: 3 }, { user: "User2", qty: 5 }] },
    { _id: "r2", productId: "p2", productName: "Smart Watch", productCost: 60, images: [`${watch}`], orders: [{ user: "User5", qty: 2 }] },
    { _id: "r3", productId: "p3", productName: "Headphones", productCost: 150, images: [`${headphones}`], orders: [{ user: "User1", qty: 1 }] },
  ];

  useEffect(() => {
    setProducts(dummyProducts);
    setReceivedOrders(dummyReceived);
    // In a real app, you would fetch the vendor name here:
    // fetchVendorDetails().then(data => setVendorName(data.name));
  }, []);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 3) {
      alert("You can upload a maximum of 3 images.");
      e.target.value = null;
      setProductImages([]);
      return;
    }
    setProductImages(files);
  };

  const handleAddProduct = async () => {
    if (!productName.trim() || !productDesc.trim() || !productCost || !productQty) {
      alert("Please fill out all product fields (Name, Description, Cost, Quantity).");
      return;
    }

    const newProd = {
      _id: "new_" + Date.now(),
      name: productName,
      description: productDesc,
      cost: parseFloat(productCost),
      inventoryQty: parseInt(productQty),
      images: productImages.length > 0 ? productImages.map(f => URL.createObjectURL(f)) : [PRODUCT_IMAGE_PLACEHOLDER],
    };
    setProducts((prev) => [newProd, ...prev]);

    // Reset and close
    setProductName("");
    setProductDesc("");
    setProductCost("");
    setProductQty("");
    setProductImages([]);
    setShowModal(false);
    alert(`Product "${newProd.name}" added (demo).`);
  };

  const getProductInventory = (product) => {
    return product.inventoryQty !== undefined ? `Qty: ${product.inventoryQty}` : 'Qty: N/A';
  };

  const getProductCostForOrder = (r) => {
    // Uses the cost stored in the receivedOrders object itself
    return r.productCost !== undefined ? r.productCost : 'N/A';
  }

  return (
    <>
      {/* Minimal Custom CSS Block - Significantly revised to match Image 2's UI */}
      <style>{`
        /* Global Layout */
        html, body, #root { height: 100vh; margin: 0; padding: 0; overflow: hidden; font-family: sans-serif; }
        .dashboard-layout { 
            display: flex; 
            flex-direction: column; 
            height: 100%; 
            background-color: #f8f9fa; /* Light grey/white background for overall page */
        }
        .main-content-wrapper { 
            display: flex; 
            flex-grow: 1; 
            overflow: hidden; /* Hide scrollbars on this wrapper */
        }

        /* Top Navbar */
        .top-navbar { 
            background: #495057; /* Dark grey */
            color: #fff; 
            padding: 0.5rem 1.5rem; 
            font-weight: 600; 
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-shrink: 0; /* Prevents shrinking */
        }
        .top-navbar .welcome-text { font-size: 0.9rem; }
        .top-navbar .logout-btn { 
            background-color: #dc3545; /* Red */
            border-color: #dc3545;
            padding: 0.25rem 0.75rem;
            font-size: 0.8rem;
        }

        /* Sidebar */
        .sidebar {
            width: 250px; /* Fixed width as in Image 2 */
            background-color: #f8e6e6; /* Light pink/purple */
            flex-shrink: 0; /* Prevents shrinking */
            padding-top: 1rem;
            display: flex;
            flex-direction: column;
            box-shadow: 2px 0 5px rgba(0,0,0,0.05);
        }
        .sidebar .profile-section {
            text-align: center;
            padding-bottom: 1.5rem;
            border-bottom: 1px solid rgba(0,0,0,0.1); /* Separator line */
            margin-bottom: 1.5rem;
        }
        .sidebar .profile-img {
            width: 80px; /* Slightly smaller */
            height: 80px;
            border-radius: 50%;
            object-fit: cover;
            border: 3px solid #fff;
            box-shadow: 0 0 0 1px #ccc;
        }
        .sidebar .nav-item {
            padding: 0.75rem 1.5rem;
            color: #333;
            cursor: pointer;
            font-size: 0.95rem;
            display: flex;
            align-items: center;
        }
        .sidebar .nav-item:hover { background-color: rgba(0,0,0,0.05); }
        .sidebar .nav-item i { margin-right: 10px; color: #666; } /* Icons for sidebar */

        /* Main Content Area */
        .main-content {
            flex-grow: 1;
            overflow-y: auto; /* Scrollable content area */
            padding: 1rem;
            background-color: #fff; /* White background for the main area */
        }
        .content-banner {
            height: 120px; /* Increased height */
            background-size: cover;
            background-position: center;
            border-radius: 8px; /* Slightly rounded corners */
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-size: 1.8rem;
            font-weight: bold;
            text-shadow: 1px 1px 3px rgba(0,0,0,0.5);
        }

        /* Tabs Styling (Green, rounded) */
        .dashboard-tabs { 
            display: flex; 
            justify-content: flex-start; 
            margin-bottom: 1.5rem; 
            gap: 10px; 
        }
        .dashboard-tabs .tab-button {
            background-color: #28a745; 
            color: #fff;
            border: none;
            border-radius: 20px; 
            padding: 0.5rem 1.25rem;
            font-size: 0.9rem;
            font-weight: 500;
            transition: background-color 0.2s ease;
        }
        .dashboard-tabs .tab-button:hover { background-color: #218838; }
        .dashboard-tabs .tab-button.active { 
            background-color: #1e7e34; 
            box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.5);
        }

        /* Product/Order Cards (White background) */
        .product-card, .order-card {
            background-color: #fff;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }
        .product-card .img-container, .order-card .img-container {
            width: 50px;
            height: 50px;
            border-radius: 8px; 
            overflow: hidden;
            flex-shrink: 0;
            margin-right: 1rem;
        }
        .product-card .img-container img, .order-card .img-container img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .product-card .details, .order-card .details {
            flex-grow: 1;
        }
        .product-card .details .name, .order-card .details .name {
            font-weight: bold;
            font-size: 1rem;
            margin-bottom: 0.25rem;
        }
        .product-card .details .info, .order-card .details .info {
            font-size: 0.85rem;
            color: #666;
        }
        .order-card .status-text {
            font-size: 0.9rem;
            font-weight: 500;
            color: #6c757d;
        }

        /* Floating Add Button */
        .floating-add-btn { 
            position: fixed; 
            bottom: 2rem; 
            right: 2rem; 
            background-color: #dc3545; 
            color: white; 
            width: 50px; 
            height: 50px; 
            border-radius: 50%; 
            font-size: 2rem; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            z-index: 1000;
            border: none;
            cursor: pointer;
        }

        /* Modal Specific Styles */
        .modal-custom .modal-content { 
            background:#e6f3ff; 
            border-radius:8px; 
        }
        .modal-title { font-weight: bold; color: #333; }
        .modal-close-icon { 
            font-size: 1.5rem; 
            color: #888; 
            cursor: pointer; 
            position: absolute; 
            right: 15px; 
            top: 15px; 
        }
        .modal-form-label { font-weight: 600; color: #555; }
        .modal-input { height: 35px; border-radius: 5px; border: 1px solid #ccc; }
        .modal-add-button { 
            background-color: #007bff; 
            border-color: #007bff;
            padding: 0.4rem 1.5rem;
            font-size: 0.95rem;
            border-radius: 5px;
        }
      `}</style>

      {/* Main Dashboard Layout */}
      <div className="dashboard-layout">
        {/* Top Navbar */}
        <nav className="top-navbar">
          <span>User Dashboard</span>
          <div className="d-flex align-items-center">
            <span className="welcome-text me-3">Welcome, {vendorName}</span>
            <Button className="logout-btn">Logout</Button>
          </div>
        </nav>

        {/* Main Content Area (Sidebar + Scrollable Content) */}
        <div className="main-content-wrapper">
          {/* Sidebar */}
          <aside className="sidebar">
            <div className="profile-section">
              <Image src={VENDOR_PROFILE_ICON} className="profile-img mb-2" alt="Profile" />
              <div className="fw-bold fs-5 text-dark">{vendorName}</div>
            </div>
            <div className="flex-grow-1"> {/* Ensures menu items push to top */}
              <div className="nav-item">
                <i className="bi bi-person-fill"></i> View Profile
              </div>
              <div className="nav-item">
                <i className="bi bi-shop"></i> My Products
              </div>
              <div className="nav-item">
                <i className="bi bi-box-seam"></i> Received Orders
              </div>
            </div>
          </aside>

          {/* Main Scrollable Content */}
          <main className="main-content">
            
            {/* Banner with Title */}
            <div 
              className="content-banner" 
              style={{ backgroundImage: `url(${VENDOR_BANNER})`, height: '120px' }} // Restored height to 120px for better appearance
            >
              {/* Optional banner text can go here */}
            </div>

            {/* Tabs Bar (Green, Rounded, Left-aligned) */}
            <div className="dashboard-tabs">
              <Button 
                className={`tab-button ${activeTab === "products" ? "active" : ""}`} 
                onClick={() => setActiveTab("products")}
              >
                My Products
              </Button>
              <Button 
                className={`tab-button ${activeTab === "orders" ? "active" : ""}`} 
                onClick={() => setActiveTab("orders")}
              >
                Received Orders
              </Button>
            </div>

            {/* Dynamic Content Area (Product List or Order List) */}
            <div>
              {/* MY PRODUCTS TAB */}
              {activeTab === "products" && (
                <div className="d-flex flex-column">
                  {products.length === 0 && <p className="text-center text-muted">No products yet. Click the + button to add one.</p>}
                  {products.map((p) => (
                    <div key={p._id} className="product-card">
                      <div className="img-container">
                        <Image src={p.images[0] || PRODUCT_IMAGE_PLACEHOLDER} alt={p.name} />
                      </div>
                      <div className="details">
                        <div className="name">{p.name}</div>
                        <div className="info">Cost: {p.cost}Rs &nbsp; {getProductInventory(p)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* RECEIVED ORDERS TAB (Image logic fixed) */}
              {activeTab === "orders" && (
                <div className="d-flex flex-column">
                  {receivedOrders.length === 0 && <p className="text-center text-muted">No orders received yet.</p>}
                  {receivedOrders.map((r) => (
                    <div key={r._id} className="order-card">
                      <div className="img-container">
                        {/* FIX: Use r.images[0] directly, which is now populated in dummyReceived */}
                        <Image src={r.images[0] || PRODUCT_IMAGE_PLACEHOLDER} alt={r.productName} />
                      </div>
                      <div className="details flex-grow-1">
                        <div className="name">{r.productName}</div>
                        <div className="info">Cost: {getProductCostForOrder(r)}Rs</div>
                        
                        <div className="mt-2">
                            <span className="fw-bold" style={{ fontSize: '0.875rem' }}>Customers:</span>
                            <ListGroup variant="flush">
                                {r.orders.map((o, idx) => (
                                <ListGroup.Item key={idx} className="list-item-clean">
                                    • {o.user} (Qty: {o.qty})
                                </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </div>
                      </div>
                      <span className="status-text text-muted">Order received</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Floating Add Product Button */}
            <Button className="floating-add-btn" onClick={() => setShowModal(true)}>
              +
            </Button>

            {/* Add Product Modal (Updated with Cost and Quantity) */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered dialogClassName="modal-custom">
              <Modal.Header className="border-0 pb-0 position-relative">
                <Modal.Title className="modal-title ms-3 mt-2">Add Product</Modal.Title>
                <i className="bi bi-x-lg modal-close-icon" onClick={() => setShowModal(false)}></i>
              </Modal.Header>

              <Modal.Body className="pt-2 pb-4 px-4">
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label className="modal-form-label">Name of the Product:</Form.Label>
                    <Form.Control
                      type="text"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      className="modal-input"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="modal-form-label">Product description:</Form.Label>
                    <Form.Control
                      type="text"
                      value={productDesc}
                      onChange={(e) => setProductDesc(e.target.value)}
                      className="modal-input"
                    />
                  </Form.Group>
                  
                  {/* New: Cost Input */}
                  <Row className="mb-3">
                    <Col>
                      <Form.Label className="modal-form-label">Price (Rs):</Form.Label>
                      <Form.Control
                        type="number"
                        value={productCost}
                        onChange={(e) => setProductCost(e.target.value)}
                        className="modal-input"
                        min="0"
                      />
                    </Col>
                    {/* New: Quantity Input */}
                    <Col>
                      <Form.Label className="modal-form-label">Quantity (Qty):</Form.Label>
                      <Form.Control
                        type="number"
                        value={productQty}
                        onChange={(e) => setProductQty(e.target.value)}
                        className="modal-input"
                        min="1"
                      />
                    </Col>
                  </Row>

                  <Form.Group className="mb-4">
                    <Form.Label className="modal-form-label">Images:</Form.Label>
                    <Form.Control 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        onChange={handleImageChange} 
                        className="modal-input"
                        style={{ padding: '0.375rem 0.75rem', height: 'auto' }} 
                    />
                    <Form.Text className="text-muted" style={{ fontSize: 12 }}>
                        Max 3 images selected: {productImages.length}
                    </Form.Text>
                  </Form.Group>

                  <Button 
                    onClick={handleAddProduct}
                    className="modal-add-button"
                  >
                    Add Product
                  </Button>
                </Form>
              </Modal.Body>
            </Modal>
          </main>
        </div>
      </div>
    </>
  );
};

export default User_dashboard;