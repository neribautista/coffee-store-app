import React from 'react';
import '../styles/HomePage.css'; 
import header from '../assets/header.jpg'; 
import spanishLatte from '../assets/spanish_latte.jpg';
import bananaMatcha from '../assets/banana_matcha.jpg';
import redVelvet from '../assets/red-velvet.jpg';
import Footer from './Footer';

const HomePage = () => {
  return (
    <div>
      {/* Landing Page Section */}
      <div className="homepage">
        <img
          src={header}
          alt="Homepage"
          className="homepage-image"
        />
      </div>

      {/* Best Seller Section */}
      <h1 className="best-seller-title"> Try our best seller.</h1>

      <div className="best-seller">
        <img
          src={spanishLatte}
          alt="Spanish Latte"
          className="spanish-latte-bs"
        />
        <img
          src={bananaMatcha}
          alt="Banana Matcha"
          className="banana-matcha-bs"
        />
        <img
          src={redVelvet}
          alt="Red Velvet"
          className="red-velvet-bs"
        />
      </div>

      <Footer />
    </div>
  );
};

export default HomePage;
