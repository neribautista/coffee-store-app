import React, { useState } from "react";
import '../styles/UserPage.css'; 

const UserPage = () => {
  const [user, setUser] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        const response = await fetch('http://localhost:3001/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(user),
        });

        // Validate that password and confirm password match
        if (user.password !== user.confirmPassword) {
          alert("Passwords do not match!");
          return;
        }

        console.log("User data submitted:", user);
        alert("Profile created successfully!");
        setUser({ first_name: '', last_name: '', email: '', password: '', confirmPassword:'' }); //Reset fields
    } catch (error) {
        console.error("Error submitting user data:", error);
        alert("An error occurred while updating the profile.");
    }
  };

  return (
    <div className="user-container">
      <div className="user-box">
        <h1 className="user-heading">Register</h1>
        <p className="user-description">
          Create your account.
        </p>
        <form className="user-form" onSubmit={handleSubmit}>
          {/* First Name */}
          <label htmlFor="first_name">First Name</label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            placeholder="Enter your first name"
            value={user.first_name}
            onChange={handleChange}
            required
          />

          {/* Last Name */}
          <label htmlFor="last_name">Last Name</label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            placeholder="Enter your last name"
            value={user.last_name}
            onChange={handleChange}
            required
          />


          {/* Email */}
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Enter your email"
            value={user.email}
            onChange={handleChange}
            required
          />

          {/* Password */}
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Enter your password"
            value={user.password}
            onChange={handleChange}
            required
          />

          {/* Confirm Password */}
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Re-enter your password"
            value={user.confirmPassword}
            onChange={handleChange}
            required
          />

          <button type="submit" className="user-submit">
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserPage;


