import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaSpinner, FaFilter } from "react-icons/fa";
import { toast } from "react-hot-toast";
import axiosInstance from "../../config/axios";
import { Card, Form, Button, Modal, Pagination, Badge } from "react-bootstrap";
import Select from "react-select/async";
import "../Categories/Categories.css";

const Ratings = () => {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    star: "",
    reating: "",
    product_id: "",
  });
  const [searchParams, setSearchParams] = useState({
    page: 1,
    limit: 10,
    status: "",
    star: "",
  });
  const [pagination, setPagination] = useState({
    total_rows: 0,
    current_page: 1,
    per_page: 10,
    total_pages: 1,
    has_more_pages: false,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusToggleLoading, setStatusToggleLoading] = useState({});

  useEffect(() => {
    fetchRatings();
  }, [searchParams.page, searchParams.limit, searchParams.status, searchParams.star]);

  const fetchRatings = async (page = searchParams.page) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: searchParams.limit,
        ...(searchParams.status && { status: searchParams.status }),
        ...(searchParams.star && { star: searchParams.star }),
      };

      const response = await axiosInstance.get("/ratings", { params });
      if (response.data.success) {
        setRatings(response.data.data);
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      } else {
        throw new Error(response.data.message || "Failed to fetch ratings");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch ratings");
      setRatings([]);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async (inputValue) => {
    try {
      const response = await axiosInstance.get("/products", {
        params: { search: inputValue },
      });
      return response.data.data.map((product) => ({
        value: product.id,
        label: `${product.name} (৳${product.price})`,
        image: product.images?.[0]?.path ? `http://127.0.0.1:8000/storage/${product.images[0].path.replace('public/', '')}` : null,
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch products");
      return [];
    }
  };

  const handleAddRating = async (e) => {
    e.preventDefault();
    if (!formData.product_id || !formData.star) {
      toast.error("Please select a product and rating");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await axiosInstance.post("/ratings", formData);
      if (response.data.success) {
        // First close the modal and reset form
        setShowModal(false);
        setFormData({ star: "", reating: "", product_id: "" });
        
        // Then update the ratings list
        await fetchRatings(1);
        toast.success("Rating added successfully");
      } else {
        throw new Error(response.data.message || "Failed to add rating");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add rating");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (id) => {
    setStatusToggleLoading((prev) => ({ ...prev, [id]: true }));
    try {
      const response = await axiosInstance.post(`/ratings/toggle-status/${id}`);
      if (response.data.success) {
        setRatings((prevRatings) =>
          prevRatings.map((rating) =>
            rating.id === id ? { ...rating, status: response.data.data.status } : rating
          )
        );
        toast.success("Rating status updated successfully");
      } else {
        throw new Error(response.data.message || "Failed to update rating status");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update rating status");
    } finally {
      setStatusToggleLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({
      ...prev,
      [name]: value,
      page: 1,
    }));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setShowFilters(false);
    fetchRatings(1);
  };

  const handleResetFilters = () => {
    setSearchParams({
      page: 1,
      limit: 10,
      status: "",
      star: "",
    });
    setShowFilters(false);
    fetchRatings(1);
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
        />
      );
      items.push(
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
        />
      );
      items.push(
        <Pagination.Last
          key="last"
          onClick={() => handlePageChange(pagination.total_pages)}
          disabled={pagination.current_page === pagination.total_pages}
        />
      );
    }

    return items;
  };

  const handlePageChange = (page) => {
    setSearchParams((prev) => ({
      ...prev,
      page,
    }));
  };

  if (loading && ratings.length === 0) {
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
            <h2 className="mb-0">Ratings</h2>
            <div className="d-flex gap-2">
              <Button
                variant="outline-secondary"
                onClick={() => setShowFilters(true)}
                title="Filter"
                disabled={loading}
              >
                <FaFilter />
              </Button>
              <button
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={() => {
                  setFormData({ star: "", reating: "", product_id: "" });
                  setShowModal(true);
                }}
                disabled={loading}
              >
                <FaPlus /> Add Rating
              </button>
            </div>
          </div>

          {/* Filter Modal */}
          <Modal show={showFilters} onHide={() => !loading && setShowFilters(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Filter Ratings</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleFilterSubmit}>
              <Modal.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={searchParams.status}
                    onChange={handleFilterChange}
                    disabled={loading}
                  >
                    <option value="">All Status</option>
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Star Rating</Form.Label>
                  <Form.Select
                    name="star"
                    value={searchParams.star}
                    onChange={handleFilterChange}
                    disabled={loading}
                  >
                    <option value="">All Stars</option>
                    <option value="1">1 Star</option>
                    <option value="2">2 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="5">5 Stars</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Items per page</Form.Label>
                  <Form.Select
                    name="limit"
                    value={searchParams.limit}
                    onChange={handleFilterChange}
                    disabled={loading}
                  >
                    <option value="5">5 per page</option>
                    <option value="10">10 per page</option>
                    <option value="20">20 per page</option>
                    <option value="50">50 per page</option>
                  </Form.Select>
                </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleResetFilters} disabled={loading}>
                  Reset Filters
                </Button>
                <Button variant="primary" type="submit" disabled={loading}>
                  Apply Filters
                </Button>
              </Modal.Footer>
            </Form>
          </Modal>

          {/* Add Rating Modal */}
          <Modal 
            show={showModal} 
            onHide={() => {
              if (!isSubmitting) {
                setShowModal(false);
                setFormData({ star: "", reating: "", product_id: "" });
              }
            }}
            backdrop={isSubmitting ? "static" : true}
            keyboard={!isSubmitting}
          >
            <Modal.Header closeButton={!isSubmitting}>
              <Modal.Title>Add New Rating</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleAddRating}>
              <Modal.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Product <span className="text-danger">*</span></Form.Label>
                  <Select
                    cacheOptions
                    defaultOptions
                    loadOptions={loadProducts}
                    onChange={(selected) =>
                      setFormData((prev) => ({
                        ...prev,
                        product_id: selected?.value || "",
                      }))
                    }
                    value={formData.product_id ? {
                      value: formData.product_id,
                      label: ratings.find(r => r.product.id === formData.product_id)?.product.name || "Selected Product"
                    } : null}
                    placeholder="Search and select a product..."
                    noOptionsMessage={() => "No products found"}
                    loadingMessage={() => "Loading products..."}
                    isDisabled={isSubmitting}
                    formatOptionLabel={(option) => (
                      <div className="d-flex align-items-center gap-2">
                        {option.image && (
                          <img
                            src={option.image}
                            alt={option.label}
                            style={{ width: "30px", height: "30px", objectFit: "cover" }}
                          />
                        )}
                        <span>{option.label}</span>
                      </div>
                    )}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Star Rating <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    value={formData.star}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        star: e.target.value,
                      }))
                    }
                    required
                    disabled={isSubmitting}
                  >
                    <option value="">Select Rating</option>
                    <option value="1">1 Star</option>
                    <option value="2">2 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="5">5 Stars</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Review</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={formData.reating}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        reating: e.target.value,
                      }))
                    }
                    placeholder="Write your review..."
                    disabled={isSubmitting}
                  />
                </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button 
                  variant="secondary" 
                  onClick={() => {
                    setShowModal(false);
                    setFormData({ star: "", reating: "", product_id: "" });
                  }} 
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="spinner-border spinner-border-sm me-2" />
                      Adding...
                    </>
                  ) : (
                    "Add Rating"
                  )}
                </Button>
              </Modal.Footer>
            </Form>
          </Modal>

          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="bg-light">
                <tr>
                  <th>ID</th>
                  <th>Product</th>
                  <th>User</th>
                  <th>Rating</th>
                  <th>Review</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {ratings.map((rating) => (
                  <tr key={rating.id}>
                    <td>{rating.id}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        {rating.product.image && (
                          <img
                            src={rating.product.image}
                            alt={rating.product.name}
                            style={{ width: "40px", height: "40px", objectFit: "cover" }}
                          />
                        )}
                        <span>{rating.product.name}</span>
                      </div>
                    </td>
                    <td>
                      <div>
                        <div>{rating.user.name}</div>
                        <small className="text-muted">{rating.user.email}</small>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-1">
                        {[...Array(5)].map((_, index) => (
                          <span
                            key={index}
                            style={{
                              color: index < rating.star ? "#ffc107" : "#e4e5e9",
                            }}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>{rating.reating || "No review"}</td>
                    <td>
                      <Badge
                        bg={rating.status === "1" ? "success" : "danger"}
                        className="cursor-pointer"
                        onClick={() => handleToggleStatus(rating.id)}
                        style={{ cursor: "pointer" }}
                      >
                        {statusToggleLoading[rating.id] ? (
                          <FaSpinner className="spinner-border spinner-border-sm" />
                        ) : rating.status === "1" ? (
                          "Active"
                        ) : (
                          "Inactive"
                        )}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="d-flex align-items-center gap-1"
                        onClick={() => handleToggleStatus(rating.id)}
                        disabled={statusToggleLoading[rating.id]}
                      >
                        {statusToggleLoading[rating.id] ? (
                          <FaSpinner className="spinner-border spinner-border-sm" />
                        ) : (
                          <>
                            {rating.status === "1" ? (
                              <>
                                <FaTrash /> Deactivate
                              </>
                            ) : (
                              <>
                                <FaEdit /> Activate
                              </>
                            )}
                          </>
                        )}
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
    </div>
  );
};

export default Ratings; 