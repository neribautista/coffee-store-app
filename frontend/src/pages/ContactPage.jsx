import React, { useState } from 'react';
import '../styles/Contact.css'; 
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


const ContactPage = () => {
  const [newContact, setNewContact] = useState({
    subject: '',
    name: '',
    email: '',
    message: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewContact({ ...newContact, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch('http://localhost:3001/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newContact),
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log('Form submitted successfully:', data);
        alert('Thank you for contacting us!');
        setNewContact({ subject: '', name: '', email: '', message: '' }); // Resets form
      } else {
        const errorData = await response.json();
        console.error('Error submitting form:', errorData);
        alert('Failed to submit the form. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred. Please try again later.');
    }
  };

  return (
    <div className="contact-container">
      <div className="contact-box">
        <h1 className="contact-icon">  <FontAwesomeIcon icon={faEnvelope} style={{color: "#141414",}} /></h1>
        <h1 className="contact-heading">Contact Us</h1>
        <p className="contact-description">
          We'd love to hear from you! Please fill out the form below.
        </p>
        <form className="contact-form" onSubmit={handleSubmit}>
          <label htmlFor="subject">Subject</label>
          <input
            type="text"
            id="subject"
            name="subject"
            placeholder="Enter the subject"
            value={newContact.subject}
            onChange={handleChange}
            required
          />

          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Enter your name"
            value={newContact.name}
            onChange={handleChange}
            required
          />

          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Enter your email"
            value={newContact.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            name="message"
            placeholder="Enter your message"
            rows="5"
            value={newContact.message}
            onChange={handleChange}
            required
          ></textarea>

          <button type="submit" className="contact-submit">
            Send Message
          </button>
        </form>
      </div>

      {/* Contact Details Section */}
      <div className="contact-details">
        <h2>Reach Us</h2>
        <p><strong>Address:</strong> Quezon City, Philippines</p>
        <p><strong>Phone:</strong> +639 (927) 151-5372</p>
        <p><strong>Email:</strong> support@fahrenheit.com</p>
        <p><strong>Working Hours:</strong> Mon - Fri, 9:00 AM - 5:00 PM</p>

        {/* Social Media Links */}
        <div className="social-media">
          <h3>Follow Us</h3>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link">
            <i className="fab fa-facebook-f"></i>
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link">
            <i className="fab fa-twitter"></i>
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link">
            <i className="fab fa-instagram"></i>
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-link">
            <i className="fab fa-linkedin-in"></i>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
