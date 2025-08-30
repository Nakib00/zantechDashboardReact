import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaSpinner,
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
  Badge,
} from "react-bootstrap";
import "./Coupons.css";
import Loading from "../../components/Loading";
import usePageTitle from '../../hooks/usePageTitle';
import CommonTable from "../../components/Common/CommonTable";

const Coupons = () => {
  usePageTitle('Manage Coupons');
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    amount: "",
    type: "percent",
    is_global: 1,
    max_usage: "",
    max_usage_per_user: "",
    start_date: "",
    end_date: "",
    status: 1,
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

    if (pageLoading) {
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
        setFormData({ code: "", amount: "", type: "percent", is_global: 1, max_usage: "", max_usage_per_user: "", start_date: "", end_date: "", status: 1 });
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
        setFormData({ code: "", amount: "", type: "percent", is_global: 1, max_usage: "", max_usage_per_user: "", start_date: "", end_date: "", status: 1 });
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
      type: coupon.type,
      is_global: coupon.is_global,
      max_usage: coupon.max_usage,
      max_usage_per_user: coupon.max_usage_per_user,
      start_date: coupon.start_date,
      end_date: coupon.end_date,
      status: coupon.status,
    });
    setShowModal(true);
  };

  const openAddModal = () => {
    setModalMode("add");
    setSelectedCoupon(null);
    setFormData({ code: "", amount: "", type: "percent", is_global: 1, max_usage: "", max_usage_per_user: "", start_date: "", end_date: "", status: 1 });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({ code: "", amount: "", type: "percent", is_global: 1, max_usage: "", max_usage_per_user: "", start_date: "", end_date: "", status: 1 });
    setSelectedCoupon(null);
  };

  const openViewModal = (coupon) => {
    setSelectedCoupon(coupon);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedCoupon(null);
  }

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

  const headers = [
    { key: 'id', label: 'ID' },
    { key: 'code', label: 'Code' },
    { key: 'amount', label: 'Amount', render: (row) => `৳${parseFloat(row.amount).toLocaleString()}` },
    { key: 'type', label: 'Type' },
    { key: 'is_global', label: 'Global', render: (row) => (row.is_global ? 'True' : 'False') },
    { key: 'start_date', label: 'Start Date' },
    { key: 'end_date', label: 'End Date' },
    { key: 'status', label: 'Status', render: (row) => (row.status ? <Badge bg="success">Active</Badge> : <Badge bg="danger">Inactive</Badge>) },
  ];

  const renderActions = (coupon) => (
    <div className="d-flex gap-2">
      <Button
        variant="outline-info"
        size="sm"
        onClick={() => openViewModal(coupon)}
        title="View"
        className="view-btn"
      >
        <FaEye />
      </Button>
      <Button
        variant="outline-primary"
        size="sm"
        onClick={() => openEditModal(coupon)}
        disabled={tableLoading}
        title="Edit"
        className="view-btn"
      >
        <FaEdit />
      </Button>
      <Button
        variant="outline-danger"
        size="sm"
        onClick={() => handleDeleteCoupon(coupon.id)}
        disabled={tableLoading}
        title="Delete"
        className="delete-btn"
      >
        <FaTrash />
      </Button>
    </div>
  );

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

          <CommonTable
            headers={headers}
            data={coupons}
            tableLoading={tableLoading}
            loading={loading}
            renderActions={renderActions}
          />

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
                  <Form.Control type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Amount</Form.Label>
                  <Form.Control type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required min="0" step="0.01" />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Type</Form.Label>
                  <Form.Select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                    <option value="percent">Percent</option>
                    <option value="fixed">Fixed</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Check type="checkbox" label="Is Global" checked={formData.is_global} onChange={(e) => setFormData({ ...formData, is_global: e.target.checked })} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Max Usage</Form.Label>
                  <Form.Control type="number" value={formData.max_usage} onChange={(e) => setFormData({ ...formData, max_usage: e.target.value })} min="0" />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Max Usage Per User</Form.Label>
                  <Form.Control type="number" value={formData.max_usage_per_user} onChange={(e) => setFormData({ ...formData, max_usage_per_user: e.target.value })} min="0" />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>End Date</Form.Label>
                  <Form.Control type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Check type="switch" label="Active" checked={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.checked })} />
                </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={closeModal}>Cancel</Button>
                <Button type="submit" variant="primary">{modalMode === "add" ? "Add Coupon" : "Update Coupon"}</Button>
              </Modal.Footer>
            </Form>
          </Modal>

          <Modal show={showViewModal} onHide={closeViewModal} centered size="lg">
            <Modal.Header closeButton>
              <Modal.Title>Coupon Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {selectedCoupon && (
                <div>
                  <Row>
                    <Col><strong>ID:</strong> {selectedCoupon.id}</Col>
                    <Col><strong>Code:</strong> {selectedCoupon.code}</Col>
                  </Row>
                  <hr />
                  <Row>
                    <Col><strong>Amount:</strong> ৳{parseFloat(selectedCoupon.amount).toLocaleString()}</Col>
                    <Col><strong>Type:</strong> {selectedCoupon.type}</Col>
                  </Row>
                  <hr />
                  <Row>
                    <Col><strong>Global:</strong> {selectedCoupon.is_global ? 'True' : 'False'}</Col>
                    <Col><strong>Status:</strong> {selectedCoupon.status ? <Badge bg="success">Active</Badge> : <Badge bg="danger">Inactive</Badge>}</Col>
                  </Row>
                  <hr />
                  <Row>
                    <Col><strong>Max Usage:</strong> {selectedCoupon.max_usage}</Col>
                    <Col><strong>Max Usage/User:</strong> {selectedCoupon.max_usage_per_user}</Col>
                  </Row>
                  <hr />
                  <Row>
                    <Col><strong>Start Date:</strong> {selectedCoupon.start_date}</Col>
                    <Col><strong>End Date:</strong> {selectedCoupon.end_date}</Col>
                  </Row>
                  <hr />
                  <h5>Associated Items</h5>
                  {selectedCoupon.items && selectedCoupon.items.length > 0 ? (
                    <ListGroup>
                      {selectedCoupon.items.map(item => (
                        <ListGroup.Item key={item.id}>{item.name}</ListGroup.Item>
                      ))}
                    </ListGroup>
                  ) : (
                    <p>No items associated with this coupon.</p>
                  )}
                </div>
              )}
            </Modal.Body>
          </Modal>

        </Card.Body>
      </Card>
    </div>
  );
};

export default Coupons;