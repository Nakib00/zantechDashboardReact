import React from "react";
import Topbar from "./Layout/Topbar";
import Sidebar from "./Layout/Sidebar";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <div className="dashboard-container">
      <Topbar user={user} onLogout={handleLogout} />
      <div className="main-content">
        <Sidebar />
        <div className="dashboard-body">
          <h1>Welcome to Dashboard</h1>
          
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
