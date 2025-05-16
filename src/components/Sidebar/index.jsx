import React from 'react';
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
  MdBusiness
} from 'react-icons/md';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', icon: <MdDashboard />, label: 'Dashboard' },
    { path: '/orders', icon: <MdShoppingCart />, label: 'Orders' },
    { path: '/customers', icon: <MdPeople />, label: 'Customers' },
    { path: '/products', icon: <MdInventory />, label: 'Products' },
    { path: '/categories', icon: <MdCategory />, label: 'Categories' },
    { path: '/suppliers', icon: <MdBusiness />, label: 'Suppliers' },
    { path: '/shipping', icon: <MdLocalShipping />, label: 'Shipping' },
    { path: '/payments', icon: <MdPayment />, label: 'Payments' },
    { path: '/analytics', icon: <MdAnalytics />, label: 'Analytics' },
    { path: '/store', icon: <MdStore />, label: 'Store' },
    { path: '/settings', icon: <MdSettings />, label: 'Settings' },
  ];

  return (
    <div className="sidebar">  
      <nav className="sidebar-nav">
        <ul className="nav flex-column">
          {menuItems.map((item) => (
            <li className="nav-item" key={item.path}>
              <Link
                to={item.path}
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                <span className="icon">{item.icon}</span>
                <span className="label">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
