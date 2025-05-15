import React from "react";

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Welcome to Dashboard</h1>
      <p>
        Logged in as: {user?.name} ({user?.email})
      </p>
    </div>
  );
};

export default Dashboard;
