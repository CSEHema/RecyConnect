import React from 'react'
import Navbar from './Navbar';

const myStyle = {
  color: 'green',       // note quotes around color value
  backgroundColor: '#d4edda',  // camelCase for multi-word properties
  padding: '20px'
};

function Front() {
  return (
    <div>
    
    <Navbar/>

    <div
  className="container-fluid d-flex flex-column align-items-center justify-content-center text-center position-relative"
  style={{
    backgroundImage: `url('https://images.unsplash.com/photo-1528323273322-d81458248d40?auto=format&fit=crop&w=1600&q=80')`, // replace with your image
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    minHeight: "90vh",
    padding: "3rem 1rem",
  }}
>
  {/* Dark Overlay */}
  <div
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.6)", // darker overlay for readability
      zIndex: 0,
    }}
  ></div>

  {/* Content */}
  <div
    className="position-relative text-light p-4 rounded-4 shadow-lg"
    style={{ maxWidth: "850px", zIndex: 1 }}
  >
    <h1 className="fw-bold mb-3 text-success">Welcome to RecyConnect!!</h1>
    <p className="lead">
      Join the recycling revolution with <span className="fw-semibold text-success">RecyConnect</span> — 
      your go-to web platform for turning waste into opportunity! We connect households,
      businesses, and recycling vendors through a seamless, location-based system.
    </p>
    <p>
      List your recyclable waste, schedule pickups, and track progress with ease — all while
      making a real impact on the planet. With user-friendly dashboards, geolocation magic, and
      instant notifications, <span className="fw-semibold text-success">RecyConnect</span> makes sustainable
      living simple and rewarding.
    </p>
    <p className="fw-semibold text-success mb-0" style={myStyle}>
      🌱 Explore now and be part of a greener tomorrow!
    </p>
  </div>
</div>


    </div>
  )
}

export default Front
