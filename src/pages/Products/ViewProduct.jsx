import React, { useState, useEffect, useRef, useMemo } from "react";
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
  InputGroup,
  Table,
} from "react-bootstrap";
import {
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaShoppingCart,
  FaTag,
  FaLayerGroup,
  FaPencilAlt,
  FaPlus,
  FaSearch,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import axiosInstance from "../../config/axios";
import Loading from "../../components/Loading";
import JoditEditor from 'jodit-react';

const ViewProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
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
    discount: "0",
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
  const [deleteBundleLoading, setDeleteBundleLoading] = useState(null);
  const [bundleLoading, setBundleLoading] = useState(false);
  const [bundleError, setBundleError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [bundleQuantity, setBundleQuantity] = useState({});
  const [updateQuantityLoading, setUpdateQuantityLoading] = useState(null);
  const [editingQuantity, setEditingQuantity] = useState({});
  const [statusLoading, setStatusLoading] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const editorRef = useRef(null);

  const editorConfig = useMemo(() => ({
    readonly: false,
    placeholder: 'Start typing your product description...',
    height: 400,
    toolbar: true,
    spellcheck: true,
    language: 'en',
    toolbarButtonSize: 'medium',
    buttons: [
      'source', '|',
      'bold', 'italic', 'underline', 'strikethrough', '|',
      'font', 'fontsize', 'brush', 'paragraph', '|',
      'image', 'table', 'link', '|',
      'align', '|',
      'ul', 'ol', '|',
      'symbol', 'fullsize', 'print', 'about'
    ],
    uploader: {
      insertImageAsBase64URI: true
    },
    removeButtons: ['about'],
    showCharsCounter: true,
    showWordsCounter: true,
    showXPathInStatusbar: false
  }), []);

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
        discount: product.discount || "0",
      });
    }
  }, [product]);

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value === "" ? (name === "discount" ? "0" : value) : value,
    }));
  };

  const handleEditorChange = (newContent) => {
    setEditForm(prev => ({
      ...prev,
      description: newContent
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

  const handleDeleteBundleItem = async (bundleId) => {
    if (!window.confirm("Are you sure you want to remove this item from the bundle?")) {
      return;
    }

    setDeleteBundleLoading(bundleId);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }

      const response = await axiosInstance.delete(
        `/products/bundles/delete/${bundleId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete bundle item");
      }

      // Refresh product data to get updated bundle items
      await fetchProduct();
      toast.success("Bundle item removed successfully");
    } catch (err) {
      console.error("Error deleting bundle item:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to delete bundle item";
      toast.error(errorMessage);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setDeleteBundleLoading(null);
    }
  };

  // Add new function to search products
  const searchProducts = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }

      const response = await axiosInstance.get(`/products?search=${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to search products");
      }

      // Filter out the current product and already selected items
      const filteredProducts = response.data.data.filter(
        (product) =>
          product.id !== parseInt(id) &&
          !selectedItems.some((item) => item.id === product.id)
      );

      setSearchResults(filteredProducts);
    } catch (err) {
      console.error("Error searching products:", err);
      toast.error("Failed to search products");
    } finally {
      setSearchLoading(false);
    }
  };

  // Add debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchProducts(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Add function to handle adding items to bundle
  const handleAddToBundle = async () => {
    if (selectedItems.length === 0) {
      setBundleError("Please select at least one item");
      return;
    }

    // Validate quantities
    const invalidItems = selectedItems.filter(
      (item) => !bundleQuantity[item.id] || bundleQuantity[item.id] < 1
    );
    if (invalidItems.length > 0) {
      setBundleError("Please enter valid quantities for all items");
      return;
    }

    setBundleLoading(true);
    setBundleError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }

      const items = selectedItems.map((item) => ({
        item_id: item.id,
        bundle_quantity: parseInt(bundleQuantity[item.id]),
      }));

      const response = await axiosInstance.post(
        `/products/bundles/${id}`,
        { items },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to add bundle items");
      }

      // Refresh product data
      await fetchProduct();
      setSelectedItems([]);
      setBundleQuantity({});
      setSearchQuery("");
      setSearchResults([]);
      toast.success("Bundle items added successfully");
    } catch (err) {
      console.error("Error adding bundle items:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to add bundle items";
      setBundleError(errorMessage);
      toast.error(errorMessage);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setBundleLoading(false);
    }
  };

  // Add function to handle selecting a product
  const handleSelectProduct = (product) => {
    if (!selectedItems.some((item) => item.id === product.id)) {
      setSelectedItems([...selectedItems, product]);
      setBundleQuantity({ ...bundleQuantity, [product.id]: 1 });
    }
    setSearchQuery("");
    setSearchResults([]);
  };

  // Add function to remove selected item
  const handleRemoveSelectedItem = (productId) => {
    setSelectedItems(selectedItems.filter((item) => item.id !== productId));
    const newBundleQuantity = { ...bundleQuantity };
    delete newBundleQuantity[productId];
    setBundleQuantity(newBundleQuantity);
  };

  // Add new function to handle quantity update
  const handleUpdateBundleQuantity = async (bundleId, newQuantity) => {
    if (!newQuantity || newQuantity < 1) {
      toast.error("Please enter a valid quantity");
      return;
    }

    setUpdateQuantityLoading(bundleId);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }

      const response = await axiosInstance.post(
        `/products/bundles/update-quantity/${bundleId}`,
        { quantity: parseInt(newQuantity) },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to update quantity");
      }

      // Refresh product data to get updated bundle items
      await fetchProduct();
      setEditingQuantity({});
      toast.success("Bundle quantity updated successfully");
    } catch (err) {
      console.error("Error updating bundle quantity:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to update quantity";
      toast.error(errorMessage);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setUpdateQuantityLoading(null);
    }
  };

  // Add new function to handle status toggle
  const handleToggleStatus = async () => {
    setStatusLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }

      const response = await axiosInstance.post(
        `/products/toggle-status/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to toggle status");
      }

      // Update local product state with new status
      setProduct(prev => ({
        ...prev,
        status: prev.status === "1" ? "0" : "1"
      }));
      
      toast.success(`Product ${product.status === "1" ? "deactivated" : "activated"} successfully`);
    } catch (err) {
      console.error("Error toggling status:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to toggle status";
      toast.error(errorMessage);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setStatusLoading(false);
    }
  };

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
        <Button
          variant="outline-danger"
          size="sm"
          onClick={handleDelete}
          className="d-flex align-items-center gap-2"
        >
          <FaTrash /> Delete Product
        </Button>
      </div>

      <Row>
        {/* Product Details Section */}
        <Col lg={12}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="mb-0">{product.name}</h2>
                <div className="d-flex gap-2">
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
                    role="button"
                    onClick={handleToggleStatus}
                    style={{ cursor: statusLoading ? 'not-allowed' : 'pointer' }}
                    disabled={statusLoading}
                  >
                    {statusLoading ? (
                      <Spinner animation="border" size="sm" className="me-1" />
                    ) : null}
                    {product.status === "1" ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              <Form onSubmit={handleQuickEditSubmit} className="mb-4">
                {editLoading ? (
                  <div className="text-center py-4">
                    <Loading />
                    <p className="text-muted mt-2 mb-0">Updating product...</p>
                  </div>
                ) : (
                  <div className="border rounded p-3 bg-light">
                    <Row>
                      <Col md={12}>
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
                      <Col md={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>Short Description</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={2}
                            name="short_description"
                            value={editForm.short_description}
                            onChange={handleEditFormChange}
                            placeholder="Enter a brief description of the product"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>Description</Form.Label>
                          <JoditEditor
                            ref={editorRef}
                            value={editForm.description}
                            config={editorConfig}
                            tabIndex={1}
                            onBlur={handleEditorChange}
                            onChange={handleEditorChange}
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
                            value={editForm.discount || "0"}
                            onChange={handleEditFormChange}
                            min="0"
                            max="100"
                            placeholder="0"
                          />
                          <Form.Text className="text-muted">
                            Enter 0 if no discount
                          </Form.Text>
                        </Form.Group>
                      </Col>
                      <Col md={12} className="text-end">
                        <Button
                          variant="primary"
                          type="submit"
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
                      </Col>
                    </Row>
                  </div>
                )}
              </Form>

              <div className="d-flex align-items-center gap-3 mb-4">
                <h4 className="mb-0">৳{product.price}</h4>
                {product.discount > 0 && (
                  <Badge bg="danger" className="fs-6">
                    -{product.discount}%
                  </Badge>
                )}
              </div>
            </Card.Body>
          </Card>

          {/* Product Images Section */}
          <Card className="border-0 shadow-sm mb-4">
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

              {product.images && product.images.length > 0 ? (
                <div className="table-responsive">
                  <Table hover className="align-middle mb-0">
                    <thead>
                      <tr>
                        <th style={{ width: "80px" }}>Image</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.images.map((image, index) => (
                        <tr key={image.id}>
                          <td>
                            <div 
                              className="rounded cursor-pointer"
                              style={{ 
                                width: "60px", 
                                height: "60px", 
                                overflow: "hidden",
                                cursor: "pointer"
                              }}
                              onClick={() => {
                                setSelectedImage(index);
                                setShowImagePreview(true);
                              }}
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
                                className="rounded"
                              />
                            </div>
                          </td>
                          <td>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteImage(image.id)}
                              disabled={deleteImageLoading === image.id}
                              className="d-flex align-items-center gap-1"
                            >
                              {deleteImageLoading === image.id ? (
                                <Spinner animation="border" size="sm" />
                              ) : (
                                <>
                                  <FaTrash size={12} /> Delete
                                </>
                              )}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div
                  className="bg-light rounded d-flex align-items-center justify-content-center"
                  style={{ height: "100px" }}
                >
                  <span className="text-muted">No image available</span>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Categories Section */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body>
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
              {product.categories && product.categories.length > 0 ? (
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
            </Card.Body>
          </Card>

          {/* Tags Section */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body>
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
              {product.tags && product.tags.length > 0 ? (
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
            </Card.Body>
          </Card>

          {/* Bundle Products Section */}
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0">Bundle Products</h4>
              </div>

              {/* Add Bundle Items Section */}
              <div className="bundle-form-section mb-4">
                <Card className="border-0 shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="mb-0">Add Bundle Items</h5>
                    </div>
                    
                    {/* Search Section */}
                    <div className="mb-4">
                      <Form.Group>
                        <Form.Label className="fw-medium">Search Products</Form.Label>
                        <InputGroup>
                          <InputGroup.Text>
                            <FaSearch />
                          </InputGroup.Text>
                          <Form.Control
                            type="text"
                            placeholder="Type product name to search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </InputGroup>
                        <Form.Text className="text-muted">
                          Search for products to add to your bundle
                        </Form.Text>
                      </Form.Group>
                      {searchLoading && (
                        <div className="text-center mt-3">
                          <Spinner animation="border" size="sm" />
                          <span className="ms-2">Searching products...</span>
                        </div>
                      )}
                      {searchResults.length > 0 && (
                        <div className="mt-3">
                          <h6 className="mb-2">Search Results</h6>
                          <div className="border rounded" style={{ maxHeight: "300px", overflowY: "auto" }}>
                            {searchResults.map((product) => (
                              <div
                                key={product.id}
                                className="p-3 border-bottom d-flex align-items-center justify-content-between hover-bg-light"
                                style={{ cursor: "pointer" }}
                                onClick={() => handleSelectProduct(product)}
                              >
                                <div className="d-flex align-items-center gap-3">
                                  {product.images && product.images.length > 0 ? (
                                    <div className="rounded" style={{ width: "50px", height: "50px", overflow: "hidden" }}>
                                      <Image
                                        src={product.images[0].path}
                                        alt={product.name}
                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                        className="rounded"
                                      />
                                    </div>
                                  ) : (
                                    <div 
                                      className="rounded bg-light d-flex align-items-center justify-content-center"
                                      style={{ width: "50px", height: "50px" }}
                                    >
                                      <FaShoppingCart className="text-muted" />
                                    </div>
                                  )}
                                  <div>
                                    <h6 className="mb-1">{product.name}</h6>
                                    <div className="d-flex gap-3 text-muted small">
                                      <span>Price: ৳{product.price}</span>
                                      <span>Stock: {product.quantity}</span>
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  className="d-flex align-items-center gap-2"
                                >
                                  <FaPlus size={12} /> Add
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Selected Items Section */}
                    {selectedItems.length > 0 && (
                      <div className="selected-items-section">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h6 className="mb-0">Selected Items ({selectedItems.length})</h6>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => {
                              setSelectedItems([]);
                              setBundleQuantity({});
                            }}
                            className="d-flex align-items-center gap-2"
                          >
                            <FaTrash size={12} /> Clear All
                          </Button>
                        </div>
                        <div className="table-responsive">
                          <Table hover className="align-middle mb-0">
                            <thead>
                              <tr>
                                <th style={{ width: "50px" }}>Image</th>
                                <th>Product</th>
                                <th style={{ width: "120px" }}>Price</th>
                                <th style={{ width: "150px" }}>Quantity</th>
                                <th style={{ width: "100px" }}>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedItems.map((item) => (
                                <tr key={item.id}>
                                  <td>
                                    {item.images && item.images.length > 0 ? (
                                      <div className="rounded" style={{ width: "50px", height: "50px", overflow: "hidden" }}>
                                        <Image
                                          src={item.images[0].path}
                                          alt={item.name}
                                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                          className="rounded"
                                        />
                                      </div>
                                    ) : (
                                      <div 
                                        className="rounded bg-light d-flex align-items-center justify-content-center"
                                        style={{ width: "50px", height: "50px" }}
                                      >
                                        <FaShoppingCart className="text-muted" />
                                      </div>
                                    )}
                                  </td>
                                  <td>
                                    <div>
                                      <div className="fw-medium">{item.name}</div>
                                      <small className="text-muted">Stock: {item.quantity}</small>
                                    </div>
                                  </td>
                                  <td>৳{item.price}</td>
                                  <td>
                                    <Form.Control
                                      type="number"
                                      size="sm"
                                      min="1"
                                      max={item.quantity}
                                      value={bundleQuantity[item.id] || ""}
                                      onChange={(e) =>
                                        setBundleQuantity({
                                          ...bundleQuantity,
                                          [item.id]: e.target.value,
                                        })
                                      }
                                      placeholder="Qty"
                                    />
                                  </td>
                                  <td>
                                    <Button
                                      variant="outline-danger"
                                      size="sm"
                                      onClick={() => handleRemoveSelectedItem(item.id)}
                                      className="d-flex align-items-center gap-1"
                                    >
                                      <FaTrash size={12} />
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr>
                                <td colSpan="2" className="text-end fw-bold">Total:</td>
                                <td colSpan="3" className="fw-bold text-primary">
                                  ৳{selectedItems.reduce((total, item) => 
                                    total + (item.price * (parseInt(bundleQuantity[item.id]) || 0)), 0
                                  )}
                                </td>
                              </tr>
                            </tfoot>
                          </Table>
                        </div>

                        {bundleError && (
                          <Alert variant="danger" className="mt-3 mb-0">
                            {bundleError}
                          </Alert>
                        )}

                        <div className="d-flex justify-content-end mt-3">
                          <Button
                            variant="primary"
                            onClick={handleAddToBundle}
                            disabled={bundleLoading || selectedItems.length === 0}
                            className="d-flex align-items-center gap-2"
                          >
                            {bundleLoading ? (
                              <>
                                <Spinner animation="border" size="sm" />
                                Adding...
                              </>
                            ) : (
                              <>
                                <FaPlus /> Add to Bundle
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </div>

              {/* Existing Bundle Items */}
              {product.bundle_items && product.bundle_items.length > 0 ? (
                <>
                  <div className="table-responsive">
                    <Table hover className="align-middle">
                      <thead>
                        <tr>
                          <th style={{ width: "60px" }}>Image</th>
                          <th>Product Name</th>
                          <th>Price</th>
                          <th>Quantity</th>
                          <th>Total</th>
                          <th style={{ width: "150px" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {product.bundle_items.map((item) => (
                          <tr key={item.bundle_id}>
                            <td>
                              {item.image ? (
                                <div className="rounded" style={{ width: "50px", height: "50px", overflow: "hidden" }}>
                                  <Image
                                    src={item.image}
                                    alt={item.name}
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    className="rounded"
                                  />
                                </div>
                              ) : (
                                <div 
                                  className="rounded bg-light d-flex align-items-center justify-content-center"
                                  style={{ width: "50px", height: "50px" }}
                                >
                                  <FaShoppingCart className="text-muted" />
                                </div>
                              )}
                            </td>
                            <td>
                              <div>
                                <div className="fw-medium">{item.name}</div>
                                {item.discount > 0 && (
                                  <Badge bg="danger" className="mt-1">
                                    -{item.discount}%
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td>৳{item.price}</td>
                            <td>
                              {editingQuantity[item.bundle_id] ? (
                                <div className="d-flex align-items-center gap-2">
                                  <Form.Control
                                    type="number"
                                    size="sm"
                                    style={{ width: "80px" }}
                                    min="1"
                                    value={editingQuantity[item.bundle_id]}
                                    onChange={(e) => setEditingQuantity({
                                      ...editingQuantity,
                                      [item.bundle_id]: e.target.value
                                    })}
                                  />
                                  <Button
                                    variant="success"
                                    size="sm"
                                    onClick={() => handleUpdateBundleQuantity(item.bundle_id, editingQuantity[item.bundle_id])}
                                    disabled={updateQuantityLoading === item.bundle_id}
                                  >
                                    {updateQuantityLoading === item.bundle_id ? (
                                      <Spinner animation="border" size="sm" />
                                    ) : (
                                      "Save"
                                    )}
                                  </Button>
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setEditingQuantity({})}
                                    disabled={updateQuantityLoading === item.bundle_id}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              ) : (
                                <div className="d-flex align-items-center gap-2">
                                  <span>{item.bundle_quantity}</span>
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => setEditingQuantity({
                                      ...editingQuantity,
                                      [item.bundle_id]: item.bundle_quantity
                                    })}
                                    disabled={updateQuantityLoading === item.bundle_id}
                                  >
                                    <FaPencilAlt size={12} />
                                  </Button>
                                </div>
                              )}
                            </td>
                            <td className="fw-bold text-primary">৳{item.price * item.bundle_quantity}</td>
                            <td>
                              <div className="d-flex gap-2">
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => navigate(`/products/${item.item_id}`)}
                                >
                                  View
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleDeleteBundleItem(item.bundle_id)}
                                  disabled={deleteBundleLoading === item.bundle_id || updateQuantityLoading === item.bundle_id}
                                >
                                  {deleteBundleLoading === item.bundle_id ? (
                                    <Spinner animation="border" size="sm" />
                                  ) : (
                                    <FaTrash />
                                  )}
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan="4" className="text-end fw-bold"><h4>Bundle Total:</h4></td>
                          <td colSpan="2" className="fw-bold text-primary">
                            <h4>৳{product.bundle_items.reduce((total, item) => total + (item.price * item.bundle_quantity), 0)}</h4>
                            <div className="text-muted small">
                              <h6>Total of {product.bundle_items.length} items</h6>
                            </div>
                          </td>
                        </tr>
                      </tfoot>
                    </Table>
                  </div>
                </>
              ) : (
                <p className="text-muted mb-0">No bundle items added yet</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modals */}

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
        dialogClassName="modal-dialog-centered"
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
        dialogClassName="modal-dialog-centered"
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
                <div className="border rounded p-3" style={{ maxHeight: "400px", overflowY: "auto" }}>
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
        <Modal.Footer className="justify-content-center">
          <Button
            variant="secondary"
            onClick={() => setShowCategoryModal(false)}
            disabled={categoryLoading}
            className="px-4"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAddCategories}
            disabled={categoryLoading || selectedCategories.length === 0}
            className="d-flex align-items-center gap-2 px-4"
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

      {/* Image Preview Modal */}
      <Modal
        show={showImagePreview}
        onHide={() => setShowImagePreview(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Image Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center p-0">
          {product.images && product.images.length > 0 && (
            <>
              <div className="position-relative">
                <Image
                  src={product.images[selectedImage].path}
                  alt={product.name}
                  fluid
                  className="rounded"
                  style={{ maxHeight: "70vh", objectFit: "contain" }}
                />
              </div>
              {product.images.length > 1 && (
                <div className="d-flex gap-2 justify-content-center flex-wrap p-3 bg-light">
                  {product.images.map((image, index) => (
                    <div
                      key={image.id}
                      className="position-relative"
                      style={{
                        width: "60px",
                        height: "60px",
                        border:
                          selectedImage === index
                            ? "2px solid #0d6efd"
                            : "1px solid #dee2e6",
                        borderRadius: "4px",
                        overflow: "hidden",
                        cursor: "pointer",
                      }}
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
                  ))}
                </div>
              )}
            </>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ViewProduct;
