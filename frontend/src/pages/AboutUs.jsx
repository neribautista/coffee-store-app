import React from "react";
import "../styles/AboutUs.css";

const AboutUs = () => {
  return (
    <div className="about-container">
      <h1 className="about-title">About Fahrenheit Coffee</h1>

      <section className="about-section">
        <h2>👨‍💻 Tech Stack</h2>
        <p>
          This web app is built using the <strong>MERN Stack</strong> — a
          powerful JavaScript stack for developing full-stack web applications.
        </p>
        <div className="tech-stack-grid">
          <div className="tech-item">
            <h3>MongoDB</h3>
            <p>NoSQL database for flexible data storage.</p>
          </div>
          <div className="tech-item">
            <h3>Express.js</h3>
            <p>Backend web framework to handle routes and server logic.</p>
          </div>
          <div className="tech-item">
            <h3>React</h3>
            <p>Frontend framework for a fast and responsive UI.</p>
          </div>
          <div className="tech-item">
            <h3>Node.js</h3>
            <p>JavaScript runtime environment for running backend code.</p>
          </div>
        </div>
      </section>

      <section className="about-section">
        <h2>🔐 Authentication</h2>
        <p>
          We use <strong>JWT (JSON Web Tokens)</strong> to handle user
          authentication securely. After login, a token is generated and stored
          locally to keep the user authenticated across different sessions.
        </p>
      </section>

      <section className="about-section">
        <h2>💡 Why These Technologies?</h2>
        <div className="why-grid">
          <div className="why-item">
            <h3>Full JavaScript Stack</h3>
            <p>Using one language across frontend and backend simplifies development and speeds up the process.</p>
          </div>
          <div className="why-item">
            <h3>Scalability</h3>
            <p>MongoDB is schema-less, which makes it easier to evolve data models as features grow.</p>
          </div>
          <div className="why-item">
            <h3>User Experience</h3>
            <p>React offers a seamless and fast experience with dynamic components and routing.</p>
          </div>
          <div className="why-item">
            <h3>Security</h3>
            <p>JWT ensures secure access to protected routes and APIs.</p>
          </div>
        </div>
      </section>

      <section className="about-section">
        <h2>☕ The App</h2>
        <p>
          Fahrenheit is an online coffee store that allows users to explore our
          menu, shop for their favorite drinks, view upcoming events, and securely manage their accounts.
        </p>
      </section>
    </div>
  );
};

export default AboutUs;
