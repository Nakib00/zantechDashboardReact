import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaSpinner,
  FaEye,
  FaTimes,
  FaPlus,
  FaCalendarAlt,
  FaFilter,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import axiosInstance from "../../config/axios";
import {
  Card,
  Form,
  InputGroup,
  Button,
  Pagination,
  Row,
  Col,
  Badge,
} from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Loading from "../../components/Loading";
import "./Orders.css";

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState({
    search: "",
    page: 1,
    limit: 10,
    startDate: null,
    endDate: null,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    current_page: 1,
    per_page: 10,
    last_page: 1,
    from: 0,
    to: 0,
  });
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    fetchOrders();
  }, [
    searchParams.page,
    searchParams.limit,
    searchParams.startDate,
    searchParams.endDate,
  ]);

  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeoutId = setTimeout(() => {
      if (searchParams.search !== "") {
        setIsSearching(true);
        fetchOrders(1);
      }
    }, 500);

    setSearchTimeout(timeoutId);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [searchParams.search]);

  const fetchOrders = async (page = searchParams.page) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: searchParams.limit,
        ...(searchParams.search && { search: searchParams.search }),
        ...(searchParams.startDate && {
          start_date: searchParams.startDate.toISOString().split("T")[0],
        }),
        ...(searchParams.endDate && {
          end_date: searchParams.endDate.toISOString().split("T")[0],
        }),
      };

      const response = await axiosInstance.get("/orders", { params });
      const result = response.data;

      if (!result.success) {
        throw new Error(result.message || "Failed to fetch orders");
      }

      setOrders(result.data);
      if (result.pagination) {
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error(error.response?.data?.message || "Failed to fetch orders");
      setOrders([]);
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

  const handleFilterStatusChange = (e) => {
    setFilterStatus(e.target.value);
  };

  const handleDateChange = (dates) => {
    const [start, end] = dates;

    // Validate dates
    if (start && end && start > end) {
      toast.error("Start date cannot be after end date");
      return;
    }

    // Format dates to start and end of day
    const formattedStart = start ? new Date(start.setHours(0, 0, 0, 0)) : null;
    const formattedEnd = end ? new Date(end.setHours(23, 59, 59, 999)) : null;

    setSearchParams((prev) => ({
      ...prev,
      startDate: formattedStart,
      endDate: formattedEnd,
      page: 1,
    }));
  };

  const clearDateFilter = () => {
    setSearchParams((prev) => ({
      ...prev,
      startDate: null,
      endDate: null,
      page: 1,
    }));
  };

  const filteredOrders = filterStatus
    ? orders.filter((order) => order.status?.toString() === filterStatus)
    : orders;

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingStatus((prev) => ({ ...prev, [orderId]: true }));
    try {
      const response = await axiosInstance.put(
        `/orders/update-status/${orderId}`,
        {
          status: parseInt(newStatus),
        }
      );

      console.log("API Response:", response.data);

      if (response.data.success) {
        toast.success(
          response.data.message || "Order status updated successfully"
        );
        // Update the local state with new status
        setOrders((prev) =>
          prev.map((order) =>
            order.order_id === orderId
              ? {
                  ...order,
                  status: response.data.data.new_status.toString(),
                  status_change_desc: response.data.data.status_change_desc,
                }
              : order
          )
        );
      } else {
        throw new Error(response.data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Status update error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
      });

      // Show more specific error message based on the error type
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        toast.error(
          error.response.data?.message ||
            `Error ${error.response.status}: ${error.response.statusText}`
        );
      } else if (error.request) {
        // The request was made but no response was received
        toast.error(
          "No response received from server. Please check your internet connection."
        );
      } else {
        // Something happened in setting up the request that triggered an Error
        toast.error(
          error.message || "Something went wrong while updating the status"
        );
      }
    } finally {
      setUpdatingStatus((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const renderPagination = () => {
    const items = [];
    const maxPages = 5;
    let startPage = Math.max(
      1,
      pagination.current_page - Math.floor(maxPages / 2)
    );
    let endPage = Math.min(pagination.last_page, startPage + maxPages - 1);

    if (endPage - startPage + 1 < maxPages) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    // Previous button
    items.push(
      <Pagination.Prev
        key="prev"
        onClick={() => handlePageChange(pagination.current_page - 1)}
        disabled={pagination.current_page === 1}
      />
    );

    // First page
    if (startPage > 1) {
      items.push(
        <Pagination.Item key={1} onClick={() => handlePageChange(1)}>
          1
        </Pagination.Item>
      );
      if (startPage > 2) {
        items.push(<Pagination.Ellipsis key="ellipsis1" disabled />);
      }
    }

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

    // Last page
    if (endPage < pagination.last_page) {
      if (endPage < pagination.last_page - 1) {
        items.push(<Pagination.Ellipsis key="ellipsis2" disabled />);
      }
      items.push(
        <Pagination.Item
          key={pagination.last_page}
          onClick={() => handlePageChange(pagination.last_page)}
        >
          {pagination.last_page}
        </Pagination.Item>
      );
    }

    // Next button
    items.push(
      <Pagination.Next
        key="next"
        onClick={() => handlePageChange(pagination.current_page + 1)}
        disabled={pagination.current_page === pagination.last_page}
      />
    );

    return items;
  };

  if (loading && !orders.length) {
    return <Loading />;
  }

  return (
    <div className="orders-container">
      <Card className="modern-card">
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="page-title mb-1">Orders</h2>
              <p className="text-muted mb-0">
                Manage and track all your orders
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => navigate("/orders/create")}
              className="create-order-btn"
            >
              <FaPlus className="me-2" /> Create Order
            </Button>
          </div>

          <div className="filters-section mb-4">
            <Row className="g-3">
              <Col md={3}>
                <div className="search-box">
                  <InputGroup>
                    <InputGroup.Text className="search-icon">
                      {isSearching ? (
                        <FaSpinner className="spinner" />
                      ) : (
                        <FaSearch />
                      )}
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Search orders..."
                      value={searchParams.search}
                      onChange={handleSearch}
                      className="search-input"
                    />
                    {searchParams.search && (
                      <Button
                        variant="link"
                        className="clear-search"
                        onClick={() => {
                          setSearchParams((prev) => ({ ...prev, search: "" }));
                          fetchOrders(1);
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
                      popperModifiers={[
                        {
                          name: "preventOverflow",
                          options: {
                            boundary: "viewport",
                          },
                        },
                      ]}
                    />
                  </InputGroup>
                </div>
              </Col>
              <Col md={2}>
                <Form.Select
                  value={filterStatus}
                  onChange={handleFilterStatusChange}
                  className="status-filter"
                >
                  <option value="">All Statuses</option>
                  <option value="0">On Processing</option>
                  <option value="1">Completed</option>
                  <option value="2">On Hold</option>
                  <option value="3">Cancelled</option>
                  <option value="4">Refunded</option>
                </Form.Select>
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
                    <th>Order ID</th>
                    <th>Invoice Code</th>
                    <th>Customer Info</th>
                    <th>Total Amount</th>
                    <th>Paid Amount</th>
                    <th>Due Amount</th>
                    <th>Status</th>
                    <th>Order Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.order_id}>
                      <td className="fw-medium">#{order.order_id}</td>
                      <td>{order.invoice_code}</td>
                      <td>
                        <div className="customer-info">
                          <div className="customer-name">{order.user_name}</div>
                          <div className="customer-phone text-muted">
                            <small>📞 {order.user_phone}</small>
                          </div>
                          <div className="customer-email text-muted">
                            <small>✉️ {order.user_email}</small>
                          </div>
                        </div>
                      </td>
                      <td className="fw-medium">
                        ৳{parseFloat(order.total_amount).toLocaleString()}
                      </td>
                      <td className="text-success">
                        ৳{parseFloat(order.paid_amount || 0).toLocaleString()}
                      </td>
                      <td
                        className={
                          parseFloat(order.due_amount || 0) > 0
                            ? "text-danger"
                            : "text-success"
                        }
                      >
                        ৳{parseFloat(order.due_amount || 0).toLocaleString()}
                      </td>
                      <td>
                        <Form.Select
                          value={order.status?.toString() || "0"}
                          onChange={(e) =>
                            handleStatusChange(order.order_id, e.target.value)
                          }
                          disabled={updatingStatus[order.order_id]}
                          size="sm"
                          className="status-select"
                        >
                          <option value="0">On Processing</option>
                          <option value="1">Completed</option>
                          <option value="2">On Hold</option>
                          <option value="3">Cancelled</option>
                          <option value="4">Refunded</option>
                        </Form.Select>
                      </td>
                      <td>
                        {new Date(
                          order.order_placed_date_time
                        ).toLocaleString()}
                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="view-btn"
                          onClick={() => navigate(`/orders/${order.order_id}`)}
                        >
                          <FaEye className="me-1" /> View
                        </Button>
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
        </Card.Body>
      </Card>
    </div>
  );
};

export default Orders;
