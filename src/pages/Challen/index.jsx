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
import "../Categories/Categories.css";

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
    date: "",
    start_date: "",
    end_date: "",
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
      if (searchParams.search !== "" || searchParams.date !== "" || searchParams.start_date !== "" || searchParams.end_date !== "") {
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
  }, [searchParams.search, searchParams.date, searchParams.start_date, searchParams.end_date]);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchChallans = async (page = searchParams.page) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: searchParams.limit,
        ...(searchParams.search && { search: searchParams.search }),
        ...(searchParams.date && { date: searchParams.date }),
        ...(searchParams.start_date && { start_date: searchParams.start_date }),
        ...(searchParams.end_date && { end_date: searchParams.end_date }),
      };

      const response = await axiosInstance.get("/challans", { params });
      const result = response.data;

      if (!result.success) {
        throw new Error(result.message || "Failed to fetch challans");
      }

      setChallans(result.data);
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

  const handleDateFilter = (type, value) => {
    if (type === 'date') {
      setSearchParams((prev) => ({
        ...prev,
        date: value,
        start_date: "",
        end_date: "",
        page: 1,
      }));
    } else {
      setSearchParams((prev) => ({
        ...prev,
        date: "",
        [type]: value,
        page: 1,
      }));
    }
  };

  const clearDateFilters = () => {
    setSearchParams((prev) => ({
      ...prev,
      date: "",
      start_date: "",
      end_date: "",
      page: 1,
    }));
  };

  if (loading && challans.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-text">Zantech</div>
      </div>
    );
  }

  return (
    <div className="categories-container">
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h4 className="mb-1">Challans</h4>
              <p className="text-muted mb-0">
                Showing {challans.length} of {pagination.total_rows} challans
              </p>
            </div>
            <div className="d-flex gap-3 align-items-center">
              <div className="d-flex flex-column align-items-start">
                <small className="text-muted mb-1">Single Date</small>
                <Form.Control
                  type="date"
                  value={searchParams.date}
                  onChange={(e) => handleDateFilter("date", e.target.value)}
                  style={{ width: "150px" }}
                />
              </div>
              <div className="d-flex flex-column align-items-start">
                <small className="text-muted mb-1">Date Range</small>
                <div className="d-flex gap-2">
                  <Form.Control
                    type="date"
                    value={searchParams.start_date}
                    onChange={(e) => handleDateFilter("start_date", e.target.value)}
                    placeholder="Start Date"
                    style={{ width: "150px" }}
                  />
                  <Form.Control
                    type="date"
                    value={searchParams.end_date}
                    onChange={(e) => handleDateFilter("end_date", e.target.value)}
                    placeholder="End Date"
                    style={{ width: "150px" }}
                  />
                </div>
              </div>
              {(searchParams.date || searchParams.start_date || searchParams.end_date) && (
                <Button
                  variant="outline-secondary"
                  onClick={clearDateFilters}
                  className="d-flex align-items-center gap-1"
                  style={{ marginTop: '22px' }}
                >
                  <FaTimes /> Clear
                </Button>
              )}
              <Button
                variant="primary"
                onClick={() => navigate("/challans/add")}
                className="d-flex align-items-center gap-2"
              >
                <FaPlus /> Add New Challan
              </Button>
              <InputGroup style={{ width: "300px" }}>
                <InputGroup.Text>
                  {isSearching ? (
                    <FaSpinner className="spinner-border spinner-border-sm" />
                  ) : (
                    <FaSearch />
                  )}
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search challans..."
                  value={searchParams.search}
                  onChange={handleSearch}
                  disabled={loading}
                />
                {searchParams.search && !isSearching && (
                  <Button
                    variant="outline-secondary"
                    onClick={() => {
                      setSearchParams((prev) => ({ ...prev, search: "" }));
                      fetchChallans(1);
                    }}
                    disabled={loading}
                  >
                    ×
                  </Button>
                )}
              </InputGroup>
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

          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="bg-light">
                <tr>
                  <th>ID</th>
                  <th>Date</th>
                  <th>Supplier</th>
                  <th>Total</th>
                  <th>Delivery Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {challans.map((challan) => (
                  <tr key={challan.id}>
                    <td>{challan.id}</td>
                    <td>{new Date(challan.Date).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="btn btn-link p-0 text-primary"
                        onClick={() => showSupplierDetails(challan.supplier)}
                      >
                        {challan.supplier.name}
                      </button>
                    </td>
                    <td>৳{parseFloat(challan.total).toLocaleString()}</td>
                    <td>
                      ৳{parseFloat(challan.delivery_price).toLocaleString()}
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="d-flex align-items-center gap-1"
                        onClick={() => navigate(`/challans/${challan.id}`)}
                      >
                        <FaEye /> View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.total_pages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination className="mb-0">{renderPagination()}</Pagination>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Supplier Details Modal */}
      <Modal
        show={showSupplierModal}
        onHide={() => setShowSupplierModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Supplier Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedSupplier && (
            <div>
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
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Challen;
