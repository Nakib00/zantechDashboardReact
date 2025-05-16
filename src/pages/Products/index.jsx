import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSpinner, FaChevronLeft, FaChevronRight, FaSearch, FaFilter } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Card, Badge, Pagination, Form, InputGroup, Button, Modal } from 'react-bootstrap';
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
    limit: 5
  });
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

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
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(1);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
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
                    {loading ? <FaSpinner className="spinner-border spinner-border-sm" /> : <FaSearch />}
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search products..."
                    name="search"
                    value={searchParams.search}
                    onChange={handleFilterChange}
                    disabled={loading}
                  />
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
                        >
                          {product.status === "1" ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => navigate(`/products/edit/${product.id}`)}
                            title="Edit"
                            disabled={loading}
                          >
                            <FaEdit />
                          </button>
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
    </div>
  );
};

export default Products; 