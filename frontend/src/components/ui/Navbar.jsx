import React, { useState, useEffect } from "react";
import "../../styles/Navbar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCartShopping,
  faCaretDown,
  faUserAlt,
  faRightToBracket,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const Navbar = ({ userProp }) => {
  const [user, setUser] = useState(userProp || null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  // Update user state when userProp changes
  useEffect(() => {
    setUser(userProp);
  }, [userProp]);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    alert("You have been logged out.");
    setUser(null); 
    navigate("/login");
  };

  // Toggle dropdown menu
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <div className="navbar">
      <div className="navbar-logo">
        <span className="brand-name">
          <a href="/" className="nav-link">
            fahrenheit
          </a>
        </span>
      </div>
      <div className="navbar-links">
        <a href="/" className="nav-link">
          Home
        </a>
        <a href="/menu" className="nav-link">
          Menu
        </a>
        <a href="/about-us" className="nav-link">
          About Us
        </a>
        <a href="/contact" className="nav-link">
          Contact
        </a>
        <a href="/events" className="nav-link">
          Events
        </a>

        {user ? (
          <div className="user-dropdown">
            <span className="nav-user-name" onClick={toggleDropdown}>
              <FontAwesomeIcon icon={faUserAlt} className="user-icon" />
              <span className="user-name">Hello, {user.first_name}</span>
              <FontAwesomeIcon icon={faCaretDown} className="dropdown-icon" />
            </span>
            {dropdownOpen && (
              <div className="dropdown-menu">
                <a href="/cart" className="cart-icon">
                  <FontAwesomeIcon icon={faCartShopping} /> Orders
                </a>
                <button className="dropdown-item" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <a href="/user" className="login-icon">
            <FontAwesomeIcon icon={faRightToBracket} /> Login / Register
          </a>
        )}
      </div>
    </div>
  );
};

export default Navbar;
