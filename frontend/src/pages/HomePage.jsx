import React from 'react';
import '../styles/HomePage.css'; 
import spanishLatte from '../assets/spanish_latte.webp'; 

const HomePage = () => {
  return (
    <div>
      <div className="homepage">
        <img
          src={spanishLatte}
          alt="Homepage"
          className="homepage-image"
        />
      </div>

      <div className="best-seller">
      </div>
    </div>
  );
};

export default HomePage;
