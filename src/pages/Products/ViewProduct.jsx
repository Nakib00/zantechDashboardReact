import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Badge,
  Button,
  Row,
  Col,
  Image,
  Spinner,
  Alert,
  Modal,
  Form,
} from "react-bootstrap";
import {
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaShoppingCart,
  FaTag,
  FaLayerGroup,
  FaPencilAlt,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import axiosInstance from "../../config/axios";
import Loading from "../../components/Loading";

const ViewProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showQuickEdit, setShowQuickEdit] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imageError, setImageError] = useState(null);
  const [deleteImageLoading, setDeleteImageLoading] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    short_description: "",
    quantity: "",
    price: "",
    discount: "",
  });
  const [showTagModal, setShowTagModal] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [tagError, setTagError] = useState(null);
  const [tagLoading, setTagLoading] = useState(false);
  const [deleteTagLoading, setDeleteTagLoading] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [deleteCategoryLoading, setDeleteCategoryLoading] = useState(null);
  const [allCategories, setAllCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categoryError, setCategoryError] = useState(null);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  // Update edit form when product data is loaded
  useEffect(() => {
    if (product) {
      setEditForm({
        name: product.name || "",
        description: product.description || "",
        short_description: product.short_description || "",
        quantity: product.quantity || "",
        price: product.price || "",
        discount: product.discount || "",
      });
    }
  }, [product]);

  const handleQuickEdit = () => {
    setShowQuickEdit(true);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleQuickEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }

      const response = await axiosInstance.put(
        `/products/update/${id}`,
        editForm,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = response.data;

      if (!result.success) {
        throw new Error(result.message || "Failed to update product");
      }

      // Update local product state with new data
      setProduct((prev) => ({
        ...prev,
        ...editForm,
      }));

      toast.success("Product updated successfully");
      setShowQuickEdit(false);
    } catch (err) {
      console.error("Error updating product:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to update product";
      toast.error(errorMessage);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setEditLoading(false);
    }
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }

      const response = await axiosInstance.get(`/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = response.data;

      if (!result.success) {
        throw new Error(result.message || "Failed to fetch product");
      }

      setProduct(result.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching product:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to fetch product";
      setError(errorMessage);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error(
            "Authentication token not found. Please login again."
          );
        }

        const response = await axiosInstance.delete(`/products/delete/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = response.data;

        if (!result.success) {
          throw new Error(result.message || "Failed to delete product");
        }

        toast.success("Product deleted successfully");
        navigate("/products");
      } catch (err) {
        console.error("Error deleting product:", err);
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to delete product";
        toast.error(errorMessage);

        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      }
    }
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    setImageError(null);
  };

  const handleImageUpload = async () => {
    if (selectedFiles.length === 0) {
      setImageError("Please select at least one image");
      return;
    }

    setImageUploadLoading(true);
    setImageError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }

      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append("images[]", file);
      });

      const response = await axiosInstance.post(
        `/products/add-images/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to upload images");
      }

      // Refresh product data to get updated images
      await fetchProduct();
      setShowImageModal(false);
      setSelectedFiles([]);
      toast.success("Images uploaded successfully");
    } catch (err) {
      console.error("Error uploading images:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to upload images";
      setImageError(errorMessage);
      toast.error(errorMessage);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setImageUploadLoading(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm("Are you sure you want to delete this image?")) {
      return;
    }

    setDeleteImageLoading(imageId);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }

      const response = await axiosInstance.delete(
        `/products/remove-image/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          data: {
            image_id: imageId
          }
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete image");
      }

      // Refresh product data to get updated images
      await fetchProduct();
      toast.success("Image deleted successfully");
    } catch (err) {
      console.error("Error deleting image:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to delete image";
      toast.error(errorMessage);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setDeleteImageLoading(null);
    }
  };

  const handleAddTags = async () => {
    if (!tagInput.trim()) {
      setTagError("Please enter at least one tag");
      return;
    }

    // Split tags by comma and trim whitespace
    const tags = tagInput
      .split(",")
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    if (tags.length === 0) {
      setTagError("Please enter at least one valid tag");
      return;
    }

    setTagLoading(true);
    setTagError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }

      const response = await axiosInstance.post(
        `/products/add-tags/${id}`,
        { tags },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to add tags");
      }

      // Refresh product data to get updated tags
      await fetchProduct();
      setShowTagModal(false);
      setTagInput("");
      toast.success("Tags added successfully");
    } catch (err) {
      console.error("Error adding tags:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to add tags";
      setTagError(errorMessage);
      toast.error(errorMessage);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setTagLoading(false);
    }
  };

  const handleDeleteTag = async (tagId) => {
    if (!window.confirm("Are you sure you want to delete this tag?")) {
      return;
    }

    setDeleteTagLoading(tagId);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }

      const response = await axiosInstance.delete(
        `/products/remove-tags/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          data: {
            tag_ids: [tagId]
          }
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete tag");
      }

      // Refresh product data to get updated tags
      await fetchProduct();
      toast.success("Tag deleted successfully");
    } catch (err) {
      console.error("Error deleting tag:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to delete tag";
      toast.error(errorMessage);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setDeleteTagLoading(null);
    }
  };

  // Add new function to fetch all categories
  const fetchAllCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }

      const response = await axiosInstance.get("/categories", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch categories");
      }

      setAllCategories(response.data.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
      toast.error("Failed to fetch categories");
    }
  };

  // Add new functions for category management
  const handleAddCategories = async () => {
    if (selectedCategories.length === 0) {
      setCategoryError("Please select at least one category");
      return;
    }

    setCategoryLoading(true);
    setCategoryError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }

      const response = await axiosInstance.post(
        `/products/add-categories/${id}`,
        { category_id: selectedCategories },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to add categories");
      }

      // Refresh product data to get updated categories
      await fetchProduct();
      setShowCategoryModal(false);
      setSelectedCategories([]);
      toast.success("Categories added successfully");
    } catch (err) {
      console.error("Error adding categories:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to add categories";
      setCategoryError(errorMessage);
      toast.error(errorMessage);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm("Are you sure you want to remove this category?")) {
      return;
    }

    setDeleteCategoryLoading(categoryId);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }

      const response = await axiosInstance.delete(
        `/products/remove-categories/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          data: {
            category_id: [categoryId]
          }
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to remove category");
      }

      // Refresh product data to get updated categories
      await fetchProduct();
      toast.success("Category removed successfully");
    } catch (err) {
      console.error("Error removing category:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to remove category";
      toast.error(errorMessage);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setDeleteCategoryLoading(null);
    }
  };

  // Add useEffect to fetch categories when modal opens
  useEffect(() => {
    if (showCategoryModal) {
      fetchAllCategories();
    }
  }, [showCategoryModal]);

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid py-4">
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
          <hr />
          <div className="d-flex justify-content-end">
            <Button
              variant="outline-danger"
              onClick={() => navigate("/products")}
            >
              Back to Products
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Button
          variant="outline-secondary"
          onClick={() => navigate("/products")}
          className="d-flex align-items-center gap-2"
        >
          <FaArrowLeft /> Back to Products
        </Button>
        <div className="d-flex gap-2">
          <Button
            variant="primary"
            onClick={handleQuickEdit}
            className="d-flex align-items-center gap-2"
          >
            <FaPencilAlt /> Quick Edit
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            className="d-flex align-items-center gap-2"
          >
            <FaTrash /> Delete Product
          </Button>
        </div>
      </div>

      {/* Quick Edit Modal */}
      <Modal
        show={showQuickEdit}
        onHide={() => !editLoading && setShowQuickEdit(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Quick Edit Product</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleQuickEditSubmit}>
          <Modal.Body>
            {editLoading ? (
              <div className="text-center py-4">
                <Loading />
                <p className="text-muted mt-2 mb-0">Updating product...</p>
              </div>
            ) : (
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Product Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={editForm.name}
                      onChange={handleEditFormChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Short Description</Form.Label>
                    <Form.Control
                      type="text"
                      name="short_description"
                      value={editForm.short_description}
                      onChange={handleEditFormChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="description"
                      value={editForm.description}
                      onChange={handleEditFormChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Price (৳)</Form.Label>
                    <Form.Control
                      type="number"
                      name="price"
                      value={editForm.price}
                      onChange={handleEditFormChange}
                      min="0"
                      step="0.01"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Quantity</Form.Label>
                    <Form.Control
                      type="number"
                      name="quantity"
                      value={editForm.quantity}
                      onChange={handleEditFormChange}
                      min="0"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Discount (%)</Form.Label>
                    <Form.Control
                      type="number"
                      name="discount"
                      value={editForm.discount}
                      onChange={handleEditFormChange}
                      min="0"
                      max="100"
                    />
                  </Form.Group>
                </Col>
              </Row>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowQuickEdit(false)}
              disabled={editLoading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={editLoading}
              className="d-flex align-items-center gap-2"
            >
              {editLoading ? (
                <>
                  <Spinner animation="border" size="sm" />
                  Updating...
                </>
              ) : (
                <>
                  <FaPencilAlt /> Update Product
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Add Image Modal */}
      <Modal
        show={showImageModal}
        onHide={() => !imageUploadLoading && setShowImageModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Product Images</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {imageUploadLoading ? (
            <div className="text-center py-4">
              <Loading />
              <p className="text-muted mt-2 mb-0">Uploading images...</p>
            </div>
          ) : (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Select Images</Form.Label>
                <Form.Control
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="mb-2"
                />
                <Form.Text className="text-muted">
                  You can select multiple images. Supported formats: JPEG, PNG, JPG, GIF, SVG (max 4MB each)
                </Form.Text>
              </Form.Group>
              {selectedFiles.length > 0 && (
                <div className="mt-3">
                  <h6>Selected Files:</h6>
                  <ul className="list-unstyled">
                    {selectedFiles.map((file, index) => (
                      <li key={index} className="text-muted">
                        {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {imageError && (
                <Alert variant="danger" className="mt-3">
                  {imageError}
                </Alert>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowImageModal(false)}
            disabled={imageUploadLoading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleImageUpload}
            disabled={imageUploadLoading || selectedFiles.length === 0}
            className="d-flex align-items-center gap-2"
          >
            {imageUploadLoading ? (
              <>
                <Spinner animation="border" size="sm" />
                Uploading...
              </>
            ) : (
              <>
                <FaPencilAlt /> Upload Images
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Tag Modal */}
      <Modal
        show={showTagModal}
        onHide={() => !tagLoading && setShowTagModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Product Tags</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {tagLoading ? (
            <div className="text-center py-4">
              <Loading />
              <p className="text-muted mt-2 mb-0">Adding tags...</p>
            </div>
          ) : (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Enter Tags</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Enter tags separated by commas (e.g., tag1, tag2, tag3)"
                  value={tagInput}
                  onChange={(e) => {
                    setTagInput(e.target.value);
                    setTagError(null);
                  }}
                />
                <Form.Text className="text-muted">
                  Separate multiple tags with commas
                </Form.Text>
              </Form.Group>
              {tagError && (
                <Alert variant="danger" className="mt-3">
                  {tagError}
                </Alert>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowTagModal(false)}
            disabled={tagLoading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAddTags}
            disabled={tagLoading || !tagInput.trim()}
            className="d-flex align-items-center gap-2"
          >
            {tagLoading ? (
              <>
                <Spinner animation="border" size="sm" />
                Adding...
              </>
            ) : (
              <>
                <FaTag /> Add Tags
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Category Modal */}
      <Modal
        show={showCategoryModal}
        onHide={() => !categoryLoading && setShowCategoryModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Product Categories</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {categoryLoading ? (
            <div className="text-center py-4">
              <Loading />
              <p className="text-muted mt-2 mb-0">Adding categories...</p>
            </div>
          ) : (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Select Categories</Form.Label>
                <div className="border rounded p-3" style={{ maxHeight: "300px", overflowY: "auto" }}>
                  {allCategories.length > 0 ? (
                    allCategories.map((category) => (
                      <Form.Check
                        key={category.id}
                        type="checkbox"
                        id={`category-${category.id}`}
                        label={category.name}
                        checked={selectedCategories.includes(category.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCategories([...selectedCategories, category.id]);
                          } else {
                            setSelectedCategories(selectedCategories.filter(id => id !== category.id));
                          }
                          setCategoryError(null);
                        }}
                        className="mb-2"
                      />
                    ))
                  ) : (
                    <p className="text-muted mb-0">No categories available</p>
                  )}
                </div>
                <Form.Text className="text-muted">
                  Select one or more categories for this product
                </Form.Text>
              </Form.Group>
              {categoryError && (
                <Alert variant="danger" className="mt-3">
                  {categoryError}
                </Alert>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowCategoryModal(false)}
            disabled={categoryLoading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAddCategories}
            disabled={categoryLoading || selectedCategories.length === 0}
            className="d-flex align-items-center gap-2"
          >
            {categoryLoading ? (
              <>
                <Spinner animation="border" size="sm" />
                Adding...
              </>
            ) : (
              <>
                <FaLayerGroup /> Add Categories
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <Row>
        {/* Product Images Section */}
        <Col lg={6} className="mb-4">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Product Images</h5>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => setShowImageModal(true)}
                  className="d-flex align-items-center gap-2"
                >
                  <FaPencilAlt /> Add Images
                </Button>
              </div>
              <div className="text-center mb-3">
                {product.images && product.images.length > 0 ? (
                  <div className="position-relative">
                    <Image
                      src={product.images[selectedImage].path}
                      alt={product.name}
                      fluid
                      className="rounded"
                      style={{ maxHeight: "400px", objectFit: "contain" }}
                    />
                    <Button
                      variant="danger"
                      size="sm"
                      className="position-absolute top-0 end-0 m-2"
                      onClick={() => handleDeleteImage(product.images[selectedImage].id)}
                      disabled={deleteImageLoading === product.images[selectedImage].id}
                    >
                      {deleteImageLoading === product.images[selectedImage].id ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        <FaTrash />
                      )}
                    </Button>
                  </div>
                ) : (
                  <div
                    className="bg-light rounded d-flex align-items-center justify-content-center"
                    style={{ height: "400px" }}
                  >
                    <span className="text-muted">No image available</span>
                  </div>
                )}
              </div>
              {product.images && product.images.length > 1 && (
                <div className="d-flex gap-2 justify-content-center flex-wrap">
                  {product.images.map((image, index) => (
                    <div
                      key={image.id}
                      className="position-relative"
                      style={{
                        width: "80px",
                        height: "80px",
                        border:
                          selectedImage === index
                            ? "2px solid #0d6efd"
                            : "1px solid #dee2e6",
                        borderRadius: "4px",
                        overflow: "hidden",
                        cursor: "pointer",
                      }}
                    >
                      <div
                        className="w-100 h-100"
                        onClick={() => setSelectedImage(index)}
                      >
                        <Image
                          src={image.path}
                          alt={`${product.name} - ${index + 1}`}
                          fluid
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </div>
                      <Button
                        variant="danger"
                        size="sm"
                        className="position-absolute top-0 end-0 m-1"
                        style={{ padding: "0.1rem 0.3rem" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteImage(image.id);
                        }}
                        disabled={deleteImageLoading === image.id}
                      >
                        {deleteImageLoading === image.id ? (
                          <Spinner animation="border" size="sm" />
                        ) : (
                          <FaTrash size={12} />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Product Details Section */}
        <Col lg={6}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body>
              <h2 className="mb-3">{product.name}</h2>
              <p className="text-muted mb-3">{product.short_description}</p>

              <div className="mb-4">
                <h5 className="mb-3">Description</h5>
                <p className="mb-0">{product.description}</p>
              </div>

              <div className="d-flex align-items-center gap-3 mb-4">
                <h4 className="mb-0">৳{product.price}</h4>
                {product.discount > 0 && (
                  <Badge bg="danger" className="fs-6">
                    -{product.discount}%
                  </Badge>
                )}
              </div>

              <div className="d-flex align-items-center gap-3 mb-4">
                <Badge
                  bg={product.quantity > 0 ? "success" : "danger"}
                  className="px-3 py-2 fs-6"
                >
                  {product.quantity > 0
                    ? `${product.quantity} in stock`
                    : "Out of stock"}
                </Badge>
                <Badge
                  bg={product.status === "1" ? "success" : "secondary"}
                  className="px-3 py-2 fs-6"
                >
                  {product.status === "1" ? "Active" : "Inactive"}
                </Badge>
              </div>

              {/* Categories Section */}
              {product.categories && product.categories.length > 0 && (
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0 d-flex align-items-center gap-2">
                      <FaLayerGroup /> Categories
                    </h5>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => setShowCategoryModal(true)}
                      className="d-flex align-items-center gap-2"
                    >
                      <FaLayerGroup /> Add Categories
                    </Button>
                  </div>
                  {product.categories.length > 0 ? (
                    <div className="d-flex flex-wrap gap-2">
                      {product.categories.map((category) => (
                        <Badge
                          key={category.id}
                          bg="info"
                          className="px-3 py-2 fs-6 d-flex align-items-center gap-2"
                        >
                          {category.name}
                          <Button
                            variant="link"
                            className="p-0 text-white"
                            style={{ fontSize: "0.875rem" }}
                            onClick={() => handleDeleteCategory(category.id)}
                            disabled={deleteCategoryLoading === category.id}
                          >
                            {deleteCategoryLoading === category.id ? (
                              <Spinner animation="border" size="sm" />
                            ) : (
                              <FaTrash size={12} />
                            )}
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted mb-0">No categories added yet</p>
                  )}
                </div>
              )}

              {/* Tags Section */}
              {product.tags && (
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0 d-flex align-items-center gap-2">
                      <FaTag /> Tags
                    </h5>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => setShowTagModal(true)}
                      className="d-flex align-items-center gap-2"
                    >
                      <FaTag /> Add Tags
                    </Button>
                  </div>
                  {product.tags.length > 0 ? (
                    <div className="d-flex flex-wrap gap-2">
                      {product.tags.map((tag) => (
                        <Badge
                          key={tag.id}
                          bg="secondary"
                          className="px-3 py-2 fs-6 d-flex align-items-center gap-2"
                        >
                          {tag.tag}
                          <Button
                            variant="link"
                            className="p-0 text-white"
                            style={{ fontSize: "0.875rem" }}
                            onClick={() => handleDeleteTag(tag.id)}
                            disabled={deleteTagLoading === tag.id}
                          >
                            {deleteTagLoading === tag.id ? (
                              <Spinner animation="border" size="sm" />
                            ) : (
                              <FaTrash size={12} />
                            )}
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted mb-0">No tags added yet</p>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Bundle Products Section */}
      {product.bundle_items && product.bundle_items.length > 0 && (
        <Card className="border-0 shadow-sm mt-4">
          <Card.Body>
            <h4 className="mb-4">Bundle Products</h4>
            <Row>
              {product.bundle_items.map((item, index) => (
                <Col key={index} md={6} lg={4} className="mb-4">
                  <Card className="h-100">
                    <div className="position-relative">
                      <Card.Img
                        variant="top"
                        src={item.image}
                        alt={item.name}
                        style={{ height: "200px", objectFit: "cover" }}
                      />
                      {item.discount > 0 && (
                        <Badge
                          bg="danger"
                          className="position-absolute top-0 end-0 m-2"
                        >
                          -{item.discount}%
                        </Badge>
                      )}
                    </div>
                    <Card.Body>
                      <Card.Title className="h6 mb-2">{item.name}</Card.Title>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <span className="fw-bold">৳{item.price}</span>
                          <small className="text-muted d-block">
                            Quantity: {item.bundle_quantity}
                          </small>
                        </div>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() =>
                            navigate(`/products/${item.product_id}`)
                          }
                        >
                          View
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default ViewProduct;
