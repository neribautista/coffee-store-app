import React, { useEffect, useState } from "react";
import { Box } from "@chakra-ui/react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { refreshAccessToken } from "./utils/auth.js"; 
import ContactPage from "./pages/ContactPage";
import HomePage from "./pages/HomePage";
import Navbar from "./components/ui/Navbar";
import UserPage from "./pages/UserPage";
import LoginPage from "./pages/LoginPage";
import AboutUs from "./pages/AboutUs";
import MenuPage from "./pages/MenuPage";

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Auto-login on app startup
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      if (window.location.pathname !== "/login" && window.location.pathname !== "/user") {
        navigate("/login");
      }
    } else {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("user");
      }
    }
  }, [navigate]);

  // Refresh token periodically
  useEffect(() => {
    const interval = setInterval(async () => {
      const newToken = await refreshAccessToken();
      if (!newToken) {
        // If refreshing the token fails, log the user out
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        navigate("/login");
      }
    }, 30 * 60 * 1000);  // refresh every 30mins as the access token is valid for 30mins

    return () => clearInterval(interval); 
  }, [navigate]);

  return (
    <Box minH={"100vh"}>
      <Navbar userProp={user} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/user" element={<UserPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/menu" element={<MenuPage />} />
      </Routes>
    </Box>
  );
}

export default App;
