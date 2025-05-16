import React, { useEffect, useState, useRef } from 'react';
import { FaUserCircle, FaSignOutAlt, FaUser, FaBell } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { Dropdown, Badge } from 'react-bootstrap';
import logo from '../../assets/zantechLogo.png';

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
    <div
      ref={ref}
      onClick={(e) => {
        e.preventDefault();
        onClick(e);
      }}
      className="d-flex align-items-center gap-2 cursor-pointer"
      style={{ cursor: 'pointer' }}
    >
      {children}
    </div>
  ));

  return (
    <header className="border-bottom">
      <div className="container-fluid px-4">
        <div className="d-flex justify-content-between align-items-center h-100">
          {/* Logo and Brand */}
          <Link to="/dashboard" className="d-flex align-items-center text-decoration-none">
            <img src={logo} alt="Zantech Logo" className="logo" />
            <span className="ms-2 fw-semibold text-primary fs-5">Zantech</span>
          </Link>

          {/* Right Side Items */}
          <div className="d-flex align-items-center gap-4">
            {/* Notifications */}
            <Dropdown align="end">
              <Dropdown.Toggle as={CustomToggle}>
                <div className="position-relative">
                  <FaBell className="fs-5 text-secondary" />
                  {notifications.length > 0 && (
                    <Badge 
                      bg="danger" 
                      pill 
                      className="position-absolute top-0 start-100 translate-middle"
                      style={{ fontSize: '0.6rem' }}
                    >
                      {notifications.length}
                    </Badge>
                  )}
                </div>
              </Dropdown.Toggle>

              <Dropdown.Menu className="shadow-sm border-0">
                {notifications.length > 0 ? (
                  notifications.map((notification, index) => (
                    <Dropdown.Item key={index} className="py-2">
                      <div className="d-flex align-items-center gap-2">
                        <div className="flex-grow-1">
                          <p className="mb-0 small">{notification.message}</p>
                          <small className="text-muted">{notification.time}</small>
                        </div>
                      </div>
                    </Dropdown.Item>
                  ))
                ) : (
                  <Dropdown.Item className="text-center text-muted py-3">
                    No new notifications
                  </Dropdown.Item>
                )}
              </Dropdown.Menu>
            </Dropdown>

            {/* User Profile */}
            <Dropdown align="end">
              <Dropdown.Toggle as={CustomToggle}>
                <div className="d-flex align-items-center gap-2">
                  <div className="rounded-circle bg-light p-1">
                    <FaUserCircle className="fs-4 text-primary" />
                  </div>
                  <div className="d-none d-md-block text-start">
                    <h6 className="mb-0 fw-semibold">{user?.name || 'Guest'}</h6>
                    <small className="text-muted">{user?.type || 'User'}</small>
                  </div>
                </div>
              </Dropdown.Toggle>

              <Dropdown.Menu className="shadow-sm border-0">
                <Dropdown.Item as={Link} to="/profile" className="py-2">
                  <div className="d-flex align-items-center gap-2">
                    <FaUser className="text-primary" />
                    <span>Profile</span>
                  </div>
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout} className="py-2 text-danger">
                  <div className="d-flex align-items-center gap-2">
                    <FaSignOutAlt />
                    <span>Logout</span>
                  </div>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
