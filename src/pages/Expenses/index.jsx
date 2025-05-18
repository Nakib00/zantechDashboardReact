import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaSpinner, FaChevronLeft, FaChevronRight, FaEye, FaTimes, FaUpload, FaDownload, FaFilter } from "react-icons/fa";
import { toast } from "react-hot-toast";
import axiosInstance from "../../config/axios";
import { Card, Form, Button, Pagination, Row, Col, Modal } from "react-bootstrap";
import "./Expenses.css";
import { Link } from "react-router-dom";

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    per_page: 5,
    current_page: 1,
    last_page: 1,
    from: 1,
    to: 5
  });
  const [searchParams, setSearchParams] = useState({
    limit: 5,
    page: 1,
    date: "",
    start_date: "",
    end_date: ""
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    title: "",
    amount: "",
    description: "",
    prove: []
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchExpenses();
  }, [searchParams.page, searchParams.limit, searchParams.date, searchParams.start_date, searchParams.end_date]);

  const fetchExpenses = async (page = searchParams.page) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: searchParams.limit,
        ...(searchParams.date && { date: searchParams.date }),
        ...(searchParams.start_date && { start_date: searchParams.start_date }),
        ...(searchParams.end_date && { end_date: searchParams.end_date })
      };

      const response = await axiosInstance.get("/expenses", { params });
      if (response.data.success) {
        setExpenses(response.data.data);
        setPagination(response.data.pagination);
      } else {
        throw new Error(response.data.message || "Failed to fetch expenses");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch expenses");
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setSearchParams(prev => ({
      ...prev,
      page
    }));
  };

  const handleLimitChange = (e) => {
    const limit = parseInt(e.target.value);
    setSearchParams(prev => ({
      ...prev,
      limit,
      page: 1
    }));
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        const response = await axiosInstance.delete(`/expenses/${id}`);
        if (response.data.success) {
          toast.success("Expense deleted successfully");
          fetchExpenses(searchParams.page);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete expense");
      }
    }
  };

  const handleAddExpense = () => {
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setFormData({
      date: "",
      title: "",
      amount: "",
      description: "",
      prove: []
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.date) errors.date = "Date is required";
    if (!formData.title) errors.title = "Title is required";
    if (!formData.amount) {
      errors.amount = "Amount is required";
    } else if (isNaN(formData.amount) || parseFloat(formData.amount) < 0) {
      errors.amount = "Amount must be a positive number";
    }
    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      const isValidType = validTypes.includes(file.type);
      const isValidSize = file.size <= 3 * 1024 * 1024; // 3MB
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      toast.error("Some files were invalid. Only JPG, PNG, and PDF files up to 3MB are allowed.");
    }

    setFormData(prev => ({
      ...prev,
      prove: validFiles
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('date', formData.date);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('amount', formData.amount);
      formDataToSend.append('description', formData.description);
      
      formData.prove.forEach((file, index) => {
        formDataToSend.append(`prove[${index}]`, file);
      });

      const response = await axiosInstance.post('/expenses', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        toast.success("Expense added successfully");
        handleCloseModal();
        fetchExpenses(1);
      } else {
        throw new Error(response.data.message || "Failed to add expense");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPagination = () => {
    const items = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, pagination.current_page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pagination.last_page, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      items.push(
        <Pagination.First key="first" onClick={() => handlePageChange(1)} />,
        <Pagination.Prev key="prev" onClick={() => handlePageChange(pagination.current_page - 1)} />
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

    if (endPage < pagination.last_page) {
      items.push(
        <Pagination.Next key="next" onClick={() => handlePageChange(pagination.current_page + 1)} />,
        <Pagination.Last key="last" onClick={() => handlePageChange(pagination.last_page)} />
      );
    }

    return items;
  };

  const handleDateFilterChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value,
      page: 1,
      // Clear other date filters when exact date is set
      ...(name === 'date' && { start_date: "", end_date: "" }),
      // Clear exact date when range is set
      ...((name === 'start_date' || name === 'end_date') && { date: "" })
    }));
  };

  const clearDateFilters = () => {
    setSearchParams(prev => ({
      ...prev,
      date: "",
      start_date: "",
      end_date: "",
      page: 1
    }));
  };

  if (loading && expenses.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-text">Zantech</div>
      </div>
    );
  }

  return (
    <div className="expenses-container">
      <Card>
        <Card.Body>
          <div className="expenses-header d-flex justify-content-between align-items-center">
            <h2>Expenses</h2>
            <Button variant="primary" onClick={handleAddExpense}>
              <FaPlus className="me-2" /> Add Expense
            </Button>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex gap-2 align-items-center">
              <Button
                variant="outline-secondary"
                onClick={() => setShowFilters(!showFilters)}
                className="d-flex align-items-center gap-2"
              >
                <FaFilter /> Filters
                {(searchParams.date || searchParams.start_date || searchParams.end_date) && (
                  <span className="badge bg-primary">Active</span>
                )}
              </Button>
            </div>

            <div className="d-flex gap-2 align-items-center">
              <Form.Select
                value={searchParams.limit}
                onChange={handleLimitChange}
                style={{ width: "120px" }}
                disabled={loading}
              >
                <option value="5">5 per page</option>
                <option value="10">10 per page</option>
                <option value="20">20 per page</option>
                <option value="50">50 per page</option>
              </Form.Select>
            </div>
          </div>

          {/* Date Filters */}
          {showFilters && (
            <Card className="mb-3">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="mb-0">Date Filters</h6>
                  {(searchParams.date || searchParams.start_date || searchParams.end_date) && (
                    <Button
                      variant="link"
                      className="text-danger p-0"
                      onClick={clearDateFilters}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Exact Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="date"
                        value={searchParams.date}
                        onChange={handleDateFilterChange}
                        disabled={!!(searchParams.start_date || searchParams.end_date)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Start Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="start_date"
                        value={searchParams.start_date}
                        onChange={handleDateFilterChange}
                        disabled={!!searchParams.date}
                        max={searchParams.end_date || undefined}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>End Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="end_date"
                        value={searchParams.end_date}
                        onChange={handleDateFilterChange}
                        disabled={!!searchParams.date}
                        min={searchParams.start_date || undefined}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}

          <div className="table-responsive">
            <table className="table expenses-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Date</th>
                  <th>Title</th>
                  <th>Amount</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>{expense.id}</td>
                    <td>{new Date(expense.date).toLocaleDateString()}</td>
                    <td>{expense.title}</td>
                    <td className="expense-amount">৳{parseFloat(expense.amount).toLocaleString()}</td>
                    <td className="expense-description">{expense.description || "N/A"}</td>
                    <td>
                      <div className="expense-actions">
                        <Button
                          variant="outline-info"
                          size="sm"
                          as={Link}
                          to={`/expenses/${expense.id}`}
                        >
                          <FaEye />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(expense.id)}
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.last_page > 1 && (
            <div className="pagination-container">
              <Pagination>{renderPagination()}</Pagination>
            </div>
          )}

          {/* Add Expense Modal */}
          <Modal show={showAddModal} onHide={handleCloseModal} size="lg">
            <Modal.Header closeButton>
              <Modal.Title>Add New Expense</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Date <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        isInvalid={!!formErrors.date}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formErrors.date}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Amount (৳) <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleInputChange}
                        placeholder="Enter amount"
                        min="0"
                        step="0.01"
                        isInvalid={!!formErrors.amount}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formErrors.amount}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Title <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter expense title"
                    isInvalid={!!formErrors.title}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.title}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter expense description"
                    rows={3}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Proof Documents</Form.Label>
                  <Form.Control
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    accept=".jpg,.jpeg,.png,.pdf"
                  />
                  <Form.Text className="text-muted">
                    Upload JPG, PNG, or PDF files (max 3MB each)
                  </Form.Text>
                </Form.Group>

                <div className="d-flex justify-content-end gap-2">
                  <Button variant="secondary" onClick={handleCloseModal}>
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <FaSpinner className="spinner me-2" />
                        Adding...
                      </>
                    ) : (
                      'Add Expense'
                    )}
                  </Button>
                </div>
              </Form>
            </Modal.Body>
          </Modal>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Expenses; 