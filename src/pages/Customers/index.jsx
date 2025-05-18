import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaSearch, FaSpinner, FaTimes, FaEye } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../config/axios';
import { Card, Form, InputGroup, Button, Pagination } from 'react-bootstrap';
import Loading from '../../components/Loading';
import '../Categories/Categories.css';

const Customers = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    address: "",
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

  useEffect(() => {
    fetchCustomers();
  }, [searchParams.page, searchParams.limit]);

  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeoutId = setTimeout(() => {
      if (searchParams.search !== "") {
        setIsSearching(true);
        fetchCustomers(1);
      }
    }, 500);

    setSearchTimeout(timeoutId);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [searchParams.search]);

  const fetchCustomers = async (page = searchParams.page) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: searchParams.limit,
        ...(searchParams.search && { search: searchParams.search }),
      };

      const response = await axiosInstance.get("/clints", { params });
      const result = response.data;

      if (!result.success) {
        throw new Error(result.message || "Failed to fetch customers");
      }

      setCustomers(result.data);
      setPagination({
        total_rows: result.data.length,
        current_page: page,
        per_page: searchParams.limit,
        total_pages: Math.ceil(result.data.length / searchParams.limit),
        has_more_pages: result.data.length > page * searchParams.limit,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch customers");
      setCustomers([]);
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
      page: 1,
    }));
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

  const openAddModal = () => {
    setFormData({ name: "", email: "", phone: "", password: "", address: "" });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({ name: "", email: "", phone: "", password: "", address: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post("/users/register", formData);
      if (response.data.success) {
        toast.success(response.data.message || "Customer added successfully");
        closeModal();
        fetchCustomers(1);
      } else {
        throw new Error(response.data.message || "Failed to add customer");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
        error.response?.data?.errors ? 
          Object.values(error.response.data.errors).flat().join(', ') :
          error.message || 
          "Failed to add customer";
      
      toast.error(errorMessage);
      
      if (error.response?.status === 422 || error.response?.status === 400) {
        return;
      }
      
      closeModal();
    }
  };

  if (loading && !customers.length) {
    return <Loading />;
  }

  return (
    <div className="categories-container">
      <div className="categories-header">
        <h2>Customers</h2>
        <button className="btn btn-primary" onClick={openAddModal}>
          <FaPlus /> Add Customer
        </button>
      </div>

      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <Form onSubmit={(e) => e.preventDefault()} className="d-flex gap-2">
              <InputGroup>
                <InputGroup.Text>
                  {isSearching ? (
                    <FaSpinner className="spinner-border spinner-border-sm" />
                  ) : (
                    <FaSearch />
                  )}
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search customers..."
                  value={searchParams.search}
                  onChange={handleSearch}
                  disabled={loading}
                  className={isSearching ? "searching" : ""}
                />
                {searchParams.search && !isSearching && (
                  <Button
                    variant="outline-secondary"
                    onClick={() => {
                      setSearchParams((prev) => ({ ...prev, search: "" }));
                      fetchCustomers(1);
                    }}
                    disabled={loading}
                  >
                    <FaTimes />
                  </Button>
                )}
              </InputGroup>
            </Form>

            <Form.Select
              value={searchParams.limit}
              onChange={handleLimitChange}
              style={{ width: "auto" }}
              disabled={loading}
            >
              <option value="5">5 per page</option>
              <option value="10">10 per page</option>
              <option value="20">20 per page</option>
              <option value="50">50 per page</option>
            </Form.Select>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="bg-light">
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Total Orders</th>
                  <th>Total Spend</th>
                  <th>Due Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>{customer.id}</td>
                    <td>{customer.name}</td>
                    <td>{customer.email}</td>
                    <td>{customer.phone}</td>
                    <td>{customer.address || "N/A"}</td>
                    <td>{customer.order_summary.total_orders}</td>
                    <td>৳{customer.order_summary.total_spend.toLocaleString()}</td>
                    <td>৳{customer.payment_summary.due_amount.toLocaleString()}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-info"
                        onClick={() => navigate(`/customers/${customer.id}`)}
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.total_pages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                <Pagination.Prev
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                  disabled={pagination.current_page === 1}
                />
                {[...Array(pagination.total_pages)].map((_, index) => (
                  <Pagination.Item
                    key={index + 1}
                    active={index + 1 === pagination.current_page}
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                  disabled={!pagination.has_more_pages}
                />
              </Pagination>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Add Customer Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New Customer</h3>
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
                    minLength="8"
                  />
                  <small className="text-muted">
                    Password must be at least 8 characters long
                  </small>
                </div>
                <div className="mb-3">
                  <label className="form-label">Address</label>
                  <textarea
                    className="form-control"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    rows="3"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers; 