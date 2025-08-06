import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Spinner, Image, Modal } from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../config/axios';
import { FaTrash, FaEye } from 'react-icons/fa';
import usePageTitle from '../../hooks/usePageTitle';

const AmbassadorApplication = () => {
    usePageTitle('Ambassador Applications');
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState('');

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/ambassadors');
            if (response.data.success) {
                setApplications(response.data.data);
            } else {
                toast.error('Failed to fetch applications.');
            }
        } catch (error) {
            toast.error('An error occurred while fetching applications.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this application?')) {
            try {
                const response = await axiosInstance.delete(`/ambassadors/${id}`);
                if (response.data.success) {
                    toast.success('Application deleted successfully!');
                    fetchApplications();
                } else {
                    toast.error('Failed to delete application.');
                }
            } catch (error) {
                toast.error('An error occurred while deleting the application.');
            }
        }
    };

    const handleImagePreview = (imageUrl) => {
        setSelectedImage(imageUrl);
        setShowImageModal(true);
    };

    const handleMessagePreview = (message) => {
        setSelectedMessage(message);
        setShowMessageModal(true);
    }

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: 'calc(100vh - 200px)' }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    return (
        <div className="tab-content-container">
            <Card className="modern-card">
                <Card.Header className="bg-light">
                    <h4 className="mb-0">Ambassador Applications</h4>
                </Card.Header>
                <Card.Body>
                    <Table striped bordered hover responsive className="modern-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Image</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Campus</th>
                                <th>Status</th>
                                <th>Message</th>
                                <th>Applied At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applications.map((app) => (
                                <tr key={app.id}>
                                    <td>{app.id}</td>
                                    <td>
                                        <Image
                                            src={app.image}
                                            alt={app.name}
                                            thumbnail
                                            style={{ width: '60px', height: '60px', cursor: 'pointer' }}
                                            onClick={() => handleImagePreview(app.image)}
                                        />
                                    </td>
                                    <td>{app.name}</td>
                                    <td>{app.email}</td>
                                    <td>{app.phone}</td>
                                    <td>{app.campus}</td>
                                    <td>
                                        <span className={`badge bg-${app.status === "0" ? 'warning' : 'success'}`}>
                                            {app.status === "0" ? 'Pending' : 'Approved'}
                                        </span>
                                    </td>
                                    <td>
                                        <Button variant="link" onClick={() => handleMessagePreview(app.message)}>
                                            <FaEye />
                                        </Button>
                                    </td>
                                    <td>{new Date(app.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => handleDelete(app.id)}
                                        >
                                            <FaTrash />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            <Modal show={showImageModal} onHide={() => setShowImageModal(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Image Preview</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center">
                    <Image src={selectedImage} fluid />
                </Modal.Body>
            </Modal>

            <Modal show={showMessageModal} onHide={() => setShowMessageModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Message</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>{selectedMessage}</p>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default AmbassadorApplication;