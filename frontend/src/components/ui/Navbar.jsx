import React from 'react';
import '../../styles/Navbar.css'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartShopping } from '@fortawesome/free-solid-svg-icons';
import { faUser } from '@fortawesome/free-solid-svg-icons';

const Navbar = () => {
  return (
    <div className="navbar">
      <div className="navbar-logo">
        <span className="brand-name"> 
          <a href="/" className="nav-link">fahrenheit</a>
          </span>
        {/* <img
          src="/src/assets/fahrenheit.png" // Replace with the correct path to your logo
          alt="Logo"
          className="logo"
        /> */}
      </div>
      <div className="navbar-links">
        <a href="/" className="nav-link">Home</a>
        <a href="/menu" className="nav-link">Menu</a>
        <a href="/about-us" className="nav-link">About Us</a>
        <a href="/contact" className="nav-link">Contact</a>
        <a href="/events" className="nav-link">Events</a>
        <a href="/cart" className="nav-link"><FontAwesomeIcon icon={faCartShopping} /></a>
        <a href="/user" className="nav-link"><FontAwesomeIcon icon={faUser} style={{color: "#f7f7f8",}} /></a>
      </div>
    </div>
  );
};

export default Navbar;