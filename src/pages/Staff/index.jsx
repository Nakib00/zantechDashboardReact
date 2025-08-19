import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaSearch, FaSpinner, FaTimes, FaTrash } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../config/axios';
import { Card, Form, InputGroup, Button, Pagination, Row, Col, Modal, Badge } from 'react-bootstrap';
import Loading from '../../components/Loading';
import './Staff.css';
import usePageTitle from '../../hooks/usePageTitle';

const Staff = () => {
  usePageTitle('Manage Staff');
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    type: "stuff",
  });
  const [searchParams, setSearchParams] = useState({
    search: "",
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
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [statusToggleLoading, setStatusToggleLoading] = useState({});

  useEffect(() => {
    fetchStaff();
  }, [searchParams.page, searchParams.limit]);

  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeoutId = setTimeout(() => {
      setIsSearching(true);
      fetchStaff(1);
    }, 500);

    setSearchTimeout(timeoutId);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [searchParams.search]);

  const fetchStaff = async (page = 1) => {
    setLoading(true);
    if (isSearching) {
        setSearchParams(prev => ({ ...prev, page: 1 }));
    }

    try {
      const params = {
        page: isSearching ? 1 : page,
        limit: searchParams.limit,
        ...(searchParams.search && { search: searchParams.search }),
      };

      const response = await axiosInstance.get("/stuff", { params });
      const result = response.data;

      if (!result.success) {
        throw new Error(result.message || "Failed to fetch staff");
      }

      setStaff(result.data);
      
      if (result.pagination) {
        setPagination({
            total_rows: result.pagination.total,
            current_page: result.pagination.current_page,
            per_page: result.pagination.per_page,
            total_pages: result.pagination.last_page,
            has_more_pages: result.pagination.current_page < result.pagination.last_page,
        });
      } else {
        setPagination({
            total_rows: result.data.length,
            current_page: 1,
            per_page: result.data.length,
            total_pages: 1,
            has_more_pages: false,
        });
      }

    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch staff");
      setStaff([]);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  const handleSearch = (e) => {
    const { value } = e.target;
    setSearchParams((prev) => ({
      ...prev,
      search: value,
    }));
  };

  const handlePageChange = (page) => {
    setSearchParams(prev => ({...prev, page}));
  }

  const openAddModal = () => {
    setFormData({ name: "", email: "", phone: "", password: "", type: "stuff" });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axiosInstance.post("/register", formData);
      if (response.data.success) {
        toast.success(response.data.message || "Staff added successfully");
        closeModal();
        fetchStaff(1);
      } else {
        throw new Error(response.data.message || "Failed to add staff");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
        (error.response?.data?.errors ? 
          Object.values(error.response.data.errors).flat().join(', ') :
          error.message || 
          "Failed to add staff");
      
      toast.error(errorMessage);
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDeleteStaff = async (id) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
        try {
            const response = await axiosInstance.delete(`/stuff/delete/${id}`);
            if (response.data.success) {
                toast.success(response.data.message || 'Staff deleted successfully');
                fetchStaff(pagination.current_page);
            } else {
                throw new Error(response.data.message || 'Failed to delete staff');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete staff');
        }
    }
  };

  const handleToggleStatus = async (id) => {
    setStatusToggleLoading(prev => ({...prev, [id]: true}));
    try {
        const response = await axiosInstance.patch(`/users/toggle-status/${id}`);
        if (response.data.success) {
            toast.success(response.data.message || "Status updated successfully");
            setStaff(prevStaff => prevStaff.map(member => 
                member.id === id ? {...member, status: Number(response.data.data)} : member
            ));
        } else {
            throw new Error(response.data.message || "Failed to update status");
        }
    } catch (error) {
        toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
        setStatusToggleLoading(prev => ({...prev, [id]: false}));
    }
  }

  const renderPagination = () => {
    if (pagination.total_pages <= 1) return null;

    let items = [];
    for (let number = 1; number <= pagination.total_pages; number++) {
        items.push(
            <Pagination.Item key={number} active={number === pagination.current_page} onClick={() => handlePageChange(number)}>
                {number}
            </Pagination.Item>,
        );
    }

    return (
        <Pagination>
            <Pagination.Prev onClick={() => handlePageChange(pagination.current_page - 1)} disabled={pagination.current_page === 1} />
            {items}
            <Pagination.Next onClick={() => handlePageChange(pagination.current_page + 1)} disabled={!pagination.has_more_pages} />
        </Pagination>
    );
  };

  if (loading && !staff.length) {
    return <Loading />;
  }

  return (
    <div className="customers-container">
      <Card className="modern-card">
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="page-title mb-1">Staff</h2>
              <p className="text-muted mb-0">Manage and track all your staff members</p>
            </div>
            <Button
              variant="primary"
              onClick={openAddModal}
              className="create-customer-btn"
            >
              <FaPlus className="me-2" /> Add Staff
            </Button>
          </div>

          <div className="filters-section mb-4">
            <Row className="g-3">
              <Col md={6}>
                <div className="search-box">
                  <InputGroup>
                    <InputGroup.Text className="search-icon">
                      {isSearching ? <FaSpinner className="spinner" /> : <FaSearch />}
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Search staff..."
                      value={searchParams.search}
                      onChange={handleSearch}
                      className="search-input"
                      disabled={loading}
                    />
                    {searchParams.search && !isSearching && (
                      <Button
                        variant="link"
                        className="clear-search"
                        onClick={() => {
                          setSearchParams((prev) => ({ ...prev, search: "" }));
                        }}
                      >
                        <FaTimes />
                      </Button>
                    )}
                  </InputGroup>
                </div>
              </Col>
            </Row>
          </div>

          <div className="table-container">
            <div className="table-responsive">
              <table className="table table-hover modern-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Address</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((staffMember) => (
                    <tr key={staffMember.id}>
                      <td className="fw-medium">#{staffMember.id}</td>
                      <td>{staffMember.name}</td>
                      <td>{staffMember.email}</td>
                      <td>{staffMember.phone}</td>
                      <td>{staffMember.address || "N/A"}</td>
                      <td>{staffMember.type}</td>
                      <td>
                        <Button
                            variant={Number(staffMember.status) === 1 ? 'success' : 'secondary'}
                            size="sm"
                            onClick={() => handleToggleStatus(staffMember.id)}
                            disabled={statusToggleLoading[staffMember.id]}
                        >
                            {statusToggleLoading[staffMember.id] ? <FaSpinner className="spinner" /> : (Number(staffMember.status) === 1 ? 'Active' : 'Inactive')}
                        </Button>
                      </td>
                      <td>
                        <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteStaff(staffMember.id)}
                        >
                            <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="d-flex justify-content-center mt-4">
            {renderPagination()}
          </div>

        </Card.Body>
      </Card>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New Staff</h3>
              <button className="btn-close" onClick={closeModal} />
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Phone</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    required
                    pattern="[0-9]{11}"
                    title="Phone number must be exactly 11 digits"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                    minLength="6"
                  />
                  <small className="text-muted">
                    Password must be at least 6 characters long
                  </small>
                </div>
                <div className="mb-3">
                  <label className="form-label">Type</label>
                  <select
                    className="form-select"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    required
                  >
                    <option value="admin">Admin</option>
                    <option value="stuff">Stuff</option>
                    <option value="member">Member</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <Button
                  variant="secondary"
                  onClick={closeModal}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  {isSubmitting ? <><FaSpinner className="spinner" /> Submitting...</> : "Add Staff"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Staff;