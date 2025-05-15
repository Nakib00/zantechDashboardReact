import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import "../styles/LoginForm.css";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const data = await login(email, password);

      if (data.success && data.status === 200) {
        localStorage.setItem("authToken", data.data.token);
        localStorage.setItem("user", JSON.stringify(data.data.user));
        navigate("/dashboard");
      } else {
        setErrorMessage(data.message || "Login failed.");
      }
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2 className="login-title">Login</h2>

        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <label className="login-label">Email:</label>
        <input
          type="email"
          className="login-input"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className="login-label">Password:</label>
        <input
          type={showPassword ? "text" : "password"}
          className="login-input"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div className="checkbox-container">
          <input
            type="checkbox"
            checked={showPassword}
            onChange={() => setShowPassword(!showPassword)}
          />
          <span>Show Password</span>
        </div>

        <button type="submit" className="login-button">SIGN IN</button>

        <div className="login-links">
          <p>
            Forgot <a href="#">Password</a>?
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
