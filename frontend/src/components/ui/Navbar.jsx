import React, { useState, useEffect } from "react";
import "../../styles/Navbar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faTimes,
  faCartShopping,
  faCaretDown,
  faUserAlt,
  faRightToBracket,
  faRightFromBracket, 
  faClipboardList,
  faBox,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { getCartItemCount, CART_UPDATED_EVENT } from "../../utils/cartStorage";

const Navbar = ({ userProp }) => {
  const [user, setUser] = useState(userProp || null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    setUser(userProp);
  }, [userProp]);

  // Check if user is admin
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const adminEmail =
      import.meta.env.VITE_ADMIN_EMAIL || "fahrenheitcoffeeph@gmail.com";
    if (storedUser && storedUser.email === adminEmail) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [userProp]);

  // Keep the cart badge in sync with localStorage, including changes made
  // by other components (MenuPage adding an item, CartPage removing one or
  // checking out) while Navbar stays mounted across page navigations.
  useEffect(() => {
    const syncCartCount = () => setCartCount(getCartItemCount());

    syncCartCount(); // initial read on mount

    // Same-tab updates (MenuPage/CartPage dispatch this after every write)
    window.addEventListener(CART_UPDATED_EVENT, syncCartCount);
    // Cross-tab updates (native event; doesn't fire in the tab that wrote it)
    window.addEventListener("storage", syncCartCount);

    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, syncCartCount);
      window.removeEventListener("storage", syncCartCount);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // NOTE: cart is intentionally NOT cleared on logout — a customer's
    // in-progress cart should survive logging out, and only clear when
    // they remove items down to empty or complete checkout.
    alert("You have been logged out.");
    setUser(null);
    setIsAdmin(false);
    navigate("/login");
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <span className="brand-name">
          <a href="/">fahrenheit</a>
        </span>
        <button className="hamburger-menu" onClick={toggleMenu}>
          <FontAwesomeIcon icon={menuOpen ? faTimes : faBars} />
        </button>
      </div>

      <div className={`navbar-links ${menuOpen ? "open" : ""}`}>
        <a href="/" className="nav-link">Home</a>
        <a href="/menu" className="nav-link">Menu</a>
        <a href="/about-us" className="nav-link">About Us</a>
        <a href="/contact" className="nav-link">Contact</a>
      </div>

      <div className="navbar-auth">
        {user ? (
          <div className="user-dropdown">
            <span className="nav-user-name" onClick={toggleDropdown}>
              <FontAwesomeIcon icon={faUserAlt} className="user-icon" />
              <span className="user-name">Hello, {user.first_name}</span>
              {!isAdmin && cartCount > 0 && (
                <span className="navbar-cart-badge">{cartCount}</span>
              )}
              <FontAwesomeIcon icon={faCaretDown} className="dropdown-icon" />
            </span>
            {dropdownOpen && (
              <div className="dropdown-menu">
                {!isAdmin && (
                  <>
                    <a href="/cart" className="dropdown-item dropdown-item-cart">
                      <FontAwesomeIcon icon={faCartShopping} /> Cart
                      {cartCount > 0 && (
                        <span className="dropdown-cart-badge">{cartCount}</span>
                      )}
                    </a>
                    <a href="/orders" className="dropdown-item">
                      <FontAwesomeIcon icon={faBox} /> My Orders
                    </a>
                  </>
                )}
                {isAdmin && (
                  <a href="/admin/orders" className="dropdown-item">
                    <FontAwesomeIcon icon={faClipboardList} /> Manage Orders
                  </a>
                )}
                <button className="dropdown-item" onClick={handleLogout}>
                  <FontAwesomeIcon icon={faRightFromBracket} /> Logout
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
    </nav>
  );
};

export default Navbar;
