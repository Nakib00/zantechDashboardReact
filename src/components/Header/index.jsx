import React, { useEffect, useState, useRef } from 'react';
import { FaUserCircle, FaSignOutAlt, FaUser } from 'react-icons/fa';
import { MdNotifications } from 'react-icons/md';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/zantechLogo.png';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setShowDropdown(false);
    navigate('/login');
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <header className="header bg-white shadow-sm">
      <div className="container-fluid">
        <div className="row align-items-center py-2">
          {/* Logo and Brand Name */}
          <div className="col-md-6">
            <Link to="/dashboard" className="brand-container">
              <img src={logo} alt="Zantech Logo" className="logo" />
              <span className="brand-name">Zantech</span>
            </Link>
          </div>

          {/* Right Side Items */}
          <div className="col-md-6">
            <div className="d-flex justify-content-end align-items-center">
              {/* Notifications */}
              <div className="notification-icon me-3 position-relative">
                <MdNotifications size={24} />
                <span className="notification-badge">3</span>
              </div>

              {/* User Profile with Dropdown */}
              <div className="user-profile-container" ref={dropdownRef}>
                <div className="user-profile d-flex align-items-center" onClick={toggleDropdown}>
                  <FaUserCircle size={32} className="me-2" />
                  <div className="user-info">
                    <h6 className="mb-0">{user?.name || 'Guest'}</h6>
                    <small className="text-muted">{user?.type || 'User'}</small>
                  </div>
                </div>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="profile-dropdown">
                    <Link to="/profile" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                      <FaUser className="me-2" />
                      Profile
                    </Link>
                    <button className="dropdown-item" onClick={handleLogout}>
                      <FaSignOutAlt className="me-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
