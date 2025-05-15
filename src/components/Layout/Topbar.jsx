import React, { useState } from "react";
import "../../styles/Topbar.css";

const Topbar = ({ user, onLogout }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="topbar">
      <div className="project-name">Zantech</div>

      <div
        className="user-section"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        {user?.name}
        {dropdownOpen && (
          <div className="dropdown">
            <div className="dropdown-item">Profile</div>
            <div className="dropdown-item" onClick={onLogout}>
              Logout
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Topbar;
