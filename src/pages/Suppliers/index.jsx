import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "react-hot-toast";
import axiosInstance from "../../config/axios";
import "../Categories/Categories.css";

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    phone2: "",
    address: "",
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await axiosInstance.get("/suppliers");
      setSuppliers(response.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch suppliers");
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-text">Zantech</div>
      </div>
    );
  }

  return (
    <div className="categories-container">
      <div className="categories-header">
        <h2>Suppliers</h2>
        <button className="btn btn-primary" onClick={openAddModal}>
          <FaPlus /> Add Supplier
        </button>
      </div>
      <div className="categories-table-container">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Secondary Phone</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((supplier) => (
              <tr key={supplier.id}>
                <td>{supplier.id}</td>
                <td>{supplier.name}</td>
                <td>{supplier.phone}</td>
                <td>{supplier.phone2 || "N/A"}</td>
                <td>{supplier.address}</td>
                <td>
                  <button
                    className="btn btn-sm btn-info me-2"
                    onClick={() => openEditModal(supplier)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDeleteSupplier(supplier.id)}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
