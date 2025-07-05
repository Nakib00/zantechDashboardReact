import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaPlus, FaTimes, FaTag, FaBox, FaBoxes, FaImages, FaDollarSign, FaPercent, FaSave, FaTags, FaSearch, FaSpinner } from 'react-icons/fa';
import axiosInstance from '../../config/axios';
import Loading from '../../components/Loading';
import JoditEditor from 'jodit-react';
import './AddProduct.css';
import AsyncSelect from 'react-select/async';

const AddProduct = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [isBundle, setIsBundle] = useState(false);
  const [bundleItems, setBundleItems] = useState([
    { item_id: '', bundle_quantity: 1, unit_price: 0, name: '', total: 0 }
  ]);
  const [selectedTags, setSelectedTags] = useState(['']);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    short_description: '',
    quantity: '',
    price: '',
    discount: '',
    categories: [],
    tags: [],
    images: [],
    is_bundle: 0,
    bundls_item: []
  });
  const [imagePreview, setImagePreview] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [imageError, setImageError] = useState('');
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
    const loadInitialData = async () => {
      try {
        await Promise.all([fetchCategories(), fetchProducts()]);
      } finally {
        setPageLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get('/categories');
      setCategories(response.data.data || []);
    } catch {
      toast.error('Failed to fetch categories');
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axiosInstance.get('/products');
      setProducts(response.data.data || []);
    } catch {
      toast.error('Failed to fetch products');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateImage = (file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
    const maxSize = 4 * 1024 * 1024; // 4MB in bytes

    if (!validTypes.includes(file.type)) {
      return 'Invalid file type. Only JPEG, PNG, JPG, and GIF are allowed.';
    }

    if (file.size > maxSize) {
      return 'File size too large. Maximum size is 4MB.';
    }

    return null;
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageError('');
    
    // Validate each file
    const errors = files.map(file => validateImage(file)).filter(error => error);
    if (errors.length > 0) {
      setImageError(errors[0]);
      return;
    }

    // Create preview URLs
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreview(prev => [...prev, ...previews]);
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setImageError('');

    const files = Array.from(e.dataTransfer.files);
    
    // Validate each file
    const errors = files.map(file => validateImage(file)).filter(error => error);
    if (errors.length > 0) {
      setImageError(errors[0]);
      return;
    }

    // Create preview URLs
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreview(prev => [...prev, ...previews]);
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    
    // Revoke the preview URL to avoid memory leaks
    URL.revokeObjectURL(imagePreview[index]);
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  // Cleanup preview URLs when component unmounts
  useEffect(() => {
    return () => {
      imagePreview.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreview]);

  const handleBundleToggle = (e) => {
    const bundleValue = e.target.checked ? 1 : 0;
    setIsBundle(e.target.checked);
    setFormData(prev => ({
      ...prev,
      is_bundle: bundleValue
    }));
  };

  const handleBundleItemChange = (index, field, value) => {
    const updatedBundleItems = [...bundleItems];
    updatedBundleItems[index][field] = value;
    
    // If item_id changed, update the name and price from the selected product
    if (field === 'item_id' && value) {
      const selectedProduct = products.find(product => product.id.toString() === value);
      if (selectedProduct) {
        updatedBundleItems[index].name = selectedProduct.name;
        updatedBundleItems[index].unit_price = parseFloat(selectedProduct.price) || 0;
      } else {
        updatedBundleItems[index].name = '';
        updatedBundleItems[index].unit_price = 0;
      }
    }
    
    // Recalculate total for this item
    const quantity = field === 'bundle_quantity' ? parseFloat(value) || 0 : parseFloat(updatedBundleItems[index].bundle_quantity) || 0;
    const unitPrice = parseFloat(updatedBundleItems[index].unit_price) || 0;
    updatedBundleItems[index].total = quantity * unitPrice;
    
    setBundleItems(updatedBundleItems);
    
    // Update the formData
    setFormData(prev => ({
      ...prev,
      bundls_item: updatedBundleItems
    }));
  };

  const addBundleItem = () => {
    setBundleItems([...bundleItems, { item_id: '', bundle_quantity: 1, unit_price: 0, name: '', total: 0 }]);
  };

  const removeBundleItem = (index) => {
    const items = [...bundleItems];
    items.splice(index, 1);
    setBundleItems(items);
    
    // Update the formData
    setFormData(prev => ({
      ...prev,
      bundls_item: items
    }));
  };

  const removeTag = (index) => {
    const updatedTags = [...selectedTags];
    updatedTags.splice(index, 1);
    setSelectedTags(updatedTags);
    
    // Update formData with non-empty tags
    setFormData(prev => ({
      ...prev,
      tags: updatedTags.filter(tag => tag.trim() !== '')
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Add basic form fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('short_description', formData.short_description || '');
      formDataToSend.append('quantity', formData.quantity);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('discount', formData.discount || 0);
      formDataToSend.append('is_bundle', formData.is_bundle);
      
      // Add categories
      formData.categories.forEach((category, index) => {
        formDataToSend.append(`categories[${index}]`, category);
      });
      
      // Add tags
      const filteredTags = selectedTags.filter(tag => tag.trim() !== '');
      filteredTags.forEach((tag, index) => {
        formDataToSend.append(`tags[${index}]`, tag);
      });
      
      // Add images
      formData.images.forEach((image, index) => {
        formDataToSend.append(`images[${index}]`, image);
      });
      
      // Add bundle items if this is a bundle
      if (isBundle && bundleItems.length > 0) {
        bundleItems.forEach((item, index) => {
          if (item.item_id) {
            formDataToSend.append(`bundls_item[${index}][item_id]`, item.item_id);
            formDataToSend.append(`bundls_item[${index}][bundle_quantity]`, item.bundle_quantity);
          }
        });
      }

      await axiosInstance.post('/products', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Product added successfully');
      navigate('/products');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  const formatProductOption = (product) => ({
    value: product.id,
    label: (
      <div className="product-option">
        <div className="product-option-image-container">
          {product.image_paths && product.image_paths.length > 0 ? (
            <img 
              src={product.image_paths[0]} 
              alt={product.name}
              className="product-option-image"
            />
          ) : (
            <div className="product-option-image-placeholder">
              <FaBox size={14} />
            </div>
          )}
        </div>
        <div className="product-option-details">
          <div className="product-option-name">{product.name}</div>
          <div className="product-option-meta">
            <span className="product-option-price">৳{product.price}</span>
            {product.quantity > 0 ? (
              <span className="product-option-stock in-stock">In Stock: {product.quantity}</span>
            ) : (
              <span className="product-option-stock out-of-stock">Out of Stock</span>
            )}
          </div>
          {product.short_description && (
            <div className="product-option-description">{product.short_description}</div>
          )}
        </div>
      </div>
    ),
    product: product
  });

  // Async load options for dynamic search
  const loadProductOptions = async (inputValue, callback) => {
    if (!inputValue) {
      callback([]);
      return;
    }
    try {
      const response = await axiosInstance.get('/products', { params: { search: inputValue } });
      const productsData = response.data.data || [];
      callback(productsData.map(formatProductOption));
    } catch {
      callback([]);
    }
  };

  const handleEditorChange = (newContent) => {
    setFormData(prev => ({
      ...prev,
      description: newContent
    }));
  };

  if (pageLoading) {
    return <Loading />;
  }

  return (
    <div className="add-product-container">
      <div className="add-product-header">
        <h2>Add New Product</h2>
        <p className="text-muted">Create a new product with details</p>
      </div>

      <form onSubmit={handleSubmit} className="add-product-form">
        {/* Basic Information Card */}
        <div className="form-card">
          <div className="form-card-header">
            <h3><FaBox /> Basic Information</h3>
          </div>
          <div className="form-card-body">
            <div className="form-group">
              <label htmlFor="name">Product Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-control"
                placeholder="Enter product name"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="short_description">Short Description</label>
                <textarea
                  id="short_description"
                  name="short_description"
                  value={formData.short_description}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Enter a brief description (displayed in listings)..."
                  rows="4"
                ></textarea>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Full Description</label>
              <JoditEditor
                ref={editorRef}
                value={formData.description}
                config={editorConfig}
                tabIndex={1}
                onBlur={handleEditorChange}
                onChange={(newContent) => {
                  setFormData(prev => ({
                    ...prev,
                    description: newContent
                  }));
                }}
              />
            </div>
          </div>
        </div>

        {/* Pricing & Inventory Card */}
        <div className="form-card">
          <div className="form-card-header">
            <h3><FaDollarSign /> Pricing & Inventory</h3>
          </div>
          <div className="form-card-body">
            <div className="form-row three-columns">
              <div className="form-group">
                <label htmlFor="price">Price</label>
                <div className="input-with-icon">
                  <FaDollarSign className="input-icon" />
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="form-control"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="quantity">Quantity</label>
                <div className="input-with-icon">
                  <FaBoxes className="input-icon" />
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className="form-control"
                    min="0"
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="discount">Discount (%)</label>
                <div className="input-with-icon">
                  <FaPercent className="input-icon" />
                  <input
                    type="number"
                    id="discount"
                    name="discount"
                    value={formData.discount}
                    onChange={handleInputChange}
                    className="form-control"
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Categories & Tags Card */}
        <div className="form-card">
          <div className="form-card-header">
            <h3><FaTags /> Categories & Tags</h3>
          </div>
          <div className="form-card-body">
            {/* Categories Selection */}
            <div className="form-group">
              <label htmlFor="categories">Categories</label>
              <div className="category-selection-container">
                <div className="selected-categories">
                  {formData.categories.length > 0 ? (
                    categories
                      .filter(cat => formData.categories.includes(cat.id.toString()))
                      .map(cat => (
                        <div key={cat.id} className="category-chip">
                          <span>{cat.name}</span>
                          <button 
                            type="button" 
                            className="chip-remove" 
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                categories: prev.categories.filter(id => id !== cat.id.toString())
                              }))
                            }}
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ))
                  ) : (
                    <div className="no-categories">No categories selected</div>
                  )}
                </div>
                
                <div className="category-dropdown">
                  <select
                    id="categorySelector"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value && !formData.categories.includes(value)) {
                        setFormData(prev => ({
                          ...prev,
                          categories: [...prev.categories, value]
                        }));
                      }
                      e.target.value = ''; // Reset select after choosing
                    }}
                    className="form-control"
                  >
                    <option value="">+ Add category</option>
                    {categories
                      .filter(cat => !formData.categories.includes(cat.id.toString()))
                      .map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                  </select>
                </div>
                
                {formData.categories.length === 0 && (
                  <div className="form-text error-text">Please select at least one category</div>
                )}
              </div>
            </div>

            {/* Tags Section */}
            <div className="form-group">
              <label><FaTag /> Tags</label>
              
              <div className="tags-selection">
                <div className="tags-input-wrapper">
                  <div className="input-with-icon">
                    <FaTag className="input-icon" />
                    <input
                      type="text"
                      placeholder="Type tags separated by commas (e.g. L298N, Motor Driver, DC Motor)"
                      className="form-control tag-input-main"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.target.value.trim()) {
                          e.preventDefault();
                          // Split the input by commas and trim each tag
                          const newTags = e.target.value.split(',')
                            .map(tag => tag.trim())
                            .filter(tag => tag !== '' && !selectedTags.includes(tag));
                          
                          if (newTags.length > 0) {
                            setSelectedTags([...selectedTags.filter(tag => tag.trim() !== ''), ...newTags, '']);
                          }
                          e.target.value = '';
                        }
                      }}
                    />
                  </div>
                </div>
                
                <div className="selected-tags-container">
                  {selectedTags.filter(tag => tag.trim() !== '').map((tag, index) => (
                    <div key={index} className="tag-chip">
                      <span>{tag}</span>
                      <button 
                        type="button" 
                        className="chip-remove"
                        onClick={() => removeTag(index)}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="tags-hint">
                  <small className="form-text">Type tags separated by commas and press Enter to add them. Tags help customers find your product.</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Images Card */}
        <div className="form-card">
          <div className="form-card-header">
            <h3><FaImages /> Product Images</h3>
          </div>
          <div className="form-card-body">
            <div className="form-group">
              <label 
                htmlFor="images" 
                className={`upload-label ${dragActive ? 'drag-active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="upload-area">
                  <FaImages className="upload-icon" />
                  <div>Drop files here or click to browse</div>
                  <small>Select multiple images (JPEG, PNG, GIF, max 4MB each)</small>
                </div>
                <input
                  type="file"
                  id="images"
                  name="images"
                  onChange={handleImageChange}
                  className="file-input"
                  accept="image/jpeg,image/png,image/jpg,image/gif"
                  multiple
                />
              </label>
              
              {imageError && (
                <div className="error-message">
                  {imageError}
                </div>
              )}
              
              {imagePreview.length > 0 && (
                <div className="image-preview-container">
                  <div className="selected-files">
                    <p>{imagePreview.length} file(s) selected</p>
                  </div>
                  <div className="image-grid">
                    {imagePreview.map((preview, index) => (
                      <div key={index} className="image-preview-item">
                        <img src={preview} alt={`Preview ${index + 1}`} />
                        <button
                          type="button"
                          className="remove-image-btn"
                          onClick={() => removeImage(index)}
                          title="Remove image"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bundle Options Card */}
        <div className="form-card">
          <div className="form-card-header bundle-header">
            <div className="bundle-toggle">
              <h3><FaBoxes /> Bundle Options</h3>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={isBundle}
                  onChange={handleBundleToggle}
                />
                <span className="toggle-slider"></span>
                <span className="toggle-label">{isBundle ? 'This is a bundle' : 'Not a bundle'}</span>
              </label>
            </div>
          </div>
          
          {isBundle && (
            <div className="form-card-body">
              <p className="info-text">Add products to include in this bundle</p>
              
              <div className="bundle-table">
                <div className="bundle-table-header">
                  <div className="bundle-header-item product-col">Product</div>
                  <div className="bundle-header-item qty-col">Quantity</div>
                  <div className="bundle-header-item price-col">Unit Price</div>
                  <div className="bundle-header-item total-col">Total</div>
                  <div className="bundle-header-item action-col"></div>
                </div>
                
                {bundleItems.map((item, index) => (
                  <div key={index} className="bundle-table-row">
                    <div className="bundle-cell product-col">
                      <AsyncSelect
                        cacheOptions
                        defaultOptions={products.map(formatProductOption)}
                        loadOptions={loadProductOptions}
                        value={item.item_id ? formatProductOption(products.find(p => p.id === parseInt(item.item_id))) : null}
                        onChange={(option) => {
                          if (option) {
                            handleBundleItemChange(index, 'item_id', option.value);
                            handleBundleItemChange(index, 'unit_price', option.product.price);
                          } else {
                            handleBundleItemChange(index, 'item_id', '');
                            handleBundleItemChange(index, 'unit_price', 0);
                          }
                        }}
                        placeholder="Type to search products..."
                        isClearable
                        isSearchable
                        className="product-select"
                        classNamePrefix="product-select"
                        required={isBundle}
                        noOptionsMessage={() => (
                          <div className="no-options-message">
                            <FaSearch className="no-options-icon" />
                            <p>No products found</p>
                            <small>Try different keywords or check your spelling</small>
                          </div>
                        )}
                        loadingMessage={() => (
                          <div className="loading-message">
                            <FaSpinner className="fa-spin" />
                            <span>Searching products...</span>
                          </div>
                        )}
                        menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
                        menuPosition="fixed"
                        menuShouldBlockScroll={true}
                        styles={{
                          control: (base, state) => ({
                            ...base,
                            minHeight: '42px',
                            borderColor: state.isFocused ? '#3b82f6' : '#e2e8f0',
                            boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
                            '&:hover': {
                              borderColor: state.isFocused ? '#3b82f6' : '#cbd5e1'
                            },
                            backgroundColor: state.isDisabled ? '#f1f5f9' : 'white',
                            cursor: state.isDisabled ? 'not-allowed' : 'text'
                          }),
                          input: (base) => ({
                            ...base,
                            margin: 0,
                            padding: 0,
                            color: '#1e293b'
                          }),
                          placeholder: (base) => ({
                            ...base,
                            color: '#94a3b8'
                          }),
                          singleValue: (base) => ({
                            ...base,
                            color: '#1e293b'
                          }),
                          menu: (base) => ({
                            ...base,
                            marginTop: '4px',
                            backgroundColor: 'white',
                            borderRadius: '6px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                            zIndex: 9999,
                            overflow: 'hidden'
                          }),
                          menuList: (base) => ({
                            ...base,
                            padding: '4px',
                            maxHeight: '300px'
                          }),
                          option: (base, state) => ({
                            ...base,
                            backgroundColor: state.isFocused ? '#f1f5f9' : 'white',
                            color: '#1e293b',
                            cursor: 'pointer',
                            padding: '8px 12px',
                            borderRadius: '4px',
                            '&:active': {
                              backgroundColor: '#e2e8f0'
                            }
                          }),
                          dropdownIndicator: (base) => ({
                            ...base,
                            padding: '0 8px',
                            color: '#64748b',
                            '&:hover': {
                              color: '#3b82f6'
                            }
                          }),
                          clearIndicator: (base) => ({
                            ...base,
                            padding: '0 8px',
                            color: '#64748b',
                            '&:hover': {
                              color: '#ef4444'
                            }
                          }),
                          loadingIndicator: (base) => ({
                            ...base,
                            color: '#64748b'
                          }),
                          noOptionsMessage: (base) => ({
                            ...base,
                            padding: '16px',
                            textAlign: 'center'
                          }),
                          loadingMessage: (base) => ({
                            ...base,
                            padding: '16px',
                            textAlign: 'center'
                          }),
                          menuPortal: base => ({ ...base, zIndex: 9999 })
                        }}
                        components={{
                          DropdownIndicator: () => (
                            <div className="select-dropdown-icon">
                              <FaSearch />
                            </div>
                          ),
                          LoadingIndicator: () => (
                            <div className="select-loading-icon">
                              <FaSpinner className="fa-spin" />
                            </div>
                          ),
                          ClearIndicator: () => (
                            <div className="select-clear-icon">
                              <FaTimes />
                            </div>
                          )
                        }}
                      />
                    </div>
                    
                    <div className="bundle-cell qty-col">
                      <input
                        type="number"
                        id={`quantity-${index}`}
                        value={item.bundle_quantity}
                        onChange={(e) => handleBundleItemChange(index, 'bundle_quantity', e.target.value)}
                        className="form-control"
                        min="1"
                        required={isBundle}
                      />
                    </div>
                    
                    <div className="bundle-cell price-col">
                      <div className="price-display">
                        <span className="price-icon">৳</span>
                        {item.unit_price.toFixed(2)}
                      </div>
                    </div>
                    
                    <div className="bundle-cell total-col">
                      <div className="price-display total-price">
                        <span className="price-icon">৳</span>
                        {item.total.toFixed(2)}
                      </div>
                    </div>
                    
                    <div className="bundle-cell action-col">
                      <button
                        type="button"
                        className="btn btn-icon btn-danger"
                        onClick={() => removeBundleItem(index)}
                        disabled={bundleItems.length === 1}
                        title="Remove item"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  </div>
                ))}
                
                <div className="bundle-table-footer">
                  <div className="grand-total">
                    <span className="grand-total-label">Bundle Total:</span>
                    <span className="grand-total-amount">
                      <span className="price-icon">৳</span>
                      {bundleItems.reduce((sum, item) => sum + (item.total || 0), 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              
              <button
                type="button"
                className="btn btn-outline btn-sm add-bundle-btn"
                onClick={addBundleItem}
              >
                <FaPlus /> Add Another Item
              </button>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-light"
            onClick={() => navigate('/products')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary btn-with-icon"
            disabled={loading}
          >
            {loading ? 'Adding...' : <><FaSave /> Save Product</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;