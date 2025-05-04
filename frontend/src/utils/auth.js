export const refreshAccessToken = async () => {
  try {
    const response = await fetch("http://localhost:3001/api/users/refresh", {
      method: "POST",
      credentials: "include", 
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("token", data.accessToken); 
      return data.accessToken; 
    } else {
      console.error("Failed to refresh access token");
      return null;
    }
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return null;
  }
};