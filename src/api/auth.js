import API_BASE_URL from "../config/apiConfig";

export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Login API error:", error);
    throw new Error("Failed to login. Please try again.");
  }
};
