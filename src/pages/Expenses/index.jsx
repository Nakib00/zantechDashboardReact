import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaSpinner, FaChevronLeft, FaChevronRight, FaEye, FaTimes, FaUpload, FaDownload, FaFilter, FaSearch, FaCalendarAlt } from "react-icons/fa";
import { toast } from "react-hot-toast";
import axiosInstance from "../../config/axios";
import { Card, Form, Button, Pagination, Row, Col, Modal, InputGroup } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./Expenses.css";
import { Link } from "react-router-dom";
import Loading from "../../components/Loading";

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
    search: "",
    limit: 10,
    page: 1,
    startDate: null,
    endDate: null
  });
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
  }, [searchParams.page, searchParams.limit, searchParams.startDate, searchParams.endDate]);

  const fetchExpenses = async (page = searchParams.page) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: searchParams.limit,
        ...(searchParams.startDate && { start_date: searchParams.startDate.toISOString().split('T')[0] }),
        ...(searchParams.endDate && { end_date: searchParams.endDate.toISOString().split('T')[0] })
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

  const handleSearch = (e) => {
    setSearchParams(prev => ({
      ...prev,
      search: e.target.value,
      page: 1
    }));
  };

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setSearchParams(prev => ({
      ...prev,
      startDate: start,
      endDate: end,
      page: 1
    }));
  };

  const clearDateFilter = () => {
    setSearchParams(prev => ({
      ...prev,
      startDate: null,
      endDate: null,
      page: 1
    }));
  };

  if (loading && expenses.length === 0) {
    return <Loading />;
  }

  return (
    <div className="expenses-container">
      <Card className="modern-card">
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="page-title mb-1">Expenses</h2>
              <p className="text-muted mb-0">Manage and track all your expenses</p>
            </div>
            <Button 
              variant="primary" 
              onClick={handleAddExpense}
              className="create-expense-btn"
            >
              <FaPlus className="me-2" /> Add Expense
            </Button>
          </div>

          <div className="filters-section mb-4">
            <Row className="g-3">
              <Col md={3}>
                <div className="search-box">
                  <InputGroup>
                    <InputGroup.Text className="search-icon">
                      <FaSearch />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Search expenses..."
                      value={searchParams.search}
                      onChange={handleSearch}
                      className="search-input"
                    />
                    {searchParams.search && (
                      <Button
                        variant="link"
                        className="clear-search"
                        onClick={() => {
                          setSearchParams(prev => ({ ...prev, search: "" }));
                          fetchExpenses(1);
                        }}
                      >
                        <FaTimes />
                      </Button>
                    )}
                  </InputGroup>
                </div>
              </Col>
              <Col md={3}>
                <div className="date-filter-box">
                  <InputGroup>
                    <InputGroup.Text>
                      <FaCalendarAlt />
                    </InputGroup.Text>
                    <DatePicker
                      selected={searchParams.startDate}
                      onChange={handleDateChange}
                      startDate={searchParams.startDate}
                      endDate={searchParams.endDate}
                      selectsRange
                      className="form-control date-picker-input"
                      placeholderText="Select date range"
                      dateFormat="yyyy-MM-dd - yyyy-MM-dd"
                      isClearable
                      onClear={clearDateFilter}
                      maxDate={new Date()}
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                      monthsShown={2}
                      calendarStartDay={1}
                      popperClassName="date-range-popper"
                      popperPlacement="bottom-start"
                    />
                  </InputGroup>
                </div>
              </Col>
              <Col md={2}>
                <Form.Select
                  value={searchParams.limit}
                  onChange={handleLimitChange}
                  className="limit-select"
                >
                  <option value="5">5 per page</option>
                  <option value="10">10 per page</option>
                  <option value="20">20 per page</option>
                  <option value="50">50 per page</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                {(searchParams.startDate || searchParams.endDate) && (
                  <Button
                    variant="outline-secondary"
                    onClick={clearDateFilter}
                    className="clear-dates-btn w-100"
                  >
                    <FaTimes className="me-2" /> Clear Dates
                  </Button>
                )}
              </Col>
            </Row>
          </div>

          <div className="table-container">
            <div className="table-responsive">
              <table className="table table-hover modern-table">
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
                      <td className="fw-medium">#{expense.id}</td>
                      <td>{new Date(expense.date).toLocaleDateString()}</td>
                      <td>{expense.title}</td>
                      <td className="expense-amount fw-medium">৳{parseFloat(expense.amount).toLocaleString()}</td>
                      <td className="expense-description">{expense.description || "N/A"}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            as={Link}
                            to={`/expenses/${expense.id}`}
                            className="view-btn"
                          >
                            <FaEye className="me-1" /> View
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(expense.id)}
                            className="delete-btn"
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
          </div>

          {pagination.last_page > 1 && (
            <div className="pagination-container mt-4">
              <Pagination className="modern-pagination">
                {renderPagination()}
              </Pagination>
            </div>
          )}

          {/* Add Expense Modal */}
          <Modal show={showAddModal} onHide={handleCloseModal} size="lg" centered>
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
                        className="form-control-lg"
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
                        className="form-control-lg"
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
                    className="form-control-lg"
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
                    className="form-control-lg"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Proof Documents</Form.Label>
                  <Form.Control
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    accept=".jpg,.jpeg,.png,.pdf"
                    className="form-control-lg"
                  />
                  <Form.Text className="text-muted">
                    Upload JPG, PNG, or PDF files (max 3MB each)
                  </Form.Text>
                </Form.Group>

                <div className="d-flex justify-content-end gap-2">
                  <Button variant="secondary" onClick={handleCloseModal} className="px-4">
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={isSubmitting}
                    className="px-4"
                  >
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