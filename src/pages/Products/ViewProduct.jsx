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
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    short_description: "",
    quantity: "",
    price: "",
    discount: "",
  });

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

      <Row>
        {/* Product Images Section */}
        <Col lg={6} className="mb-4">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="text-center mb-3">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[selectedImage].path}
                    alt={product.name}
                    fluid
                    className="rounded"
                    style={{ maxHeight: "400px", objectFit: "contain" }}
                  />
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
                      className="cursor-pointer"
                      onClick={() => setSelectedImage(index)}
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
                  <h5 className="mb-3 d-flex align-items-center gap-2">
                    <FaLayerGroup /> Categories
                  </h5>
                  <div className="d-flex flex-wrap gap-2">
                    {product.categories.map((category) => (
                      <Badge
                        key={category.id}
                        bg="info"
                        className="px-3 py-2 fs-6"
                      >
                        {category.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags Section */}
              {product.tags && product.tags.length > 0 && (
                <div className="mb-4">
                  <h5 className="mb-3 d-flex align-items-center gap-2">
                    <FaTag /> Tags
                  </h5>
                  <div className="d-flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        bg="secondary"
                        className="px-3 py-2 fs-6"
                      >
                        {tag.tag}
                      </Badge>
                    ))}
                  </div>
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
