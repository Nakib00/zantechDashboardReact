import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  MdDashboard,
  MdShoppingCart,
  MdPeople,
  MdCategory,
  MdInventory,
  MdLocalShipping,
  MdPayment,
  MdSettings,
  MdAnalytics,
  MdStore,
  MdBusiness,
  MdChevronLeft,
  MdChevronRight
} from 'react-icons/md';
import { Nav } from 'react-bootstrap';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { 
      path: '/dashboard', 
      icon: <MdDashboard size={20} />, 
      label: 'Dashboard',
      badge: null
    },
    { 
      path: '/products', 
      icon: <MdInventory size={20} />, 
      label: 'Products',
      badge: null
    },
    { 
      path: '/categories', 
      icon: <MdCategory size={20} />, 
      label: 'Categories',
      badge: null
    },
    { 
      path: '/suppliers', 
      icon: <MdBusiness size={20} />, 
      label: 'Suppliers',
      badge: null
    },
    { 
      path: '/orders', 
      icon: <MdShoppingCart size={20} />, 
      label: 'Orders',
      badge: 'New'
    },
    { 
      path: '/customers', 
      icon: <MdPeople size={20} />, 
      label: 'Customers',
      badge: null
    },
    { 
      path: '/shipping', 
      icon: <MdLocalShipping size={20} />, 
      label: 'Shipping',
      badge: null
    },
    { 
      path: '/payments', 
      icon: <MdPayment size={20} />, 
      label: 'Payments',
      badge: null
    },
    { 
      path: '/analytics', 
      icon: <MdAnalytics size={20} />, 
      label: 'Analytics',
      badge: null
    },
    { 
      path: '/store', 
      icon: <MdStore size={20} />, 
      label: 'Store',
      badge: null
    },
    { 
      path: '/settings', 
      icon: <MdSettings size={20} />, 
      label: 'Settings',
      badge: null
    },
  ];

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className={`sidebar bg-white h-100 ${collapsed ? 'collapsed' : ''}`}>
      {/* Toggle Button */}
      <button 
        className="btn btn-link text-secondary position-absolute end-0 top-50 translate-middle-y d-none d-lg-block"
        onClick={toggleSidebar}
        style={{ zIndex: 1000 }}
      >
        {collapsed ? <MdChevronRight size={24} /> : <MdChevronLeft size={24} />}
      </button>

      {/* Navigation */}
      <Nav className="flex-column p-3">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Nav.Item key={item.path} className="mb-1">
              <Nav.Link
                as={Link}
                to={item.path}
                className={`d-flex align-items-center gap-3 rounded-3 px-3 py-2 ${
                  isActive 
                    ? 'bg-primary text-white' 
                    : 'text-secondary hover-bg-light'
                }`}
                style={{
                  transition: 'all 0.2s ease-in-out',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden'
                }}
              >
                <span className={`${isActive ? 'text-white' : 'text-primary'}`}>
                  {item.icon}
                </span>
                {!collapsed && (
                  <>
                    <span className="flex-grow-1">{item.label}</span>
                    {item.badge && (
                      <span className="badge bg-danger rounded-pill">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Nav.Link>
            </Nav.Item>
          );
        })}
      </Nav>

      {/* Collapsed Tooltips */}
      {collapsed && (
        <div className="sidebar-tooltips">
          {menuItems.map((item) => (
            <div
              key={item.path}
              className="tooltip-item"
              data-tooltip={item.label}
            >
              <Link
                to={item.path}
                className={`d-flex align-items-center justify-content-center rounded-3 p-2 ${
                  location.pathname === item.path
                    ? 'bg-primary text-white'
                    : 'text-secondary hover-bg-light'
                }`}
                style={{
                  transition: 'all 0.2s ease-in-out',
                  width: '40px',
                  height: '40px'
                }}
              >
                {item.icon}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sidebar;
