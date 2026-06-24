import React, { useEffect, useRef } from 'react';
import '../styles/HomePage.css'; 
import headerVideo from '../assets/header_looped.mp4';
import header from '../assets/header.jpg'; 
import spanishLatte from '../assets/spanish_latte.jpg';
import bananaMatcha from '../assets/banana_matcha.jpg';
import redVelvet from '../assets/red-velvet.jpg';
import Footer from './Footer';

const HomePage = () => {
  const videoRef = useRef(null);

  // CSS alone can't stop a <video>'s own playback — `animation: none`
  // only affects CSS animations, not native video autoplay/loop. To
  // genuinely respect prefers-reduced-motion, pause the element directly
  // and leave it sitting on its poster frame (header.jpg) instead.
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion && videoRef.current) {
      videoRef.current.pause();
    }
  }, []);

  return (
    <div>
      {/* Landing Page Section */}
      <div className="homepage">
        {/* The real coffee-and-smoke footage, looping silently in the
            background. header.jpg is kept as the `poster` — the frame
            shown instantly on load before the video has started playing,
            the fallback for any browser/device that can't autoplay video
            at all, and what stays visible if reduced motion is requested
            (see the effect above). The video file itself has a short
            fade-to-black baked in at both ends so the loop seam isn't a
            hard jump cut. */}
        <video
          ref={videoRef}
          className="homepage-image"
          src={headerVideo}
          poster={header}
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"
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
