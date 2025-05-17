import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSpinner, FaChevronLeft, FaChevronRight, FaSearch, FaFilter, FaEye, FaPencilAlt, FaChevronDown } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Card, Badge, Pagination, Form, InputGroup, Button, Modal, Row, Col, Dropdown } from 'react-bootstrap';
import axiosInstance from '../../config/axios';
import Loading from '../../components/Loading';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 5,
    totalPages: 1,
    totalRows: 0,
    hasMorePages: false
  });
  const [searchParams, setSearchParams] = useState({
    search: '',
    minPrice: '',
    maxPrice: '',
    limit: 10
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showQuickEdit, setShowQuickEdit] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    short_description: '',
    quantity: '',
    price: '',
    discount: ''
  });
  const navigate = useNavigate();
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [statusToggleLoading, setStatusToggleLoading] = useState({});

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await fetchProducts();
      } finally {
        setPageLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeoutId = setTimeout(() => {
      if (searchParams.search !== '') {
        setIsSearching(true);
        fetchProducts(1);
      }
    }, 500); // 500ms debounce

    setSearchTimeout(timeoutId);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [searchParams.search]);

  const fetchProducts = async (page = 1) => {
    setLoading(true);
    setTableLoading(true);
    try {
      // Build query parameters
      const params = {
        page,
        limit: searchParams.limit,
        ...(searchParams.search && { search: searchParams.search }),
        ...(searchParams.minPrice && { min_price: searchParams.minPrice }),
        ...(searchParams.maxPrice && { max_price: searchParams.maxPrice })
      };

      const response = await axiosInstance.get('/products', { params });
      const result = response.data;

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch products');
      }

      await new Promise(resolve => setTimeout(resolve, 300));

      setProducts(result.data);
      setPagination({
        currentPage: result.pagination.current_page,
        perPage: result.pagination.per_page,
        totalPages: result.pagination.total_pages,
        totalRows: result.pagination.total_rows,
        hasMorePages: result.pagination.has_more_pages
      });
    } catch (err) {
      console.error('Error fetching products:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch products';
      toast.error(errorMessage);
      
      setProducts([]);
      setPagination({
        currentPage: 1,
        perPage: searchParams.limit,
        totalPages: 1,
        totalRows: 0,
        hasMorePages: false
      });
    } finally {
      setLoading(false);
      setTableLoading(false);
      setIsSearching(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'search') {
      setPagination(prev => ({
        ...prev,
        currentPage: 1
      }));
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    setIsSearching(true);
    fetchProducts(1);
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setShowFilters(false);
    fetchProducts(1);
  };

  const handleResetFilters = () => {
    setSearchParams({
      search: '',
      minPrice: '',
      maxPrice: '',
      limit: 5
    });
    setShowFilters(false);
    fetchProducts(1);
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        setTableLoading(true); // Show loading state during deletion
        const token = localStorage.getItem('token'); // Get token from localStorage
        
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

        // Add a small delay to make the transition smoother
        await new Promise(resolve => setTimeout(resolve, 300));

        setProducts(products.filter(prod => prod.id !== id));
        toast.success('Product deleted successfully');
        
        // Refresh current page if it becomes empty
        if (products.length === 1 && pagination.currentPage > 1) {
          fetchProducts(pagination.currentPage - 1);
        }
      } catch (err) {
        console.error('Error deleting product:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Failed to delete product';
        toast.error(errorMessage);
        
        // If token is invalid or expired, redirect to login
        if (err.response?.status === 401) {
          localStorage.removeItem('token'); // Clear invalid token
          navigate('/login'); // Redirect to login page
        }
      } finally {
        setTableLoading(false); // Hide loading state
      }
    }
  };

  const handlePageChange = (page) => {
    fetchProducts(page);
  };

  const handleQuickEdit = (product) => {
    setSelectedProduct(product);
    setEditForm({
      name: product.name || '',
      description: product.description || '',
      short_description: product.short_description || '',
      quantity: product.quantity || '',
      price: product.price || '',
      discount: product.discount || ''
    });
    setShowQuickEdit(true);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQuickEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found. Please login again.');
      }

      const response = await axiosInstance.put(`/products/update/${selectedProduct.id}`, editForm, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = response.data;

      if (!result.success) {
        throw new Error(result.message || 'Failed to update product');
      }

      // Update the product in the list
      setProducts(products.map(prod => 
        prod.id === selectedProduct.id 
          ? { ...prod, ...editForm }
          : prod
      ));

      toast.success('Product updated successfully');
      setShowQuickEdit(false);
    } catch (err) {
      console.error('Error updating product:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update product';
      toast.error(errorMessage);
      
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setEditLoading(false);
    }
  };

  const handleStatusToggle = async (productId) => {
    if (statusToggleLoading[productId]) return; // Prevent multiple clicks
    
    try {
      setStatusToggleLoading(prev => ({ ...prev, [productId]: true }));
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please login again');
        navigate('/login');
        return;
      }

      // Using the exact API endpoint format provided
      const response = await axiosInstance.post(`/products/toggle-status/${productId}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.data) {
        throw new Error('No response received from server');
      }

      // Update the product status in the list
      setProducts(prevProducts => 
        prevProducts.map(prod => 
          prod.id === productId 
            ? { ...prod, status: prod.status === "1" ? "0" : "1" }
            : prod
        )
      );

      toast.success('Status updated successfully');
    } catch (err) {
      console.error('Toggle status error:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });

      if (err.response?.status === 401) {
        toast.error('Session expired. Please login again');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        toast.error(err.response?.data?.message || 'Failed to update status');
      }
    } finally {
      setStatusToggleLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  const renderPagination = () => {
    const items = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, pagination.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    items.push(
      <Pagination.Prev 
        key="prev" 
        onClick={() => handlePageChange(pagination.currentPage - 1)}
        disabled={pagination.currentPage === 1}
      >
        <FaChevronLeft size={12} />
      </Pagination.Prev>
    );

    // First page
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

    // Page numbers
    for (let number = startPage; number <= endPage; number++) {
      items.push(
        <Pagination.Item 
          key={number} 
          active={number === pagination.currentPage}
          onClick={() => handlePageChange(number)}
        >
          {number}
        </Pagination.Item>
      );
    }

    // Last page
    if (endPage < pagination.totalPages) {
      if (endPage < pagination.totalPages - 1) {
        items.push(<Pagination.Ellipsis key="ellipsis2" disabled />);
      }
      items.push(
        <Pagination.Item 
          key={pagination.totalPages} 
          onClick={() => handlePageChange(pagination.totalPages)}
        >
          {pagination.totalPages}
        </Pagination.Item>
      );
    }

    // Next button
    items.push(
      <Pagination.Next 
        key="next" 
        onClick={() => handlePageChange(pagination.currentPage + 1)}
        disabled={!pagination.hasMorePages}
      >
        <FaChevronRight size={12} />
      </Pagination.Next>
    );

    return items;
  };

  if (pageLoading) {
    return <Loading />;
  }

  return (
    <div className="container-fluid p-0">
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h4 className="mb-1">Products</h4>
              {loading ? (
                <div className="d-flex align-items-center">
                  <FaSpinner className="spinner-border spinner-border-sm me-2" />
                  <p className="text-muted mb-0">Loading products...</p>
                </div>
              ) : (
                <p className="text-muted mb-0">
                  Showing {products.length} of {pagination.totalRows} products
                </p>
              )}
            </div>
            <div className="d-flex gap-2">
              <Form onSubmit={handleSearch} className="d-flex gap-2">
                <InputGroup>
                  <InputGroup.Text>
                    {isSearching ? (
                      <FaSpinner className="spinner-border spinner-border-sm" />
                    ) : (
                      <FaSearch />
                    )}
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search products..."
                    name="search"
                    value={searchParams.search}
                    onChange={handleFilterChange}
                    disabled={loading}
                    className={isSearching ? 'searching' : ''}
                  />
                  {searchParams.search && !isSearching && (
                    <Button
                      variant="outline-secondary"
                      onClick={() => {
                        setSearchParams(prev => ({ ...prev, search: '' }));
                        fetchProducts(1);
                      }}
                      disabled={loading}
                    >
                      ×
                    </Button>
                  )}
                </InputGroup>
                <Button 
                  variant="outline-secondary" 
                  onClick={() => setShowFilters(true)}
                  title="Filter"
                  disabled={loading}
                >
                  <FaFilter />
                </Button>
              </Form>
              <button 
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={() => navigate('/products/add')}
                disabled={loading}
              >
                {loading ? <FaSpinner className="spinner-border spinner-border-sm" /> : <FaPlus />} Add Product
              </button>
            </div>
          </div>

          {/* Filter Modal */}
          <Modal show={showFilters} onHide={() => !loading && setShowFilters(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Filter Products</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleFilterSubmit}>
              <Modal.Body>
                {loading ? (
                  <div className="text-center py-4">
                    <Loading />
                    <p className="text-muted mt-2 mb-0">Applying filters...</p>
                  </div>
                ) : (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>Price Range</Form.Label>
                      <div className="d-flex gap-2">
                        <Form.Control
                          type="number"
                          placeholder="Min Price"
                          name="minPrice"
                          value={searchParams.minPrice}
                          onChange={handleFilterChange}
                          min="0"
                          disabled={loading}
                        />
                        <Form.Control
                          type="number"
                          placeholder="Max Price"
                          name="maxPrice"
                          value={searchParams.maxPrice}
                          onChange={handleFilterChange}
                          min="0"
                          disabled={loading}
                        />
                      </div>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Items per page</Form.Label>
                      <Form.Select
                        name="limit"
                        value={searchParams.limit}
                        onChange={handleFilterChange}
                        disabled={loading}
                      >
                        <option value="5">5 per page</option>
                        <option value="10">10 per page</option>
                        <option value="20">20 per page</option>
                        <option value="50">50 per page</option>
                      </Form.Select>
                    </Form.Group>
                  </>
                )}
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleResetFilters} disabled={loading}>
                  Reset Filters
                </Button>
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <FaSpinner className="spinner-border spinner-border-sm me-2" />
                      Applying...
                    </>
                  ) : (
                    'Apply Filters'
                  )}
                </Button>
              </Modal.Footer>
            </Form>
          </Modal>

          {/* Quick Edit Modal */}
          <Modal show={showQuickEdit} onHide={() => !editLoading && setShowQuickEdit(false)} size="lg">
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
                      <FaSpinner className="spinner-border spinner-border-sm" />
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

          <div className="table-responsive position-relative">
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
                    {loading ? 'Loading products...' : 'Updating products...'}
                  </p>
                </div>
              </div>
            )}
            
            {loading && !tableLoading ? (
              <div className="text-center py-5">
                <Loading />
                <p className="text-muted mt-3 mb-0">Loading products...</p>
              </div>
            ) : products.length > 0 ? (
              <table className="table table-hover align-middle">
                <thead className="bg-light">
                  <tr>
                    <th>ID</th>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>{product.id}</td>
                      <td>
                        {product.image_paths && product.image_paths.length > 0 ? (
                          <img 
                            src={product.image_paths[0]} 
                            alt={product.name}
                            className="rounded img-thumbnail"
                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                          />
                        ) : (
                          <div 
                            className="rounded bg-light d-flex align-items-center justify-content-center"
                            style={{ width: '50px', height: '50px' }}
                          >
                            <span className="text-muted small">No image</span>
                          </div>
                        )}
                      </td>
                      <td>
                        <div>
                          <h6 className="mb-0">{product.name}</h6>
                          <small className="text-muted">{product.short_description}</small>
                        </div>
                      </td>
                      <td>
                        <p className="mb-0 text-truncate" style={{ maxWidth: '200px' }}>
                          {product.description}
                        </p>
                      </td>
                      <td>
                        <div>
                          <span className="fw-semibold">৳{product.price}</span>
                          {product.discount > 0 && (
                            <Badge bg="danger" className="ms-2">
                              -{product.discount}%
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td>
                        <Badge 
                          bg={product.quantity > 0 ? 'success' : 'danger'}
                          className="px-2 py-1"
                        >
                          {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
                        </Badge>
                      </td>
                      <td>
                        <Badge 
                          bg={product.status === "1" ? 'success' : 'secondary'}
                          className="px-2 py-1"
                          role="button"
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleStatusToggle(product.id)}
                          title="Click to toggle status"
                        >
                          {statusToggleLoading[product.id] ? (
                            <FaSpinner className="spinner-border spinner-border-sm" />
                          ) : (
                            product.status === "1" ? 'Active' : 'Inactive'
                          )}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => navigate(`/products/${product.id}`)}
                            title="View"
                            disabled={loading}
                          >
                            <FaEye />
                          </button>
                          <Dropdown>
                            <Dropdown.Toggle 
                              variant="outline-primary" 
                              size="sm"
                              disabled={loading}
                              className="d-flex align-items-center gap-1"
                            >
                              <FaEdit /> Edit <FaChevronDown size={10} />
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              <Dropdown.Item 
                                onClick={() => handleQuickEdit(product)}
                                className="d-flex align-items-center gap-2"
                              >
                                <FaPencilAlt size={12} /> Quick Edit
                              </Dropdown.Item>
                              <Dropdown.Item 
                                onClick={() => navigate(`/products/${product.id}`)}
                                className="d-flex align-items-center gap-2"
                              >
                                <FaEdit size={12} /> Full Edit
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteProduct(product.id)}
                            title="Delete"
                            disabled={loading}
                          >
                            {loading ? <FaSpinner className="spinner-border spinner-border-sm" /> : <FaTrash />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-5">
                <p className="text-muted mb-0">No products found</p>
              </div>
            )}
          </div>

          {pagination.totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4 position-relative">
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
              <Pagination className="mb-0">
                {renderPagination()}
              </Pagination>
            </div>
          )}
        </Card.Body>
      </Card>

      <style jsx>{`
        .searching {
          background-color: #f8f9fa;
        }
        .form-control:focus {
          box-shadow: none;
          border-color: #dee2e6;
        }
        .form-control:focus.searching {
          background-color: #f8f9fa;
        }
      `}</style>
    </div>
  );
};

export default Products; 