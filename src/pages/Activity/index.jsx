import React, { useState, useEffect } from 'react';
import { FaSpinner, FaUser, FaCalendarAlt, FaInfoCircle } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../config/axios';
import { Card, Modal, Button, Pagination, Badge } from 'react-bootstrap';
import '../Categories/Categories.css';
import './Activity.css';

const Activity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchParams, setSearchParams] = useState({
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({
    total_rows: 0,
    current_page: 1,
    per_page: 10,
    total_pages: 1,
    has_more_pages: false,
  });

  useEffect(() => {
    fetchActivities();
  }, [searchParams.page, searchParams.limit]);

  const fetchActivities = async (page = searchParams.page) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: searchParams.limit,
      };

      const response = await axiosInstance.get("/activitys", { params });
      const result = response.data;

      if (!result.success) {
        throw new Error(result.message || "Failed to fetch activities");
      }

      setActivities(result.data);
      if (result.pagination) {
        setPagination(result.pagination);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch activities");
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setSearchParams((prev) => ({
      ...prev,
      page,
    }));
  };

  const handleLimitChange = (e) => {
    const limit = parseInt(e.target.value);
    setSearchParams((prev) => ({
      ...prev,
      limit,
      page: 1,
    }));
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleCloseUserModal = () => {
    setShowUserModal(false);
    setSelectedUser(null);
  };

  const getActivityTypeText = (type) => {
    const types = {
      coupon: 'Coupon',
      order: 'Order',
      product: 'Product',
      user: 'User',
      default: type
    };

    return types[type] || types.default;
  };

  const renderPagination = () => {
    const items = [];
    const maxPages = 5;
    let startPage = Math.max(1, pagination.current_page - Math.floor(maxPages / 2));
    let endPage = Math.min(pagination.total_pages, startPage + maxPages - 1);

    if (endPage - startPage + 1 < maxPages) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    if (startPage > 1) {
      items.push(
        <Pagination.First
          key="first"
          onClick={() => handlePageChange(1)}
          disabled={pagination.current_page === 1}
        />,
        <Pagination.Prev
          key="prev"
          onClick={() => handlePageChange(pagination.current_page - 1)}
          disabled={pagination.current_page === 1}
        />
      );
    }

    for (let number = startPage; number <= endPage; number++) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === pagination.current_page}
          onClick={() => handlePageChange(number)}
        >
          {number}
        </Pagination.Item>
      );
    }

    if (endPage < pagination.total_pages) {
      items.push(
        <Pagination.Next
          key="next"
          onClick={() => handlePageChange(pagination.current_page + 1)}
          disabled={pagination.current_page === pagination.total_pages}
        />,
        <Pagination.Last
          key="last"
          onClick={() => handlePageChange(pagination.total_pages)}
          disabled={pagination.current_page === pagination.total_pages}
        />
      );
    }

    return items;
  };

  if (loading && activities.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-text">Zantech</div>
      </div>
    );
  }

  return (
    <div className="activity-container">
      <Card>
        <Card.Body>
          <div className="categories-header">
            <h2>Activity Logs</h2>
            <div className="d-flex align-items-center gap-3">
              <select
                className="form-select"
                value={searchParams.limit}
                onChange={handleLimitChange}
                style={{ width: 'auto' }}
              >
                <option value="5">5 per page</option>
                <option value="10">10 per page</option>
                <option value="20">20 per page</option>
                <option value="50">50 per page</option>
              </select>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Type</th>
                  <th>User</th>
                  <th>Description</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((activity) => (
                  <tr key={activity.id}>
                    <td>{activity.id}</td>
                    <td className="text-capitalize">{getActivityTypeText(activity.type)}</td>
                    <td>
                      <Button
                        variant="link"
                        className="p-0 text-decoration-none"
                        onClick={() => handleUserClick(activity.user)}
                      >
                        <FaUser className="me-1" />
                        {activity.user.name}
                      </Button>
                    </td>
                    <td>{activity.description}</td>
                    <td>
                      <FaCalendarAlt className="me-1" />
                      {new Date(activity.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.total_pages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>{renderPagination()}</Pagination>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* User Details Modal */}
      <Modal show={showUserModal} onHide={handleCloseUserModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaUser className="me-2" />
            User Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <div className="user-details">
              <div className="mb-3">
                <h6 className="text-muted mb-2">Basic Information</h6>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Name:</span>
                  <span className="fw-medium">{selectedUser.name}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Email:</span>
                  <span className="fw-medium">{selectedUser.email}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Phone:</span>
                  <span className="fw-medium">{selectedUser.phone || 'N/A'}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Address:</span>
                  <span className="fw-medium">{selectedUser.address || 'N/A'}</span>
                </div>
              </div>

              <div className="mb-3">
                <h6 className="text-muted mb-2">Account Information</h6>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Role:</span>
                  <Badge bg={selectedUser.type === 'admin' ? 'primary' : 'secondary'}>
                    {selectedUser.type.toUpperCase()}
                  </Badge>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Status:</span>
                  <Badge bg={selectedUser.status === 1 ? 'success' : 'danger'}>
                    {selectedUser.status === 1 ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Member Since:</span>
                  <span className="fw-medium">
                    {new Date(selectedUser.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Last Updated:</span>
                  <span className="fw-medium">
                    {new Date(selectedUser.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseUserModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Activity; 