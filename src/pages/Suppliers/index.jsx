import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaSearch, FaSpinner, FaTimes, FaSave } from "react-icons/fa";
import { toast } from "react-hot-toast";
import axiosInstance from "../../config/axios";
import { Card, Form, InputGroup, Button, Table, Row, Col, Modal } from "react-bootstrap";
import Loading from "../../components/Loading";
import "./Suppliers.css";
import usePageTitle from '../../hooks/usePageTitle';

const Suppliers = () => {
    usePageTitle('Manage Suppliers');
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState("add");
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [searchParams, setSearchParams] = useState({
        search: "",
    });
    const [isSearching, setIsSearching] = useState(false);
    const [searchTimeout, setSearchTimeout] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        phone2: "",
        address: "",
    });
    const [editingPaidAmount, setEditingPaidAmount] = useState(null);
    const [paidAmountInput, setPaidAmountInput] = useState("");
    const [updateLoading, setUpdateLoading] = useState(false);

    useEffect(() => {
        fetchSuppliers();
    }, []);

    useEffect(() => {
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        const timeoutId = setTimeout(() => {
            if (searchParams.search !== "") {
                setIsSearching(true);
                fetchSuppliers();
            }
        }, 500);

        setSearchTimeout(timeoutId);

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [searchParams.search]);

    const fetchSuppliers = async () => {
        try {
            const response = await axiosInstance.get("/suppliers", {
                params: {
                    search: searchParams.search,
                },
            });
            setSuppliers(response.data.data);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch suppliers");
        } finally {
            setLoading(false);
            setIsSearching(false);
        }
    };

    const handleSearch = (e) => {
        setSearchParams((prev) => ({ ...prev, search: e.target.value }));
    };

    const handleAddSupplier = async (e) => {
        e.preventDefault();
        try {
            const response = await axiosInstance.post("/suppliers", formData);
            setSuppliers([...suppliers, response.data.data]);
            setShowModal(false);
            setFormData({ name: "", phone: "", phone2: "", address: "" });
            toast.success("Supplier added successfully");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add supplier");
        }
    };

    const handleEditSupplier = async (e) => {
        e.preventDefault();
        try {
            const response = await axiosInstance.put(
                `/suppliers/${selectedSupplier.id}`,
                formData
            );
            setSuppliers(
                suppliers.map((sup) =>
                    sup.id === selectedSupplier.id ? response.data.data : sup
                )
            );
            setShowModal(false);
            setFormData({ name: "", phone: "", phone2: "", address: "" });
            setSelectedSupplier(null);
            toast.success("Supplier updated successfully");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update supplier");
        }
    };

    const handleDeleteSupplier = async (id) => {
        if (window.confirm("Are you sure you want to delete this supplier?")) {
            try {
                await axiosInstance.delete(`/suppliers/${id}`);
                setSuppliers(suppliers.filter((sup) => sup.id !== id));
                toast.success("Supplier deleted successfully");
            } catch (error) {
                toast.error(
                    error.response?.data?.message || "Failed to delete supplier"
                );
            }
        }
    };

    const handleUpdatePaidAmount = async (supplierId) => {
        setUpdateLoading(true);
        try {
            const response = await axiosInstance.put(`/suppliers/update-paid-amount/${supplierId}`, {
                paid_amount: paidAmountInput,
            });

            if (response.data.success) {
                toast.success("Paid amount updated successfully");
                setEditingPaidAmount(null);
                fetchSuppliers();
            } else {
                toast.error("Failed to update paid amount");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "An error occurred");
        } finally {
            setUpdateLoading(false);
        }
    };

    const openEditModal = (supplier) => {
        setModalMode("edit");
        setSelectedSupplier(supplier);
        setFormData({
            name: supplier.name,
            phone: supplier.phone,
            phone2: supplier.phone2 || "",
            address: supplier.address,
        });
        setShowModal(true);
    };

    const openAddModal = () => {
        setModalMode("add");
        setSelectedSupplier(null);
        setFormData({ name: "", phone: "", phone2: "", address: "" });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setFormData({ name: "", phone: "", phone2: "", address: "" });
        setSelectedSupplier(null);
    };

    if (loading && !suppliers.length) {
        return <Loading />;
    }

    return (
        <div className="orders-container">
            <Card className="modern-card">
                <Card.Body className="p-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <h2 className="page-title mb-1">Suppliers</h2>
                            <p className="text-muted mb-0">Manage your suppliers and their information</p>
                        </div>
                        <Button
                            variant="primary"
                            onClick={openAddModal}
                            className="create-order-btn"
                        >
                            <FaPlus className="me-2" /> Add Supplier
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
                                            placeholder="Search suppliers..."
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
                                                    fetchSuppliers();
                                                }}
                                            >
                                                <FaTimes />
                                            </Button>
                                        )}
                                    </InputGroup>
                                </div>
                            </Col>
                        </Row>
                    </div>

                    <div className="table-container">
                        <div className="table-responsive">
                            <table className="table table-hover modern-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Phone</th>
                                        <th>Address</th>
                                        <th>Total Amount</th>
                                        <th>Paid Amount</th>
                                        <th>Due Amount</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {suppliers.map((supplier) => (
                                        <tr key={supplier.id}>
                                            <td className="fw-medium">#{supplier.id}</td>
                                            <td>{supplier.name}</td>
                                            <td>{supplier.phone}</td>
                                            <td>{supplier.address}</td>
                                            <td>৳{parseFloat(supplier.total_amount).toLocaleString()}</td>
                                            <td className="text-success">
                                                {editingPaidAmount === supplier.id ? (
                                                    <InputGroup size="sm">
                                                        <Form.Control
                                                            type="number"
                                                            value={paidAmountInput}
                                                            onChange={(e) => setPaidAmountInput(e.target.value)}
                                                            autoFocus
                                                        />
                                                        <Button variant="outline-success" onClick={() => handleUpdatePaidAmount(supplier.id)} disabled={updateLoading}>
                                                            {updateLoading ? <FaSpinner className="spinner" /> : <FaSave />}
                                                        </Button>
                                                        <Button variant="outline-secondary" onClick={() => setEditingPaidAmount(null)}>
                                                            <FaTimes />
                                                        </Button>
                                                    </InputGroup>
                                                ) : (
                                                    <div className="d-flex align-items-center">
                                                        <span>৳{parseFloat(supplier.paid_amount).toLocaleString()}</span>
                                                        <Button
                                                            variant="link"
                                                            size="sm"
                                                            className="ms-2"
                                                            onClick={() => {
                                                                setEditingPaidAmount(supplier.id);
                                                                setPaidAmountInput(supplier.paid_amount);
                                                            }}
                                                        >
                                                            <FaEdit />
                                                        </Button>
                                                    </div>
                                                )}
                                            </td>
                                            <td className={supplier.due_amount > 0 ? 'text-danger' : ''}>
                                                ৳{parseFloat(supplier.due_amount).toLocaleString()}
                                            </td>
                                            <td>
                                                <div className="d-flex gap-2">
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        onClick={() => openEditModal(supplier)}
                                                        title="Edit"
                                                        className="view-btn"
                                                    >
                                                        <FaEdit />
                                                    </Button>
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => handleDeleteSupplier(supplier.id)}
                                                        title="Delete"
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
                </Card.Body>
            </Card>

            {/* Add/Edit Supplier Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>
                                {modalMode === "add" ? "Add New Supplier" : "Edit Supplier"}
                            </h3>
                            <button className="btn-close" onClick={closeModal} />
                        </div>
                        <form
                            onSubmit={
                                modalMode === "add" ? handleAddSupplier : handleEditSupplier
                            }
                        >
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({ ...formData, name: e.target.value })
                                        }
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Phone</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.phone}
                                        onChange={(e) =>
                                            setFormData({ ...formData, phone: e.target.value })
                                        }
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">
                                        Secondary Phone (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.phone2}
                                        onChange={(e) =>
                                            setFormData({ ...formData, phone2: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Address</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.address}
                                        onChange={(e) =>
                                            setFormData({ ...formData, address: e.target.value })
                                        }
                                        required
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
                                    {modalMode === "add" ? "Add Supplier" : "Update Supplier"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Suppliers;