import { Box } from "@chakra-ui/react";
import { Route, Routes } from "react-router-dom";

import ContactPage from "./pages/ContactPage";
import HomePage from "./pages/HomePage";
import Navbar from "./components/ui/Navbar";
import UserPage from "./pages/UserPage";
import LoginPage from "./pages/LoginPage";

function App() {
  return (
    <Box minH={"100vh"}>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/user" element={<UserPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Box>
  );
}

export default App;
