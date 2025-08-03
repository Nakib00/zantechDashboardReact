import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaSpinner,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaEye,
  FaCalendarAlt,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import axiosInstance from "../../config/axios";
import {
  Card,
  Form,
  InputGroup,
  Button,
  Modal,
  Pagination,
  Row,
  Col,
  ListGroup,
} from "react-bootstrap";
import Select from "react-select/async";
import "react-datepicker/dist/react-datepicker.css";
import Loading from "../../components/Loading";
import "../Categories/Categories.css";
import "./Challen.css";

const Challen = () => {
  const navigate = useNavigate();
  const [challans, setChallans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [searchParams, setSearchParams] = useState({
    search: "",
    page: 1,
    limit: 10,
    date: null,
  });
  const [pagination, setPagination] = useState({
    total_rows: 0,
    current_page: 1,
    per_page: 10,
    total_pages: 1,
    has_more_pages: false,
  });
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    fetchChallans();
  }, [searchParams.page, searchParams.limit]);

  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeoutId = setTimeout(() => {
      if (searchParams.search !== "" || searchParams.date) {
        setIsSearching(true);
        fetchChallans(1);
      }
    }, 500);

    setSearchTimeout(timeoutId);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [searchParams.search, searchParams.date]);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const formatDateForAPI = (date) => {
    if (!date) return null;
    // Ensure we're working with a Date object
    const dateObj = date instanceof Date ? date : new Date(date);
    // Format as YYYY-MM-DD for API
    return dateObj.toISOString().split('T')[0];
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    // Convert API date string to local date string (YYYY-MM-DD)
    return new Date(dateString).toISOString().split('T')[0];
  };

  const handleDateChange = (e) => {
    const value = e.target.value ? new Date(e.target.value + 'T00:00:00') : null;
    setSearchParams(prev => ({
      ...prev,
      date: value,
      page: 1
    }));
  };

  const fetchChallans = async (page = searchParams.page) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: searchParams.limit,
        ...(searchParams.search && { search: searchParams.search }),
        ...(searchParams.date && { date: formatDateForAPI(searchParams.date) }),
      };

      const response = await axiosInstance.get("/challans", { params });
      const result = response.data;

      if (!result.success) {
        throw new Error(result.message || "Failed to fetch challans");
      }

      // Format dates in the response data
      const formattedChallans = result.data.map(challan => ({
        ...challan,
        Date: formatDateForDisplay(challan.Date)
      }));

      setChallans(formattedChallans);
      if (result.pagination) {
        setPagination(result.pagination);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch challans");
      setChallans([]);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await axiosInstance.get("/suppliers");
      setSuppliers(response.data.data);
    } catch (err) {
      console.error("Failed to fetch suppliers:", err);
      toast.error(err.response?.data?.message || "Failed to fetch suppliers");
    }
  };

  const loadItems = async (inputValue) => {
    try {
      const response = await axiosInstance.get("/products", {
        params: { search: inputValue },
      });
      return response.data.data.map((item) => ({
        value: item.id,
        label: `${item.name} (${item.quantity} in stock)`,
        buying_price: item.buying_price || 0,
      }));
    } catch (err) {
      console.error("Failed to fetch items:", err);
      toast.error(err.response?.data?.message || "Failed to fetch items");
      return [];
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

  const showSupplierDetails = (supplier) => {
    setSelectedSupplier(supplier);
    setShowSupplierModal(true);
  };

  const handleItemSelect = (selectedOption) => {
    if (selectedOption) {
      setSelectedItems((prev) => [
        ...prev,
        {
          id: selectedOption.value,
          name: selectedOption.label,
          buying_price: selectedOption.buying_price,
          quantity: 1,
        },
      ]);
    }
  };

  const handleItemRemove = (index) => {
    setSelectedItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    setSelectedItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        // 4MB limit
        toast.error("File size should be less than 4MB");
        return;
      }
      if (
        ![
          "image/jpeg",
          "image/png",
          "image/jpg",
          "image/gif",
          "image/svg+xml",
        ].includes(file.type)
      ) {
        toast.error("Invalid file type. Please upload an image file");
        return;
      }
      setFormData((prev) => ({ ...prev, invoice: file }));
    }
  };

  const calculateTotal = () => {
    const itemsTotal = selectedItems.reduce(
      (sum, item) => sum + item.buying_price * item.quantity,
      0
    );
    return itemsTotal + (parseFloat(formData.delivery_price) || 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    setSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("Date", formData.Date);
      formDataToSend.append("supplier_id", formData.supplier_id);
      formDataToSend.append("delivery_price", formData.delivery_price);
      formDataToSend.append("user_id", localStorage.getItem("userId")); // Assuming userId is stored in localStorage
      formDataToSend.append("invoice", formData.invoice);

      selectedItems.forEach((item, index) => {
        formDataToSend.append(`item_id[${index}]`, item.id);
        formDataToSend.append(`buying[${index}]`, item.buying_price);
        formDataToSend.append(`quantity[${index}]`, item.quantity);
      });

      const response = await axiosInstance.post("/challans", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        toast.success("Challan created successfully");
        setShowAddModal(false);
        resetForm();
        fetchChallans(1);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to create challan";
      toast.error(errorMessage);
      if (error.response?.data?.errors) {
        Object.values(error.response.data.errors).forEach((err) => {
          toast.error(err[0]);
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      Date: new Date().toISOString().split("T")[0],
      supplier_id: "",
      delivery_price: "",
      invoice: null,
    });
    setSelectedItems([]);
  };

  const renderPagination = () => {
    const items = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(
      1,
      pagination.current_page - Math.floor(maxVisiblePages / 2)
    );
    let endPage = Math.min(
      pagination.total_pages,
      startPage + maxVisiblePages - 1
    );

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    items.push(
      <Pagination.Prev
        key="prev"
        onClick={() => handlePageChange(pagination.current_page - 1)}
        disabled={pagination.current_page === 1}
      >
        <FaChevronLeft size={12} />
      </Pagination.Prev>
    );

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
      if (endPage < pagination.total_pages - 1) {
        items.push(<Pagination.Ellipsis key="ellipsis2" disabled />);
      }
      items.push(
        <Pagination.Item
          key={pagination.total_pages}
          onClick={() => handlePageChange(pagination.total_pages)}
        >
          {pagination.total_pages}
        </Pagination.Item>
      );
    }

    items.push(
      <Pagination.Next
        key="next"
        onClick={() => handlePageChange(pagination.current_page + 1)}
        disabled={!pagination.has_more_pages}
      >
        <FaChevronRight size={12} />
      </Pagination.Next>
    );

    return items;
  };

  const clearDateFilter = () => {
    setSearchParams(prev => ({
      ...prev,
      date: null,
      page: 1
    }));
  };

  // Update the table row date display
  const renderDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  if (loading && challans.length === 0) {
    return <Loading />;
  }

  return (
    <div className="challen-container">
      <Card className="modern-card">
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="page-title mb-1">Challans</h2>
              <p className="text-muted mb-0">Manage and track all your challans</p>
            </div>
            <Button 
              variant="primary" 
              onClick={() => navigate('/challans/add')}
              className="create-challan-btn"
            >
              <FaPlus className="me-2" /> Add New Challan
            </Button>
          </div>

          <div className="filters-section mb-4">
            <Row className="g-3">
              <Col md={4}>
                <div className="search-box">
                  <InputGroup>
                    <InputGroup.Text className="search-icon">
                      {isSearching ? <FaSpinner className="spinner" /> : <FaSearch />}
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Search challans..."
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
                          fetchChallans(1);
                        }}
                      >
                        <FaTimes />
                      </Button>
                    )}
                  </InputGroup>
                </div>
              </Col>
              <Col md={4}>
                <div className="date-filter-box">
                  <InputGroup>
                    <InputGroup.Text>
                      <FaCalendarAlt />
                    </InputGroup.Text>
                    <Form.Control
                      type="date"
                      value={searchParams.date ? formatDateForAPI(searchParams.date) : ''}
                      onChange={handleDateChange}
                      className="date-input"
                      max={formatDateForAPI(new Date())}
                      placeholder="Select date"
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
                {searchParams.date && (
                  <Button
                    variant="outline-secondary"
                    onClick={clearDateFilter}
                    className="clear-dates-btn w-100"
                  >
                    <FaTimes className="me-2" /> Clear Date
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
                    <th>Supplier</th>
                    <th>Total product price</th>
                    <th>Delivery Price</th>
                    <th>Total</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {challans.map((challan) => (
                    <tr key={challan.id}>
                      <td className="fw-medium">#{challan.id}</td>
                      <td>{renderDate(challan.Date)}</td>
                      <td>
                        <button
                          className="btn btn-link p-0 text-primary supplier-link"
                          onClick={() => showSupplierDetails(challan.supplier)}
                        >
                          {challan.supplier.name}
                        </button>
                      </td>
                      <td>৳{parseFloat(challan.totalproductprice).toLocaleString()}</td>
                      <td>৳{parseFloat(challan.delivery_price).toLocaleString()}</td>
                      <td className="fw-medium">৳{parseFloat(challan.total).toLocaleString()}</td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="view-btn"
                          onClick={() => navigate(`/challans/${challan.id}`)}
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

          {pagination.total_pages > 1 && (
            <div className="pagination-container mt-4">
              <Pagination className="modern-pagination">
                {renderPagination()}
              </Pagination>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Supplier Details Modal */}
      <Modal
        show={showSupplierModal}
        onHide={() => setShowSupplierModal(false)}
        centered
        className="modern-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Supplier Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedSupplier && (
            <div className="supplier-details">
              <p>
                <strong>Name:</strong> {selectedSupplier.name}
              </p>
              <p>
                <strong>Phone:</strong> {selectedSupplier.phone}
              </p>
              <p>
                <strong>Address:</strong> {selectedSupplier.address}
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowSupplierModal(false)}
            className="close-btn"
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Challen;
