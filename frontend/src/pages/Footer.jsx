import React from 'react';
import '../styles/Footer.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer>
            <p>&copy; {currentYear} fahrenheit.mnl | All Rights Reserved</p>
        </footer>
    );
};

export default Footer;