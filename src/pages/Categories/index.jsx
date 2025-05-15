import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import axiosInstance from "../../config/axios";
import "./Categories.css";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add' or 'edit'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get("/categories");
      setCategories(response.data.data);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch categories"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post("/categories", formData);
      setCategories([...categories, response.data.data]);
      setShowModal(false);
      setFormData({ name: "", description: "" });
      toast.success("Category added successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add category");
    }
  };

  const handleEditCategory = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.put(
        `/categories/${selectedCategory.id}`,
        formData
      );
      setCategories(
        categories.map((cat) =>
          cat.id === selectedCategory.id ? response.data.data : cat
        )
      );
      setShowModal(false);
      setFormData({ name: "", description: "" });
      setSelectedCategory(null);
      toast.success("Category updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update category");
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await axiosInstance.delete(`/categories/${id}`);
        setCategories(categories.filter((cat) => cat.id !== id));
        toast.success("Category deleted successfully");
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to delete category"
        );
      }
    }
  };

  const openEditModal = (category) => {
    setModalMode("edit");
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
    });
    setShowModal(true);
  };

  const openAddModal = () => {
    setModalMode("add");
    setSelectedCategory(null);
    setFormData({ name: "", description: "" });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({ name: "", description: "" });
    setSelectedCategory(null);
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
        <h2>Categories</h2>
        <button className="btn btn-primary" onClick={openAddModal}>
          <FaPlus /> Add Category
        </button>
      </div>

      <div className="categories-table-container">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <td>{category.id}</td>
                <td>{category.name}</td>
                <td>{category.description}</td>
                <td>
                  <span
                    className={`status-badge ${
                      category.status === 1 ? "inactive" : "active"
                    }`}
                  >
                    {category.status === 1 ? "Inactive" : "Active"}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-info me-2"
                    onClick={() => openEditModal(category)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Category Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                {modalMode === "add" ? "Add New Category" : "Edit Category"}
              </h3>
              <button className="btn-close" onClick={closeModal} />
            </div>
            <form
              onSubmit={
                modalMode === "add" ? handleAddCategory : handleEditCategory
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
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows="3"
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
                  {modalMode === "add" ? "Add Category" : "Update Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
