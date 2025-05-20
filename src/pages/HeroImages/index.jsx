import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaSpinner, FaTimes } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../config/axios';
import { Card, Form, Button, Modal } from 'react-bootstrap';
import '../Categories/Categories.css';

const HeroImages = () => {
  const [heroImages, setHeroImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [searchParams, setSearchParams] = useState({
    page: 1,
    limit: 10
  });

  useEffect(() => {
    fetchHeroImages();
  }, [searchParams.page, searchParams.limit]);

  const fetchHeroImages = async (page = searchParams.page) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: searchParams.limit
      };

      const response = await axiosInstance.get('/hero-images', { params });
      if (response.data.success) {
        setHeroImages(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch hero images');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch hero images');
      setHeroImages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLimitChange = (e) => {
    const limit = parseInt(e.target.value);
    setSearchParams(prev => ({
      ...prev,
      limit,
      page: 1
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        toast.error('File size should be less than 4MB');
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/svg+xml'].includes(file.type)) {
        toast.error('Invalid file type. Please upload an image file');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select an image to upload');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await axiosInstance.post('/hero-images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        toast.success('Hero image uploaded successfully');
        setShowAddModal(false);
        setSelectedFile(null);
        fetchHeroImages(1);
      } else {
        throw new Error(response.data.message || 'Failed to upload hero image');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload hero image');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this hero image?')) {
      try {
        const response = await axiosInstance.delete(`/hero-images/${id}`);
        if (response.data.success) {
          toast.success('Hero image deleted successfully');
          setHeroImages(heroImages.filter(img => img.id !== id));
        } else {
          throw new Error(response.data.message || 'Failed to delete hero image');
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete hero image');
      }
    }
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setShowPreviewModal(true);
  };

  if (loading && heroImages.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-text">Zantech</div>
      </div>
    );
  }

  return (
    <div className="categories-container">
      <div className="categories-header">
        <h2>Hero Section Images</h2>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <FaPlus /> Add Hero Image
        </button>
      </div>

      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-end align-items-center mb-4">
            <Form.Select
              value={searchParams.limit}
              onChange={handleLimitChange}
              style={{ width: 'auto' }}
              disabled={loading}
            >
              <option value="5">5 per page</option>
              <option value="10">10 per page</option>
              <option value="20">20 per page</option>
              <option value="50">50 per page</option>
            </Form.Select>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="bg-light">
                <tr>
                  <th>ID</th>
                  <th>Image</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {heroImages.map((image) => (
                  <tr key={image.id}>
                    <td>{image.id}</td>
                    <td>
                      <img
                        src={image.path}
                        alt={`Hero Image ${image.id}`}
                        className="rounded img-thumbnail cursor-pointer"
                        style={{ 
                          width: '200px', 
                          height: '100px', 
                          objectFit: 'cover',
                          cursor: 'pointer'
                        }}
                        onClick={() => handleImageClick(image)}
                      />
                    </td>
                    <td>{new Date(image.created_at).toLocaleString()}</td>
                    <td>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(image.id)}
                        disabled={loading}
                      >
                        <FaTrash /> Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card.Body>
      </Card>

      {/* Add Hero Image Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Hero Image</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleUpload}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Select Image</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                required
              />
              <Form.Text className="text-muted">
                Maximum file size: 4MB. Supported formats: JPG, PNG, GIF, SVG
              </Form.Text>
            </Form.Group>
            {selectedFile && (
              <div className="mt-3">
                <p className="mb-2">Preview:</p>
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="Preview"
                  className="rounded img-thumbnail"
                  style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                />
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={!selectedFile || uploading}
            >
              {uploading ? (
                <>
                  <FaSpinner className="spinner-border spinner-border-sm me-2" />
                  Uploading...
                </>
              ) : (
                'Upload Image'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Image Preview Modal */}
      <Modal 
        show={showPreviewModal} 
        onHide={() => setShowPreviewModal(false)} 
        centered
        size="lg"
        className="image-preview-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Image Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center p-0">
          {selectedImage && (
            <img
              src={selectedImage.path}
              alt={`Hero Image ${selectedImage.id}`}
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                objectFit: 'contain'
              }}
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPreviewModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default HeroImages; 