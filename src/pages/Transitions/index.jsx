import React, { useState, useEffect } from 'react';
import { FaSpinner, FaCalendarAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../config/axios';
import { Card, Form, Pagination, Modal, Button, Row, Col } from 'react-bootstrap';
import Loading from '../../components/Loading';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import '../Categories/Categories.css';

const Transitions = () => {
  const [transitions, setTransitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState({
    page: 1,
    limit: 10,
    start_date: null,
    end_date: null,
    duration: '',
  });
  const [pagination, setPagination] = useState({
    total: 0,
    current_page: 1,
    per_page: 10,
    last_page: 1,
    from: 1,
    to: 1
  });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  useEffect(() => {
    fetchTransitions();
  }, [searchParams.page, searchParams.limit, searchParams.duration, searchParams.start_date, searchParams.end_date]);

  const fetchTransitions = async (page = searchParams.page) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: searchParams.limit,
        duration: searchParams.duration,
        start_date: searchParams.start_date ? searchParams.start_date.toISOString().split('T')[0] : null,
        end_date: searchParams.end_date ? searchParams.end_date.toISOString().split('T')[0] : null,
      };

      const response = await axiosInstance.get("/transiions", { params });
      const result = response.data;

      if (!result.success) {
        throw new Error(result.message || "Failed to fetch transitions");
      }

      setTransitions(result.data);
      if (result.pagination) {
        setPagination(result.pagination);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch transitions");
      setTransitions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDurationChange = (e) => {
    const duration = e.target.value;
    setSearchParams(prev => ({
      ...prev,
      duration,
      start_date: null,
      end_date: null,
      page: 1
    }));
  };

  const handleDateRangeChange = (dates) => {
    const [start, end] = dates;
    setSearchParams(prev => ({
      ...prev,
      start_date: start,
      end_date: end,
      duration: '',
      page: 1
    }));
  };

  const clearFilters = () => {
    setSearchParams(prev => ({
      ...prev,
      start_date: null,
      end_date: null,
      duration: '',
      page: 1
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

  const handleRowClick = (transition) => {
    setSelectedPayment(transition);
    setShowPaymentModal(true);
  };

  const handleCloseModal = () => {
    setShowPaymentModal(false);
    setSelectedPayment(null);
  };

  const getPaymentTypeText = (type) => {
    switch (type) {
      case "1": return "Cash";
      case "2": return "Bank";
      case "3": return "Mobile Banking";
      default: return "Unknown";
    }
  };

  const getStatusText = (status) => {
    return status === "1" ? "Paid" : "Unpaid";
  };

  const renderPagination = () => {
    const items = [];
    const maxPages = 5;
    let startPage = Math.max(1, pagination.current_page - Math.floor(maxPages / 2));
    let endPage = Math.min(pagination.last_page, startPage + maxPages - 1);

    if (endPage - startPage + 1 < maxPages) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    // First page
    items.push(
      <Pagination.First
        key="first"
        onClick={() => handlePageChange(1)}
        disabled={pagination.current_page === 1}
      />
    );

    // Previous page
    items.push(
      <Pagination.Prev
        key="prev"
        onClick={() => handlePageChange(pagination.current_page - 1)}
        disabled={pagination.current_page === 1}
      />
    );

    // Page numbers
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

    // Next page
    items.push(
      <Pagination.Next
        key="next"
        onClick={() => handlePageChange(pagination.current_page + 1)}
        disabled={pagination.current_page === pagination.last_page}
      />
    );

    // Last page
    items.push(
      <Pagination.Last
        key="last"
        onClick={() => handlePageChange(pagination.last_page)}
        disabled={pagination.current_page === pagination.last_page}
      />
    );

    return items;
  };

  if (loading && !transitions.length) {
    return <Loading />;
  }

  return (
    <div className="categories-container">
      <Card>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">Transitions</h2>
            <div className="d-flex gap-3 align-items-center flex-wrap">
              <Row className="g-2 align-items-center me-3">
                <Col xs="auto">
                  <Form.Select
                    value={searchParams.duration}
                    onChange={handleDurationChange}
                    style={{ width: 'auto' }}
                  >
                    <option value="">All Time</option>
                    <option value="today">Today</option>
                    <option value="this_week">This Week</option>
                    <option value="this_month">This Month</option>
                  </Form.Select>
                </Col>
                <Col xs="auto">
                  <div className="d-flex align-items-center date-range-picker-container">
                    <span className="text-muted me-2">Date Range:</span>
                    <FaCalendarAlt className="me-2" />
                    <DatePicker
                      selected={searchParams.start_date}
                      onChange={handleDateRangeChange}
                      startDate={searchParams.start_date}
                      endDate={searchParams.end_date}
                      selectsRange
                      dateFormat="yyyy-MM-dd"
                      placeholderText="Select date range"
                      className="form-control"
                      isClearable
                    />
                  </div>
                </Col>
                <Col xs="auto">
                  <Button 
                    variant="outline-secondary" 
                    onClick={clearFilters}
                    disabled={!searchParams.duration && !searchParams.start_date && !searchParams.end_date}
                  >
                    Clear Filters
                  </Button>
                </Col>
              </Row>
              
              <Form.Select
                style={{ width: 'auto' }}
                value={searchParams.limit}
                onChange={handleLimitChange}
              >
                <option value="5">5 per page</option>
                <option value="10">10 per page</option>
                <option value="20">20 per page</option>
                <option value="50">50 per page</option>
              </Form.Select>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="bg-light">
                <tr>
                  <th>ID</th>
                  <th>Payment ID</th>
                  <th>Amount</th>
                  <th>Order ID</th>
                  <th>Status</th>
                  <th>Payment Type</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {transitions.map((transition) => (
                  <tr 
                    key={transition.transition_id}
                    onClick={() => handleRowClick(transition)}
                    style={{ cursor: 'pointer' }}
                    className="hover-bg-light"
                  >
                    <td>{transition.transition_id}</td>
                    <td>{transition.payment_id}</td>
                    <td>৳{parseFloat(transition.amount).toLocaleString()}</td>
                    <td>{transition.payment_details.order_id}</td>
                    <td>
                      <span className={`status-badge ${transition.payment_details.status === "1" ? "active" : "inactive"}`}>
                        {getStatusText(transition.payment_details.status)}
                      </span>
                    </td>
                    <td>
                      {getPaymentTypeText(transition.payment_details.payment_type)}
                    </td>
                    <td>{new Date(transition.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.last_page > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination className="mb-0">{renderPagination()}</Pagination>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Payment Details Modal */}
      <Modal show={showPaymentModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Payment Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPayment && (
            <div className="payment-details">
              <div className="mb-3">
                <h6 className="text-muted mb-2">Basic Information</h6>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Transition ID:</span>
                  <span className="fw-medium">{selectedPayment.transition_id}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Payment ID:</span>
                  <span className="fw-medium">{selectedPayment.payment_id}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Order ID:</span>
                  <span className="fw-medium">{selectedPayment.payment_details.order_id}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Date:</span>
                  <span className="fw-medium">{new Date(selectedPayment.created_at).toLocaleString()}</span>
                </div>
              </div>

              <div className="mb-3">
                <h6 className="text-muted mb-2">Payment Information</h6>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Total Amount:</span>
                  <span className="fw-medium">৳{parseFloat(selectedPayment.payment_details.total_amount).toLocaleString()}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Paid Amount:</span>
                  <span className="fw-medium">৳{parseFloat(selectedPayment.payment_details.padi_amount).toLocaleString()}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Due Amount:</span>
                  <span className="fw-medium">৳{parseFloat(selectedPayment.payment_details.due_amount).toLocaleString()}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Payment Type:</span>
                  <span className="fw-medium">{getPaymentTypeText(selectedPayment.payment_details.payment_type)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Status:</span>
                  <span className={`status-badge ${selectedPayment.payment_details.status === "1" ? "active" : "inactive"}`}>
                    {getStatusText(selectedPayment.payment_details.status)}
                  </span>
                </div>
                {selectedPayment.payment_details.trxed && (
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Transaction ID:</span>
                    <span className="fw-medium">{selectedPayment.payment_details.trxed}</span>
                  </div>
                )}
                {selectedPayment.payment_details.phone && (
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Phone:</span>
                    <span className="fw-medium">{selectedPayment.payment_details.phone}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Transitions; 