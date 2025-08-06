import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card, Spinner, ListGroup, InputGroup } from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../config/axios';
import { FaBuilding, FaBullhorn, FaEnvelope, FaFacebook, FaGlobe, FaInfoCircle, FaInstagram, FaLinkedin, FaLocationArrow, FaPhone, FaTiktok, FaYoutube } from 'react-icons/fa';
import usePageTitle from '../../hooks/usePageTitle';


const SocialIcon = ({ platform }) => {
    switch (platform.toLowerCase()) {
        case 'facebook':
            return <FaFacebook />;
        case 'linkedin':
            return <FaLinkedin />;
        case 'instagram':
            return <FaInstagram />;
        case 'youtube':
            return <FaYoutube />;
        case 'tiktok':
            return <FaTiktok />;
        default:
            return <FaGlobe />;
    }
}

const CompanyInfo = () => {
    usePageTitle('Company Information');
    const [companyInfo, setCompanyInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        fetchCompanyInfo();
    }, []);

    const fetchCompanyInfo = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/company');
            if (response.data.success) {
                setCompanyInfo(response.data.data);
                setFormData(response.data.data);
            } else {
                toast.error('Failed to fetch company info.');
            }
        } catch (error) {
            toast.error('An error occurred while fetching company info.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axiosInstance.put('/company/1', formData);
            if (response.data.success) {
                toast.success('Company info updated successfully!');
                setIsEditing(false);
                fetchCompanyInfo();
            } else {
                toast.error('Failed to update company info.');
            }
        } catch (error) {
            toast.error('An error occurred while updating company info.');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !companyInfo) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: 'calc(100vh - 200px)' }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    return (
        <div className="tab-content-container">
            <Card className="modern-card">
                <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                    <h4 className="mb-0">{isEditing ? 'Edit Company Information' : companyInfo?.name || 'Company Information'}</h4>
                    {!isEditing && (
                        <Button variant="outline-primary" onClick={() => setIsEditing(true)}>Edit Info</Button>
                    )}
                </Card.Header>
                <Card.Body>
                    {isEditing ? (
                        <Form onSubmit={handleUpdate}>
                            {/* Form Fields */}
                            <Row>
                                <Col md={6} className="mb-4">
                                    <h5><FaBullhorn className="me-2"/>Hero Section</h5>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Hero Title</Form.Label>
                                        <Form.Control type="text" name="hero_title" value={formData.hero_title} onChange={handleInputChange} />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Hero Subtitle</Form.Label>
                                        <Form.Control type="text" name="hero_subtitle" value={formData.hero_subtitle} onChange={handleInputChange} />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Hero Description</Form.Label>
                                        <Form.Control as="textarea" rows={3} name="hero_description" value={formData.hero_description} onChange={handleInputChange} />
                                    </Form.Group>
                                </Col>
                                <Col md={6} className="mb-4">
                                    <h5><FaInfoCircle className="me-2"/>About Section</h5>
                                    <Form.Group className="mb-3">
                                        <Form.Label>About Title</Form.Label>
                                        <Form.Control type="text" name="about_title" value={formData.about_title} onChange={handleInputChange} />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>About Description 1</Form.Label>
                                        <Form.Control as="textarea" rows={3} name="about_description1" value={formData.about_description1} onChange={handleInputChange} />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>About Description 2</Form.Label>
                                        <Form.Control as="textarea" rows={3} name="about_description2" value={formData.about_description2} onChange={handleInputChange} />
                                    </Form.Group>
                                </Col>
                                <Col md={6} className="mb-4">
                                     <h5><FaBuilding className="me-2"/>Company Details</h5>
                                     <Form.Group className="mb-3">
                                        <Form.Label>Company Name</Form.Label>
                                        <Form.Control type="text" name="name" value={formData.name} onChange={handleInputChange} />
                                    </Form.Group>
                                     <Form.Group className="mb-3">
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control type="email" name="email" value={formData.email} onChange={handleInputChange} />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Phone</Form.Label>
                                        <Form.Control type="text" name="phone" value={formData.phone} onChange={handleInputChange} />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Location</Form.Label>
                                        <Form.Control type="text" name="location" value={formData.location} onChange={handleInputChange} />
                                    </Form.Group>
                                     <Form.Group className="mb-3">
                                        <Form.Label>Footer Text</Form.Label>
                                        <Form.Control as="textarea" rows={3} name="footer_text" value={formData.footer_text} onChange={handleInputChange} />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <div className="d-flex justify-content-end">
                                <Button variant="secondary" className="me-2" onClick={() => setIsEditing(false)}>Cancel</Button>
                                <Button variant="primary" type="submit" disabled={loading}>
                                    {loading ? <Spinner as="span" animation="border" size="sm" /> : 'Save Changes'}
                                </Button>
                            </div>
                        </Form>
                    ) : (
                        companyInfo &&
                        <>
                            {/* View Sections */}
                            <section className="mb-4">
                                <h5 className="mb-3"><FaBullhorn className="me-2 text-primary"/>Hero Information</h5>
                                <h6>{companyInfo.hero_title}</h6>
                                <p className="text-muted">{companyInfo.hero_subtitle}</p>
                                <p>{companyInfo.hero_description}</p>
                            </section>
                            <hr />
                             <section className="mb-4">
                                <h5 className="mb-3"><FaInfoCircle className="me-2 text-primary"/>About Us</h5>
                                <h6>{companyInfo.about_title}</h6>
                                <p>{companyInfo.about_description1}</p>
                                <p>{companyInfo.about_description2}</p>
                            </section>
                            <hr />
                            <Row>
                                <Col md={6}>
                                    <section className="mb-4">
                                        <h5 className="mb-3"><FaBuilding className="me-2 text-primary"/>Contact Details</h5>
                                        <p><FaEnvelope className="me-2 text-muted"/> {companyInfo.email}</p>
                                        <p><FaPhone className="me-2 text-muted"/> {companyInfo.phone}</p>
                                        <p><FaLocationArrow className="me-2 text-muted"/> {companyInfo.location}</p>
                                    </section>
                                </Col>
                                <Col md={6}>
                                    <section className="mb-4">
                                        <h5 className="mb-3"><FaGlobe className="me-2 text-primary"/>Social Media</h5>
                                        <ListGroup variant="flush">
                                            {companyInfo.social_links.map(link => (
                                                <ListGroup.Item key={link.id} className="d-flex align-items-center">
                                                    <SocialIcon platform={link.platform} /> 
                                                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="ms-2">{link.platform}</a>
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    </section>
                                </Col>
                            </Row>
                            <hr/>
                             <section>
                                <h5>Footer Text</h5>
                                <p className="text-muted">{companyInfo.footer_text}</p>
                            </section>
                        </>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
};

export default CompanyInfo;