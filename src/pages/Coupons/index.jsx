import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaSpinner,
  FaTimes,
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
} from "react-bootstrap";
import "../Categories/Categories.css";

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
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
    total_rows: 0,
    current_page: 1,
    per_page: 10,
    total_pages: 1,
    has_more_pages: false,
  });
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, [searchParams.page, searchParams.limit]);

  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeoutId = setTimeout(() => {
      setIsSearching(true);
      fetchCoupons(1);
    }, 500);

    setSearchTimeout(timeoutId);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [searchParams.search]);

  const fetchCoupons = async (page = searchParams.page) => {
    setLoading(true);
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
            total_rows: result.pagination.total_rows,
            current_page: result.pagination.current_page,
            per_page: result.pagination.per_page,
            total_pages: result.pagination.total_pages,
            has_more_pages: result.pagination.has_more_pages,
          });
        } else {
          setPagination({
            total_rows: result.data.length,
            current_page: 1,
            per_page: result.data.length,
            total_pages: 1,
            has_more_pages: false,
          });
        }
      } else {
        throw new Error(result.message || "Failed to fetch coupons");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch coupons");
      setCoupons([]);
      setPagination({
        total_rows: 0,
        current_page: 1,
        per_page: searchParams.limit,
        total_pages: 1,
        has_more_pages: false,
      });
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  const handleAddCoupon = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post("/coupons", formData);
      if (response.data.success) {
        setCoupons([...coupons, response.data.data]);
        setShowModal(false);
        setFormData({ code: "", amount: "" });
        toast.success("Coupon added successfully");
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
        setCoupons(
          coupons.map((coupon) =>
            coupon.id === selectedCoupon.id ? response.data.data : coupon
          )
        );
        setShowModal(false);
        setFormData({ code: "", amount: "" });
        setSelectedCoupon(null);
        toast.success("Coupon updated successfully");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update coupon");
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (window.confirm("Are you sure you want to delete this coupon?")) {
      try {
        const response = await axiosInstance.delete(`/coupons/${id}`);
        if (response.data.success) {
          setCoupons(coupons.filter((coupon) => coupon.id !== id));
          toast.success("Coupon deleted successfully");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete coupon");
      }
    }
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

  const renderPagination = () => {
    const items = [];
    const maxPages = 5;
    let startPage = Math.max(
      1,
      pagination.current_page - Math.floor(maxPages / 2)
    );
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

  if (loading && !isSearching) {
    return (
      <div className="loading-container">
        <div className="loading-text">Zantech</div>
      </div>
    );
  }

  return (
    <div className="categories-container">
      <Card>
        <Card.Body>
          <div className="categories-header">
            <h2>Coupons</h2>
            <button className="btn btn-primary" onClick={openAddModal}>
              <FaPlus /> Add Coupon
            </button>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex gap-3 align-items-center">
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
                  placeholder="Search by coupon code..."
                  value={searchParams.search}
                  onChange={handleSearch}
                />
                {searchParams.search && (
                  <Button
                    variant="outline-secondary"
                    onClick={() => {
                      setSearchParams((prev) => ({
                        ...prev,
                        search: "",
                        page: 1,
                      }));
                      fetchCoupons(1);
                    }}
                  >
                    <FaTimes />
                  </Button>
                )}
              </InputGroup>
            </div>
            <div>
              <Form.Select
                value={searchParams.limit}
                onChange={handleLimitChange}
                style={{ width: "auto" }}
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
                  <th>Code</th>
                  <th>Amount</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon.id}>
                    <td>{coupon.id}</td>
                    <td>{coupon.code}</td>
                    <td>৳{parseFloat(coupon.amount).toLocaleString()}</td>
                    <td>{new Date(coupon.created_at).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-info me-2"
                        onClick={() => openEditModal(coupon)}
                        title="Edit Coupon"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteCoupon(coupon.id)}
                        title="Delete Coupon"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {coupons.length === 0 && !loading && (
              <div className="text-center py-4">
                <p className="text-muted mb-0">No coupons found</p>
              </div>
            )}
          </div>

          {pagination.total_pages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination className="mb-0">{renderPagination()}</Pagination>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Add/Edit Coupon Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{modalMode === "add" ? "Add New Coupon" : "Edit Coupon"}</h3>
              <button className="btn-close" onClick={closeModal} />
            </div>
            <form
              onSubmit={
                modalMode === "add" ? handleAddCoupon : handleEditCoupon
              }
            >
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Code</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Amount</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    required
                    min="0"
                    step="0.01"
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
                  {modalMode === "add" ? "Add Coupon" : "Update Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Coupons;
