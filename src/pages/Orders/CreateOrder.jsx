import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Button, Row, Col, Table, Alert, ProgressBar, OverlayTrigger, Tooltip, Badge } from 'react-bootstrap';
import { FaSearch, FaSpinner, FaPlus, FaTrash, FaUser, FaShoppingCart, FaCreditCard, FaTruck, FaInfoCircle, FaArrowLeft } from 'react-icons/fa';
import axiosInstance from '../../config/axios';
import { toast } from 'react-hot-toast';
import Select from 'react-select/async';
import '../Categories/Categories.css';
import '../Products/AddProduct.css';

const CreateOrder = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    user_id: null,
    coupon_id: null,
    shipping_id: null,
    shipping_charge: 0,
    product_subtotal: 0,
    total: 0,
    payment_type: 1,
    trxed: '',
    paymentphone: '',
    user_name: '',
    address: '',
    userphone: '',
    products: []
  });

  const [selectedProducts, setSelectedProducts] = useState([]);
  const [shippingAddresses, setShippingAddresses] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [isGuest, setIsGuest] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Load coupons on component mount
  useEffect(() => {
    fetchCoupons();
  }, []);

  // Fetch shipping addresses when user is selected
  useEffect(() => {
    if (formData.user_id) {
      fetchShippingAddresses(formData.user_id);
    } else {
      setShippingAddresses([]);
    }
  }, [formData.user_id]);

  // Update progress based on form completion
  useEffect(() => {
    let progress = 0;
    if (selectedProducts.length > 0) progress += 25;
    if (formData.user_id || (isGuest && formData.user_name && formData.address)) progress += 25;
    if (formData.shipping_id || (isGuest && formData.address)) progress += 25;
    if (formData.payment_type && (formData.payment_type === 1 || (formData.payment_type === 2 && formData.trxed && formData.paymentphone))) progress += 25;
    setCurrentStep(Math.ceil(progress / 25));
  }, [formData, isGuest, selectedProducts]);

  // Ensure totals are updated when selectedProducts changes
  useEffect(() => {
    updateTotals();
  }, [selectedProducts]);

  const fetchCoupons = async () => {
    try {
      const response = await axiosInstance.get('/coupons');
      if (response.data.success) {
        setCoupons(response.data.data);
      } else {
        toast.error(response.data.message || 'Failed to fetch coupons');
      }
    } catch (error){
      toast.error(error.response?.data?.message || 'Failed to fetch coupons');
    }
  };

  const fetchShippingAddresses = async (userId) => {
    try {
      const response = await axiosInstance.get(`/shipping-addresses/${userId}`);
      if (response.data.success) {
        setShippingAddresses(response.data.data);
      } else {
        toast.error(response.data.message || 'Failed to fetch shipping addresses');
      }
    } catch (error){
      toast.error(error.response?.data?.message || 'Failed to fetch shipping addresses');
    }
  };

  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      minHeight: '42px',
      border: state.isFocused ? '1px solid #80bdff' : '1px solid #ced4da',
      boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(0,123,255,.25)' : 'none',
      '&:hover': {
        borderColor: state.isFocused ? '#80bdff' : '#ced4da'
      },
      backgroundColor: state.isDisabled ? '#e9ecef' : 'white',
      cursor: state.isDisabled ? 'not-allowed' : 'default'
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      marginTop: '4px'
    }),
    menuList: (provided) => ({
      ...provided,
      padding: '4px 0',
      maxHeight: '300px',
      position: 'relative'
    }),
    option: (provided, state) => ({
      ...provided,
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      backgroundColor: state.isSelected 
        ? '#e9ecef' 
        : state.isFocused 
          ? '#f8f9fa' 
          : 'white',
      color: '#212529',
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: '#f8f9fa'
      },
      '&:active': {
        backgroundColor: '#e9ecef'
      }
    }),
    singleValue: (provided) => ({
      ...provided,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      margin: '0',
      color: '#212529'
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: '2px 8px'
    }),
    input: (provided) => ({
      ...provided,
      margin: '0',
      padding: '0'
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#6c757d',
      margin: '0'
    }),
    noOptionsMessage: (provided) => ({
      ...provided,
      color: '#6c757d',
      padding: '12px 16px'
    }),
    loadingMessage: (provided) => ({
      ...provided,
      color: '#6c757d',
      padding: '12px 16px'
    }),
    clearIndicator: (provided) => ({
      ...provided,
      padding: '4px',
      cursor: 'pointer',
      color: '#6c757d',
      '&:hover': {
        color: '#21292c'
      }
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      padding: '4px',
      cursor: 'pointer',
      color: '#6c757d',
      '&:hover': {
        color: '#21292c'
      }
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: '#e9ecef',
      borderRadius: '4px',
      margin: '2px'
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: '#212529',
      padding: '2px 6px'
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: '#6c757d',
      padding: '2px 6px',
      '&:hover': {
        backgroundColor: '#dee2e6',
        color: '#21292c'
      }
    })
  };

  const formatOptionLabel = ({ label, subLabel, image }) => (
    <div className="d-flex align-items-center gap-2 w-100">
      {image && (
        <div style={{ 
          width: '40px', 
          height: '40px', 
          flexShrink: 0,
          borderRadius: '4px',
          overflow: 'hidden',
          border: '1px solid #dee2e6'
        }}>
          <img 
            src={image} 
            alt={label} 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover'
            }} 
          />
        </div>
      )}
      <div className="flex-grow-1">
        <div className="fw-medium">{label}</div>
        {subLabel && (
          <div className="small text-muted" style={{ fontSize: '0.875rem' }}>
            {subLabel}
          </div>
        )}
      </div>
    </div>
  );

  const loadUsers = async (inputValue) => {
    try {
      const response = await axiosInstance.get('/clints', {
        params: { search: inputValue }
      });
      if (response.data.success) {
        return response.data.data.map(user => ({
          value: user.id,
          label: user.name,
          subLabel: `${user.email || ''} ${user.phone ? `- ${user.phone}` : ''}`.trim(),
          image: user.avatar || null
        }));
      }
      return [];
    } catch (error){
      toast.error(error.response?.data?.message || 'Failed to fetch users');
      return [];
    }
  };

  const loadProducts = async (inputValue) => {
    try {
      const response = await axiosInstance.get('/products', {
        params: { search: inputValue }
      });
      if (response.data.success) {
        return response.data.data.map(product => ({
          value: product.id,
          label: product.name,
          subLabel: `৳${product.price.toLocaleString()}`,
          price: product.price,
          image: product.images?.[0],
          stock: product.stock || 0
        }));
      }
      return [];
    } catch (error){
      toast.error(error.response?.data?.message || 'Failed to fetch products');
      return [];
    }
  };

  const handleUserChange = (selectedOption) => {
    if (selectedOption) {
      // Existing user selected
      setFormData(prev => ({
        ...prev,
        user_id: selectedOption.value,
        shipping_id: null, // Reset shipping_id when user changes
        // Clear guest user fields
        user_name: '',
        address: '',
        userphone: ''
      }));
      setIsGuest(false);
      // Fetch shipping addresses for the selected user
      fetchShippingAddresses(selectedOption.value);
    } else {
      // User selection cleared
      setFormData(prev => ({
        ...prev,
        user_id: null,
        shipping_id: null,
        // Clear guest user fields
        user_name: '',
        address: '',
        userphone: ''
      }));
      setShippingAddresses([]); // Clear shipping addresses
    }
    setValidationErrors(prev => ({ 
      ...prev, 
      user_id: null,
      shipping_id: null 
    }));
  };

  const handleShippingAddressChange = (e) => {
    const shippingId = e.target.value ? parseInt(e.target.value) : null;
    setFormData(prev => ({ 
      ...prev, 
      shipping_id: shippingId 
    }));
    setValidationErrors(prev => ({ 
      ...prev, 
      shipping_id: null 
    }));
  };

  const handleProductSelect = (selectedOption) => {
    if (!selectedOption) return;

    const existingProduct = selectedProducts.find(p => p.product_id === selectedOption.value);
    if (existingProduct) {
      setSelectedProducts(prev => prev.map(p => 
        p.product_id === selectedOption.value 
          ? { ...p, quantity: p.quantity + 1 }
          : p
      ));
    } else {
      setSelectedProducts(prev => [...prev, {
        product_id: selectedOption.value,
        quantity: 1,
        name: selectedOption.label,
        price: selectedOption.price,
        image: selectedOption.image
      }]);
    }
    updateTotals();
    setValidationErrors(prev => ({ ...prev, products: null }));
  };

  const updateProductQuantity = (productId, quantity) => {
    if (quantity < 1) return;
    setSelectedProducts(prev => prev.map(p => 
      p.product_id === productId ? { ...p, quantity } : p
    ));
    updateTotals();
  };

  const removeProduct = (productId) => {
    setSelectedProducts(prev => prev.filter(p => p.product_id !== productId));
    updateTotals();
  };

  const updateTotals = () => {
    const subtotal = selectedProducts.reduce((sum, product) => 
      sum + (product.price * product.quantity), 0);
    
    setFormData(prev => ({
      ...prev,
      product_subtotal: subtotal,
      total: subtotal + (prev.shipping_charge || 0)
    }));
  };

  const validateForm = () => {
    const errors = {};
    
    if (selectedProducts.length === 0) {
      errors.products = 'Please add at least one product';
    }

    if (isGuest) {
      // Validate guest user fields
      if (!formData.user_name) errors.user_name = 'Guest name is required';
      if (!formData.address) errors.address = 'Guest address is required';
      if (!formData.userphone) errors.userphone = 'Guest phone is required';
    } else {
      // Validate existing user fields
      if (!formData.user_id) {
        errors.user_id = 'Please select a customer';
      }
      // Only validate shipping_id if user is selected and not a guest
      if (formData.user_id && !formData.shipping_id) {
        errors.shipping_id = 'Please select a shipping address';
      }
    }

    // Payment validation
    if (formData.payment_type === 2) {
      if (!formData.trxed?.trim()) errors.trxed = 'Transaction ID is required';
      if (!formData.paymentphone?.trim()) errors.paymentphone = 'Payment phone is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        ...formData,
        // If guest user, ensure user_id and shipping_id are null
        user_id: isGuest ? null : formData.user_id,
        shipping_id: isGuest ? null : formData.shipping_id,
        products: selectedProducts.map(p => ({
          product_id: p.product_id,
          quantity: p.quantity
        }))
      };

      const response = await axiosInstance.post('/orders/place-order', orderData);
      
      if (response.data.success) {
        toast.success('Order created successfully');
        navigate('/orders');
      } else {
        throw new Error(response.data.message || 'Failed to create order');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const renderProgressBar = () => (
    <div className="mb-4">
      <div className="d-flex justify-content-between mb-2">
        <span className="text-muted">Order Progress</span>
        <span className="text-primary">Step {currentStep} of 4</span>
      </div>
      <ProgressBar now={currentStep * 25} className="mb-2" />
      <div className="d-flex justify-content-between small text-muted">
        <span>Products</span>
        <span>Customer</span>
        <span>Shipping</span>
        <span>Payment</span>
      </div>
    </div>
  );

  const renderOrderSummary = () => (
    <Card className="mb-4 sticky-top" style={{ top: '20px' }}>
      <Card.Header className="bg-light">
        <h5 className="mb-0">Order Summary</h5>
      </Card.Header>
      <Card.Body>
        <div className="mb-3">
          <div className="d-flex justify-content-between mb-2">
            <span>Products ({selectedProducts.length})</span>
            <span>৳{formData.product_subtotal.toLocaleString()}</span>
          </div>
          <div className="d-flex justify-content-between mb-2">
            <span>Shipping</span>
            <span>৳{formData.shipping_charge.toLocaleString()}</span>
          </div>
          {formData.coupon_id && (
            <div className="d-flex justify-content-between mb-2 text-success">
              <span>Coupon Discount</span>
              <span>-৳{(formData.product_subtotal * (coupons.find(c => c.id === formData.coupon_id)?.discount || 0) / 100).toLocaleString()}</span>
            </div>
          )}
          <hr />
          <div className="d-flex justify-content-between fw-bold">
            <span>Total</span>
            <span>৳{formData.total.toLocaleString()}</span>
          </div>
        </div>
        <Button
          type="submit"
          variant="primary"
          className="w-100"
          disabled={loading || selectedProducts.length === 0}
        >
          {loading ? (
            <>
              <FaSpinner className="spinner" /> Creating Order...
            </>
          ) : (
            'Create Order'
          )}
        </Button>
      </Card.Body>
    </Card>
  );

  return (
    <div className="categories-container">
      <Card>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <Button
                variant="link"
                className="p-0 mb-2 text-decoration-none"
                onClick={() => navigate('/orders')}
              >
                <FaArrowLeft className="me-2" /> Back to Orders
              </Button>
              <h2 className="mb-0">Create New Order</h2>
            </div>
          </div>

          {renderProgressBar()}

          <Form onSubmit={handleSubmit} className="add-product-form">
            <Row>
              <Col lg={8}>
                <h5 className="mb-3 mt-4 d-flex align-items-center">
                  <FaUser className="me-2" /> Customer Information
                </h5>
                <hr />
                <Form.Group className="mb-3">
                  <Form.Label>
                    Customer
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip>Search for an existing customer or create a guest order</Tooltip>}
                    >
                      <FaInfoCircle className="ms-2 text-muted" />
                    </OverlayTrigger>
                  </Form.Label>
                  <div className="d-flex gap-2 align-items-center">
                    <div style={{ flex: 1 }}>
                      <Select
                        isClearable
                        cacheOptions
                        defaultOptions
                        loadOptions={loadUsers}
                        onChange={handleUserChange}
                        placeholder="Search customer by name, email or phone..."
                        isDisabled={isGuest}
                        styles={customSelectStyles}
                        formatOptionLabel={formatOptionLabel}
                        className={validationErrors.user_id ? 'is-invalid' : ''}
                        noOptionsMessage={() => "No customers found"}
                        loadingMessage={() => "Searching customers..."}
                        classNamePrefix="customer-select"
                      />
                      {validationErrors.user_id && (
                        <div className="invalid-feedback d-block">
                          {validationErrors.user_id}
                        </div>
                      )}
                    </div>
                    <Form.Check
                      type="checkbox"
                      label="Guest Customer"
                      checked={isGuest}
                      onChange={(e) => {
                        setIsGuest(e.target.checked);
                        if (e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            user_id: null,
                            shipping_id: null
                          }));
                        }
                      }}
                    />
                  </div>
                </Form.Group>

                {isGuest && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>Guest Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.user_name}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, user_name: e.target.value }));
                          setValidationErrors(prev => ({ ...prev, user_name: null }));
                        }}
                        isInvalid={!!validationErrors.user_name}
                        placeholder="Enter guest name"
                      />
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.user_name}
                      </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Guest Phone</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.userphone}
                        onChange={(e) => setFormData(prev => ({ ...prev, userphone: e.target.value }))}
                        placeholder="Enter guest phone number"
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Guest Address</Form.Label>
                      <Form.Control
                        as="textarea"
                        value={formData.address}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, address: e.target.value }));
                          setValidationErrors(prev => ({ ...prev, address: null }));
                        }}
                        isInvalid={!!validationErrors.address}
                        placeholder="Enter complete delivery address"
                        rows={3}
                      />
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.address}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </>
                )}

                {!isGuest && formData.user_id && (
                  <Form.Group className="mb-3">
                    <Form.Label>Shipping Address</Form.Label>
                    <Form.Select
                      value={formData.shipping_id || ''}
                      onChange={handleShippingAddressChange}
                      isInvalid={!!validationErrors.shipping_id}
                    >
                      <option value="">Select shipping address</option>
                      {shippingAddresses.map(address => (
                        <option key={address.id} value={address.id}>
                          {address.f_name} {address.l_name} - {address.address}, {address.city}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {validationErrors.shipping_id}
                    </Form.Control.Feedback>
                  </Form.Group>
                )}

                <h5 className="mb-3 mt-4 d-flex align-items-center">
                  <FaShoppingCart className="me-2" /> Products
                </h5>
                <hr />
                <Form.Group className="mb-4">
                  <Form.Label>
                    Add Products
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip>Search and add products to the order</Tooltip>}
                    >
                      <FaInfoCircle className="ms-2 text-muted" />
                    </OverlayTrigger>
                  </Form.Label>
                  <Select
                    isClearable
                    cacheOptions
                    defaultOptions
                    loadOptions={loadProducts}
                    onChange={handleProductSelect}
                    placeholder="Search products by name..."
                    styles={customSelectStyles}
                    formatOptionLabel={formatOptionLabel}
                    noOptionsMessage={() => "No products found"}
                    loadingMessage={() => "Searching products..."}
                    classNamePrefix="product-select"
                  />
                  {validationErrors.products && (
                    <div className="invalid-feedback d-block">
                      {validationErrors.products}
                    </div>
                  )}
                </Form.Group>

                {selectedProducts.length > 0 && (
                  <div className="table-responsive">
                    <Table className="table-hover align-middle">
                      <thead className="bg-light">
                        <tr>
                          <th style={{ width: '40%' }}>Product</th>
                          <th>Price</th>
                          <th style={{ width: '120px' }}>Quantity</th>
                          <th>Total</th>
                          <th style={{ width: '80px' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedProducts.map(product => (
                          <tr key={product.product_id}>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                {product.image && (
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                                  />
                                )}
                                <div>
                                  <div>{product.name}</div>
                                  <small className="text-muted">৳{product.price}</small>
                                </div>
                              </div>
                            </td>
                            <td>৳{product.price}</td>
                            <td>
                              <Form.Control
                                type="number"
                                min="1"
                                value={product.quantity}
                                onChange={(e) => updateProductQuantity(product.product_id, parseInt(e.target.value))}
                                className="text-center"
                              />
                            </td>
                            <td>৳{product.price * product.quantity}</td>
                            <td>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => removeProduct(product.product_id)}
                                className="w-100"
                              >
                                <FaTrash />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}

                <h5 className="mb-3 mt-4 d-flex align-items-center">
                  <FaCreditCard className="me-2" /> Payment Information
                </h5>
                <hr />
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Coupon</Form.Label>
                      <Form.Select
                        value={formData.coupon_id || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, coupon_id: e.target.value ? parseInt(e.target.value) : null }))}
                      >
                        <option value="">Select coupon</option>
                        {coupons.map(coupon => (
                          <option key={coupon.id} value={coupon.id}>
                            {coupon.code} - {coupon.discount}% off
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Shipping Charge</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        value={formData.shipping_charge}
                        onChange={(e) => {
                          const charge = parseFloat(e.target.value) || 0;
                          setFormData(prev => ({
                            ...prev,
                            shipping_charge: charge,
                            total: prev.product_subtotal + charge
                          }));
                        }}
                        placeholder="Enter shipping charge"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Payment Method</Form.Label>
                      <Form.Select
                        value={formData.payment_type}
                        onChange={(e) => setFormData(prev => ({ ...prev, payment_type: parseInt(e.target.value) }))}
                      >
                        <option value={1}>Cash on Delivery</option>
                        <option value={2}>Mobile Banking (Bkash)</option>
                      </Form.Select>
                    </Form.Group>

                    {formData.payment_type === 2 && (
                      <>
                        <Form.Group className="mb-3">
                          <Form.Label>Transaction ID</Form.Label>
                          <Form.Control
                            type="text"
                            value={formData.trxed}
                            onChange={(e) => {
                              setFormData(prev => ({ ...prev, trxed: e.target.value }));
                              setValidationErrors(prev => ({ ...prev, trxed: null }));
                            }}
                            isInvalid={!!validationErrors.trxed}
                            placeholder="Enter Bkash transaction ID"
                          />
                          <Form.Control.Feedback type="invalid">
                            {validationErrors.trxed}
                          </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>Payment Phone</Form.Label>
                          <Form.Control
                            type="text"
                            value={formData.paymentphone}
                            onChange={(e) => {
                              setFormData(prev => ({ ...prev, paymentphone: e.target.value }));
                              setValidationErrors(prev => ({ ...prev, paymentphone: null }));
                            }}
                            isInvalid={!!validationErrors.paymentphone}
                            placeholder="Enter Bkash payment phone number"
                          />
                          <Form.Control.Feedback type="invalid">
                            {validationErrors.paymentphone}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </>
                    )}
                  </Col>
                </Row>
              </Col>

              <Col lg={4}>
                {renderOrderSummary()}
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default CreateOrder; 