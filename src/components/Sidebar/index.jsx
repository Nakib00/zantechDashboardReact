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
  MdChevronRight,
  MdMenu,
  MdPerson,
  MdAttachMoney,
  MdLocalOffer,
  MdStar,
  MdSwapHoriz
} from 'react-icons/md';
import { Nav, Badge } from 'react-bootstrap';
import { useOrderContext } from '../../context/OrderContext';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { statusSummary } = useOrderContext();

  const menuItems = [
    {
      title: 'Main',
      items: [
        { 
          path: '/dashboard', 
          icon: <MdDashboard size={22} />, 
          label: 'Dashboard',
          badge: null
        },
        { 
          path: '/analytics', 
          icon: <MdAnalytics size={22} />, 
          label: 'Analytics',
          badge: null
        },
      ]
    },
    {
      title: 'Management',
      items: [
        { 
          path: '/orders', 
          icon: <MdShoppingCart size={22} />, 
          label: 'Orders',
          badge: statusSummary.processing > 0 ? (
            <Badge bg="danger" pill className="ms-2">
              {statusSummary.processing}
            </Badge>
          ) : null
        },
        { 
          path: '/products', 
          icon: <MdInventory size={22} />, 
          label: 'Products',
          badge: null
        },
        { 
          path: '/categories', 
          icon: <MdCategory size={22} />, 
          label: 'Categories',
          badge: null
        },
        { 
          path: '/transitions', 
          icon: <MdSwapHoriz size={22} />, 
          label: 'Transitions',
          badge: null
        },
        { 
          path: '/coupons', 
          icon: <MdLocalOffer size={22} />, 
          label: 'Coupons',
          badge: null
        },
        { 
          path: '/ratings', 
          icon: <MdStar size={22} />, 
          label: 'Ratings',
          badge: null
        },
        { 
          path: '/customers', 
          icon: <MdPeople size={22} />, 
          label: 'Customers',
          badge: null
        },
      ]
    },
    {
      title: 'Inventory',
      items: [
        { 
          path: '/suppliers', 
          icon: <MdBusiness size={22} />, 
          label: 'Suppliers',
          badge: null
        },
        { 
          path: '/challans', 
          icon: <MdPerson size={22} />, 
          label: 'Challans',
          badge: null
        },
        { 
          path: '/expenses', 
          icon: <MdAttachMoney size={22} />, 
          label: 'Expenses',
          badge: null
        },
      ]
    },
    {
      title: 'Activity',
      items: [
        { 
          path: '/activity', 
          icon: <MdMenu size={22} />, 
          label: 'Activity',
          badge: null
        },
      ]
    },
    {
      title: 'Reports',
      items: [
        { 
          path: '/reports/sales', 
          icon: <MdAttachMoney size={22} />, 
          label: 'Sales',
          badge: null
        },
        { 
          path: '/reports/daily', 
          icon: <MdAnalytics size={22} />, 
          label: 'Daily',
          badge: null
        },
      ]
    },
    {
      title: 'Settings',
      items: [
        { 
          path: '/settings/hero', 
          icon: <MdSettings size={22} />, 
          label: 'Hero Section',
          badge: null
        },
        { 
          path: '/settings/documents', 
          icon: <MdSettings size={22} />, 
          label: 'Documents',
          badge: null
        },
      ]
    },
  ];

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className={`sidebar bg-white h-100 shadow-sm ${collapsed ? 'collapsed' : ''}`}>
      {/* Brand Section */}
      <div className="sidebar-brand p-3 border-bottom">
        <div className="d-flex align-items-center justify-content-between">
          {!collapsed && (
            <div className="brand-logo d-flex align-items-center gap-2">
              <MdStore size={28} className="text-primary" />
              <span className="brand-text fw-bold">ZanTech</span>
            </div>
          )}
          <button 
            className="btn btn-link text-secondary p-0 d-flex align-items-center"
            onClick={toggleSidebar}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <MdChevronRight size={24} /> : <MdChevronLeft size={24} />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="sidebar-nav p-3">
        {menuItems.map((section, index) => (
          <div key={index} className="mb-4">
            {!collapsed && (
              <div className="sidebar-section-title text-uppercase small text-secondary mb-2 px-3">
                {section.title}
              </div>
            )}
            <Nav className="flex-column">
              {section.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Nav.Item key={item.path} className="mb-1">
                    <Nav.Link
                      as={Link}
                      to={item.path}
                      className={`sidebar-link d-flex align-items-center gap-3 rounded-3 px-3 py-2 ${
                        isActive 
                          ? 'active' 
                          : ''
                      }`}
                      title={collapsed ? item.label : undefined}
                    >
                      <span className={`sidebar-icon ${isActive ? 'active' : ''}`}>
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
