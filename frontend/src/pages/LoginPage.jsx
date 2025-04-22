import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/LoginPage.css";

const LoginPage = () => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3001/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        const data = await response.json();
        alert("Login successful!");

        // Store the JWT token and user data in localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem(
          "user",
          JSON.stringify({ first_name: data.first_name })
        );

        // Redirect to the home page
        navigate("/");
      } else {
        const errorData = await response.json();
        alert(
          errorData.message || "Invalid email or password. Please try again."
        );
      }
    } catch (error) {
      console.error("Error logging in:", error);
      alert("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-heading">Login</h1>
        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Enter your email"
            value={credentials.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Enter your password"
            value={credentials.password}
            onChange={handleChange}
            required
          />

          <button type="submit" className="login-submit">
            Login
          </button>
        </form>
        <p className="register-account">
          Don't have an account?{" "}
          <span
            className="register-link"
            onClick={() => navigate("/user")} // Navigate to the UserPage
            style={{
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Register here
          </span>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
