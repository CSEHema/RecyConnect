import React, { useEffect, useState } from "react";
import axios from "axios";
import banner from "../../static/images/user_dash_banner.png";
import profilePic from "../../static/images/Untitled_1.png";
import jug from "../../static/images/plastic_jug.jpg";
import jute from "../../static/images/jute.jpg";
import watch from "../../static/images/watch.jpg";
import { Container, Row, Col, Card, Button, Navbar } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const Vendor_dashboard = ({ onLogout }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("Bhavya Srinivas");
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("all"); // all, received, pending

  // Dummy items
  const dummyOrders = [
    {
      _id: "1",
      name: "Plastic jugs",
      cost: 20,
      qty: 2,
      status: "Order is waiting",
      imageUrl: `${jug}`,
    },
    {
      _id: "2",
      name: "Jute sheets",
      cost: 40,
      qty: 1,
      status: "Pending",
      imageUrl: `${jute}`,
    },
    {
      _id: "3",
      name: "Smart Watch",
      cost: 60,
      qty: 1,
      status: "Order is waiting",
      imageUrl: `${watch}`,
    },
  ];

  useEffect(() => {
    setOrders(dummyOrders);

    const fetchData = async () => {
      try {
        const userRes = await axios.get("/api/user/profile");

        if (userRes.data?.username) setUsername(userRes.data.username);

        // Uncomment when backend ready
        // const orderRes = await axios.get("/api/user/orders");
        // setOrders(orderRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "all") return true;
    if (activeTab === "received")
      return order.status !== "Pending"; // received or processing
    if (activeTab === "pending") return order.status === "Pending";
    return true;
  });

  const handleLogout = async () => {
    try {
      await axios.post("/api/logout");
      onLogout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="d-flex flex-column flex-md-row">
      {/* ---------- LEFT SIDEBAR ---------- */}
      <div
        style={{
          width: "220px",
          backgroundColor: "#f4a8d4",
          minHeight: "100vh",
          padding: "20px 10px",
        }}
        className="flex-shrink-0"
      >
        <div className="text-center mb-3">
          <img
            src={profilePic}
            alt="Profile"
            style={{ width: "100px", height: "100px", borderRadius: "50%" }}
          />
          <h5 className="mt-2">{username}</h5>
        </div>

        <div className="sidebar-links">
          <p>- View Profile</p>
          <p
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/product-catalog")}
          >
            - Product Catalog
          </p>
          <p>- Go to Home</p>
        </div>
      </div>

      {/* ---------- RIGHT SECTION ---------- */}
      <div style={{ flexGrow: 1 }}>
        <Navbar bg="light" className="px-4 justify-content-between shadow-sm">
          <Navbar.Brand className="fw-bold">Vendor Dashboard</Navbar.Brand>

          <div>
            <span className="me-3">
              Welcome, <strong>{username}</strong>
            </span>
            <Button variant="outline-danger" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </Navbar>

        {/* Banner */}
        <div
          className="text-center text-white d-flex align-items-center justify-content-center"
          style={{
            backgroundImage: `url(${banner})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            height: "180px",
          }}
        >
          <h3 className="fw-bold bg-dark bg-opacity-50 px-4 py-2 rounded">
            Your Orders
          </h3>
        </div>

        {/* TABS (Buttons) */}
        <Container className="mt-3 text-center">
          <Button
            className="mx-2 px-4"
            style={{
              backgroundColor: activeTab === "all" ? "#f8b2dd" : "#e0e0e0",
              border: 0,
            }}
            onClick={() => setActiveTab("all")}
          >
            View All Orders
          </Button>

          <Button
            className="mx-2 px-4"
            style={{
              backgroundColor: activeTab === "received" ? "#f8b2dd" : "#e0e0e0",
              border: 0,
              color: "green",
            }}
            onClick={() => setActiveTab("received")}
          >
            Received Orders
          </Button>

          <Button
            className="mx-2 px-4"
            style={{
              backgroundColor: activeTab === "pending" ? "#f8b2dd" : "#e0e0e0",
              border: 0,
              color: "red",
            }}
            onClick={() => setActiveTab("pending")}
          >
            To Be Received Orders
          </Button>
        </Container>

        {/* Orders List */}
        <Container
          className="mt-4 p-4"
          style={{ backgroundColor: "#e6e6e6", borderRadius: "8px" }}
        >
          {filteredOrders.length === 0 ? (
            <p className="text-center">No orders to display</p>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order._id}
                className="d-flex flex-column flex-md-row align-items-md-center justify-content-between p-3 mb-3"
                style={{ backgroundColor: "#ffe6e6", borderRadius: "8px" }}
              >
                <div className="d-flex align-items-center">
                  <img
                    src={order.imageUrl}
                    alt={order.name}
                    style={{
                      width: "70px",
                      height: "70px",
                      borderRadius: "50%",
                      marginRight: "15px",
                    }}
                  />

                  <div>
                    <h5>{order.name}</h5>
                    <p className="text-success mb-0">
                      Cost: {order.cost}Rs &nbsp;&nbsp; Qty: {order.qty}
                    </p>
                  </div>
                </div>

                <div className="mt-2 mt-md-0 text-end">
                  {order.status === "Pending" ? (
                    <Button variant="danger">Place Order</Button>
                  ) : (
                    <p className="m-0">
                      Status: <br /> {order.status}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </Container>
      </div>
    </div>
  );
};

export default Vendor_dashboard;
