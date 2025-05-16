import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Badge, Button, Row, Col, Image, Spinner, Alert } from 'react-bootstrap';
import { FaArrowLeft, FaEdit, FaTrash, FaShoppingCart, FaTag, FaLayerGroup } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../config/axios';
import Loading from '../../components/Loading';

const ViewProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found. Please login again.');
      }

      const response = await axiosInstance.get(`/products/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = response.data;

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch product');
      }

      setProduct(result.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching product:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch product';
      setError(errorMessage);
      
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Authentication token not found. Please login again.');
        }

        const response = await axiosInstance.delete(`/products/delete/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const result = response.data;

        if (!result.success) {
          throw new Error(result.message || 'Failed to delete product');
        }

        toast.success('Product deleted successfully');
        navigate('/products');
      } catch (err) {
        console.error('Error deleting product:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Failed to delete product';
        toast.error(errorMessage);
        
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
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
            <Button variant="outline-danger" onClick={() => navigate('/products')}>
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
          onClick={() => navigate('/products')}
          className="d-flex align-items-center gap-2"
        >
          <FaArrowLeft /> Back to Products
        </Button>
        <div className="d-flex gap-2">
          <Button 
            variant="primary" 
            onClick={() => navigate(`/products/edit/${id}`)}
            className="d-flex align-items-center gap-2"
          >
            <FaEdit /> Edit Product
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
                    style={{ maxHeight: '400px', objectFit: 'contain' }}
                  />
                ) : (
                  <div 
                    className="bg-light rounded d-flex align-items-center justify-content-center"
                    style={{ height: '400px' }}
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
                        width: '80px', 
                        height: '80px', 
                        border: selectedImage === index ? '2px solid #0d6efd' : '1px solid #dee2e6',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        cursor: 'pointer'
                      }}
                    >
                      <Image
                        src={image.path}
                        alt={`${product.name} - ${index + 1}`}
                        fluid
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
                  bg={product.quantity > 0 ? 'success' : 'danger'}
                  className="px-3 py-2 fs-6"
                >
                  {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
                </Badge>
                <Badge 
                  bg={product.status === "1" ? 'success' : 'secondary'}
                  className="px-3 py-2 fs-6"
                >
                  {product.status === "1" ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              {/* Categories Section */}
              {product.categories && product.categories.length > 0 && (
                <div className="mb-4">
                  <h5 className="mb-3 d-flex align-items-center gap-2">
                    <FaLayerGroup /> Categories
                  </h5>
                  <div className="d-flex flex-wrap gap-2">
                    {product.categories.map(category => (
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
                    {product.tags.map(tag => (
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
                        style={{ height: '200px', objectFit: 'cover' }}
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
                          onClick={() => navigate(`/products/${item.product_id}`)}
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