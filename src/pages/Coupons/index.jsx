import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaSpinner,
  FaTimes,
  FaChevronLeft,
  FaChevronRight
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
  Col
} from "react-bootstrap";
import "./Coupons.css";
import Loading from "../../components/Loading";

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    amount: "",
  });
  const [searchParams, setSearchParams] = useState({
    search: "",
    page: 1,
    limit: 10,
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

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await fetchCoupons();
      } finally {
        setPageLoading(false);
      }
    };
    
    if(pageLoading) {
        loadInitialData();
    } else {
        fetchCoupons();
    }
  }, [searchParams.page, searchParams.limit]);

  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeoutId = setTimeout(() => {
      if (searchParams.search !== "") {
        setIsSearching(true);
        fetchCoupons(1);
      } else if (searchParams.search === "" && !pageLoading) {
         fetchCoupons(1);
      }
    }, 500);

    setSearchTimeout(timeoutId);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [searchParams.search]);

  const fetchCoupons = async (page = pagination.current_page) => {
    setLoading(true);
    setTableLoading(true);
    try {
      const params = {
        page,
        limit: searchParams.limit,
        ...(searchParams.search && { search: searchParams.search }),
      };

      const response = await axiosInstance.get("/coupons", { params });
      const result = response.data;

      if (result.success) {
        setCoupons(result.data);
        if (result.pagination) {
          setPagination({
            total: result.pagination.total,
            current_page: result.pagination.current_page,
            per_page: result.pagination.per_page,
            last_page: result.pagination.last_page,
            from: result.pagination.from || 0,
            to: result.pagination.to || 0,
          });
        } else {
             setPagination(prev => ({
                ...prev,
                current_page: page,
                total: result.data.length,
                last_page: page,
                from: ((page - 1) * searchParams.limit) + 1,
                to: ((page - 1) * searchParams.limit) + result.data.length,
             }));
        }
      } else {
        throw new Error(result.message || "Failed to fetch coupons");
      }
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.error("Error fetching coupons:", error);
      toast.error(error.response?.data?.message || "Failed to fetch coupons");
       setCoupons([]);
        setPagination(prev => ({
            ...prev,
            current_page: page,
            total: 0,
            last_page: 1,
            from: 0,
            to: 0,
        }));
    } finally {
      setLoading(false);
      setTableLoading(false);
      setIsSearching(false);
    }
  };

  const handleAddCoupon = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post("/coupons", formData);
      if (response.data.success) {
        fetchCoupons(pagination.current_page);
        setShowModal(false);
        setFormData({ code: "", amount: "" });
        toast.success("Coupon added successfully");
      } else {
           throw new Error(response.data.message || "Failed to add coupon");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add coupon");
    }
  };

  const handleEditCoupon = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.put(
        `/coupons/${selectedCoupon.id}`,
        formData
      );
      if (response.data.success) {
        fetchCoupons(pagination.current_page);
        setShowModal(false);
        setFormData({ code: "", amount: "" });
        setSelectedCoupon(null);
        toast.success("Coupon updated successfully");
      } else {
           throw new Error(response.data.message || "Failed to update coupon");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update coupon");
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (window.confirm("Are you sure you want to delete this coupon?")) {
      try {
        setTableLoading(true);
        const response = await axiosInstance.delete(`/coupons/${id}`);
        if (response.data.success) {
          toast.success("Coupon deleted successfully");
           fetchCoupons(coupons.length === 1 && pagination.current_page > 1 ? pagination.current_page - 1 : pagination.current_page);
        } else {
             throw new Error(response.data.message || "Failed to delete coupon");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete coupon");
      } finally {
        setTableLoading(false);
      }
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

  const openEditModal = (coupon) => {
    setModalMode("edit");
    setSelectedCoupon(coupon);
    setFormData({
      code: coupon.code,
      amount: coupon.amount,
    });
    setShowModal(true);
  };

  const openAddModal = () => {
    setModalMode("add");
    setSelectedCoupon(null);
    setFormData({ code: "", amount: "" });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({ code: "", amount: "" });
    setSelectedCoupon(null);
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

    items.push(
      <Pagination.Prev
        key="prev"
        onClick={() => handlePageChange(pagination.current_page - 1)}
        disabled={pagination.current_page === 1}
      />
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

    items.push(
      <Pagination.Next
        key="next"
        onClick={() => handlePageChange(pagination.current_page + 1)}
        disabled={pagination.current_page === pagination.last_page}
      />
    );

    return items;
  };

  if (pageLoading) {
    return <Loading />;
  }

  return (
    <div className="coupons-container">
      <Card className="modern-card">
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="page-title mb-1">Coupons</h2>
                {loading && tableLoading ? (
                <div className="d-flex align-items-center">
                  <FaSpinner className="spinner-border spinner-border-sm me-2" />
                  <p className="page-subtitle mb-0">Loading coupons...</p>
                </div>
              ) : (
                <p className="page-subtitle mb-0">
                  Showing {coupons.length} of {pagination.total} coupons
                </p>
              )}
            </div>
            <Button 
              variant="primary" 
              onClick={openAddModal}
              className="create-coupon-btn"
            >
              <FaPlus className="me-2" /> Add Coupon
            </Button>
          </div>

          <div className="filters-section mb-4">
            <Row className="g-3 align-items-center">
              <Col md={4}>
                <Form onSubmit={(e) => e.preventDefault()}>
                  <InputGroup className="search-box">
                    <InputGroup.Text className="search-icon">
                      {isSearching ? (
                        <FaSpinner className="spinner-border spinner-border-sm" />
                      ) : (
                        <FaSearch />
                      )}
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Search coupons..."
                      name="search"
                      value={searchParams.search}
                      onChange={handleSearch}
                      disabled={loading}
                      className={`search-input ${isSearching ? 'searching' : ''}`}
                    />
                    {searchParams.search && !isSearching && (
                      <Button
                        variant="link"
                        className="clear-search"
                        onClick={() => {
                          setSearchParams(prev => ({ ...prev, search: "" }));
                        }}
                        disabled={loading}
                      >
                        <FaTimes />
                      </Button>
                    )}
                  </InputGroup>
                </Form>
              </Col>
               <Col md={8} className="d-flex justify-content-end gap-2">
                 <Form.Select
                    name="limit"
                    value={searchParams.limit}
                    onChange={handleLimitChange}
                    disabled={loading}
                    style={{ width: "auto" }}
                    className="limit-select"
                  >
                    <option value="5">5 per page</option>
                    <option value="10">10 per page</option>
                    <option value="20">20 per page</option>
                    <option value="50">50 per page</option>
                  </Form.Select>
               </Col>
            </Row>
          </div>

          <div className="table-container position-relative">
             {tableLoading && (
              <div 
                className="position-absolute w-100 h-100 d-flex justify-content-center align-items-center"
                style={{
                  top: 0,
                  left: 0,
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  zIndex: 1000,
                  backdropFilter: 'blur(2px)'
                }}
              >
                <div className="text-center">
                  <Loading />
                  <p className="text-muted mt-2 mb-0">
                    {loading ? 'Loading coupons...' : 'Updating...'}
                  </p>
                </div>
              </div>
            )}

            {loading && !tableLoading && coupons.length === 0 ? (
              <div className="text-center py-5">
                <Loading />
                <p className="text-muted mt-3 mb-0">Loading coupons...</p>
              </div>
            ) : coupons.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-hover align-middle modern-table">
                  <thead className="bg-light">
                    <tr>
                      <th>ID</th>
                      <th>Code</th>
                      <th>Amount</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((coupon) => (
                      <tr key={coupon.id}>
                        <td data-label="ID">{coupon.id}</td>
                        <td data-label="Code">{coupon.code}</td>
                        <td data-label="Amount">৳{parseFloat(coupon.amount).toLocaleString()}</td>
                        <td data-label="Actions" className="action-buttons">
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => openEditModal(coupon)}
                            disabled={tableLoading}
                          >
                            <FaEdit /> Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteCoupon(coupon.id)}
                            disabled={tableLoading}
                          >
                            <FaTrash /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
             ) : (
              <div className="text-center py-5">
                <p className="text-muted mb-0">No coupons found</p>
              </div>
            )}
          </div>

           {pagination.last_page > 1 && (
            <div className="pagination-container mt-4 position-relative">
              {tableLoading && (
                <div 
                  className="position-absolute w-100 h-100 d-flex justify-content-center align-items-center"
                  style={{
                    top: 0,
                    left: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    zIndex: 1000,
                    backdropFilter: 'blur(2px)'
                  }}
                >
                  <div className="text-center">
                    <Loading />
                    <p className="text-muted mt-2 mb-0">Changing page...</p>
                  </div>
                </div>
              )}
              <Pagination className="mb-0 modern-pagination">
                {renderPagination()}
              </Pagination>
            </div>
          )}

          <Modal show={showModal} onHide={closeModal} centered>
            <Modal.Header closeButton>
              <Modal.Title>
                {modalMode === "add" ? "Add New Coupon" : "Edit Coupon"}
              </Modal.Title>
            </Modal.Header>
            <Form
              onSubmit={
                modalMode === "add" ? handleAddCoupon : handleEditCoupon
              }
            >
              <Modal.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Code</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Amount</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    required
                    min="0"
                    step="0.01"
                  />
                </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={closeModal}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  {modalMode === "add" ? "Add Coupon" : "Update Coupon"}
                </Button>
              </Modal.Footer>
            </Form>
          </Modal>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Coupons;
