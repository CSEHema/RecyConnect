import React from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function Navigation() {
  return (
    <Navbar expand="lg" sticky="top" style={{ backgroundColor: "#1b5e20", padding: "12px 0" }} variant="dark">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold fs-3">
          Recy<span style={{ color: "#81c784" }}>Connect</span>
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            {/* HOME: Scrolls to the top ID of Front.js */}
            <Nav.Link href="#top" className="mx-2">Home</Nav.Link>
            
            {/* ABOUT: Scrolls to How It Works */}
            <Nav.Link href="#how-it-works" className="mx-2">How it Works</Nav.Link>
            
            <NavDropdown 
                title="Login" 
                id="login-dropdown" 
                className="mx-2"
            >
              <NavDropdown.Item as={Link} to="/user_login">As User</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/vendor_login">As Vendor</NavDropdown.Item>
            </NavDropdown>

            {/* SIGN UP: Fixed color by removing custom bg-light class that caused white-out */}
            <NavDropdown 
                title={<span className="text-light">Sign Up</span>} 
                id="signup-dropdown" 
                className="mx-2 border border-light rounded px-2"
            >
              <NavDropdown.Item as={Link} to="/user_registration">As User</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/vendor_registration">As Vendor</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navigation;
