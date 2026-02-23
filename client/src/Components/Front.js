import React from 'react';
import Navigation from './Navbar';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Row, Col } from 'react-bootstrap';

function Front() {
  const navigate = useNavigate();

  return (
    /* overflowX hidden prevents horizontal scroll bugs on mobile */
    <div id="top" style={{ backgroundColor: "#f8f9fa", overflowX: "hidden" }}>
      <Navigation />

      {/* --- HERO SECTION --- */}
      <div
        className="container-fluid d-flex align-items-center justify-content-center text-center position-relative"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1600&q=80')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "95vh",
          padding: "4rem 1rem",
        }}
      >
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.7)", zIndex: 0 }}></div>

        <div className="position-relative text-light p-2" style={{ maxWidth: "1000px", zIndex: 1 }}>
          <h1 className="display-2 fw-bold mb-3" style={{ color: "#4ade80" }}>RecyConnect</h1>
          
          <h2 className="h3 fw-light mb-5 fst-italic">
            Where every item gets a second life. <br />
            Building a greener future, together.
          </h2>

          <Row className="justify-content-center g-4">
            <Col xs={12} md={5}>
              <div className="p-4 rounded-4 border border-light border-opacity-25 shadow-lg" style={{ backdropFilter: "blur(10px)", backgroundColor: "rgba(255,255,255,0.1)" }}>
                <h4 className="fw-bold mb-3">For Households</h4>
                <p className="small mb-4 text-light text-opacity-75">Clean up your space and contribute to the planet.</p>
                <Button 
                  variant="success" 
                  className="w-100 py-3 fw-bold shadow border-0"
                  onClick={() => navigate('/user_registration')}
                  style={{ backgroundColor: "#1b5e20" }}
                >
                  Start Recycling
                </Button>
              </div>
            </Col>
            <Col xs={12} md={5}>
              <div className="p-4 rounded-4 border border-light border-opacity-25 shadow-lg" style={{ backdropFilter: "blur(10px)", backgroundColor: "rgba(255,255,255,0.1)" }}>
                <h4 className="fw-bold mb-3">For Vendors</h4>
                <p className="small mb-4 text-light text-opacity-75">Sourcing quality recyclables has never been easier.</p>
                <Button 
                  variant="outline-light" 
                  className="w-100 py-3 fw-bold shadow"
                  onClick={() => navigate('/vendor_registration')}
                >
                  Join as Partner
                </Button>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* --- HOW IT WORKS SECTION --- */}
      <Container id="how-it-works" className="py-5">
        <div className="text-center mt-5 mb-5">
            <h2 className="fw-bold display-5" style={{ color: "#1b5e20" }}>How RecyConnect Works</h2>
            <div className="mx-auto bg-success" style={{ height: "4px", width: "60px" }}></div>
        </div>
        
        <Row className="text-center g-4 mb-5">
          <Col md={4}>
            <div className="p-4 h-100 rounded-4 bg-white shadow-sm border-0 border-top border-success border-4">
              <div className="fs-1 mb-3">📦</div>
              <h4 className="fw-bold mb-3 text-success">List Waste</h4>
              <p className="fst-italic text-muted mb-3">Your small actions, our planet’s big change.</p>
              <p className="fs-5 text-secondary">
                Snap a photo and list your recyclables. Set your location and weight with ease.
              </p>
            </div>
          </Col>
          <Col md={4}>
            <div className="p-4 h-100 rounded-4 bg-white shadow-sm border-0 border-top border-success border-4">
              <div className="fs-1 mb-3">🤝</div>
              <h4 className="fw-bold mb-3 text-success">Connect</h4>
              <p className="fst-italic text-muted mb-3">Bridging the gap between waste and wealth.</p>
              <p className="fs-5 text-secondary">
                Vendors in your specific range will discover your items and request a pickup.
              </p>
            </div>
          </Col>
          <Col md={4}>
            <div className="p-4 h-100 rounded-4 bg-white shadow-sm border-0 border-top border-success border-4">
              <div className="fs-1 mb-3">🌍</div>
              <h4 className="fw-bold mb-3 text-success">Go Green</h4>
              <p className="fst-italic text-muted mb-3">Sourcing sustainability, one pickup at a time.</p>
              <p className="fs-5 text-secondary">
                Track your impact and contribute to a healthier circular economy.
              </p>
            </div>
          </Col>
        </Row>
      </Container>

      {/* --- FOOTER / IMPACT BANNER --- */}
      <footer className="bg-dark text-white py-5 text-center">
        <Container>
            <p className="fs-4 fw-light fst-italic mb-0">
                🌱 "Turning today’s waste into tomorrow’s resource."
            </p>
            <hr className="my-4 border-secondary opacity-25" />
            <p className="small text-secondary mb-0">© 2026 RecyConnect. All Rights Reserved.</p>
        </Container>
      </footer>
    </div>
  );
}

export default Front;
