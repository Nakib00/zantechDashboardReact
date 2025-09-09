import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import axiosInstance from '../../config/axios';
import Loading from '../../components/Loading';
import { Row, Col, Card, Form, Button } from 'react-bootstrap';
import JoditEditor from 'jodit-react';
import usePageTitle from '../../hooks/usePageTitle';
import './Blog.css';

const ViewPost = () => {
    usePageTitle('View Post');
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [post, setPost] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        tags: [],
        thumbnail: null,
        meta_title: '',
        meta_description: '',
    });
    const editorRef = useRef(null);

    const editorConfig = useMemo(() => ({
        readonly: false,
        placeholder: 'Start typing the post content...',
        height: 400,
    }), []);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await axiosInstance.get(`/posts/${id}`);
                setPost(response.data.data);
                setFormData(response.data.data);
            } catch (error) {
                toast.error("Failed to fetch post details");
            }
        };
        fetchPost();
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({
            ...prev,
            thumbnail: e.target.files[0]
        }));
    };

    const handleEditorChange = (newContent) => {
        setFormData(prev => ({
            ...prev,
            content: newContent
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const postData = new FormData();
        postData.append('title', formData.title);
        postData.append('content', formData.content);
        formData.tags.forEach(tag => postData.append('tags[]', tag));
        if (formData.thumbnail) {
            postData.append('thumbnail', formData.thumbnail);
        }
        postData.append('meta_title', formData.meta_title);
        postData.append('meta_description', formData.meta_description);


        try {
            await axiosInstance.post(`/posts/${id}`, postData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            toast.success('Post updated successfully');
            navigate('/blog');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update post');
        } finally {
            setLoading(false);
        }
    };

    if (!post) {
        return <Loading />;
    }

    return (
        <div className="add-blog-container">
            <div className="add-blog-header">
                <h2>Edit Post</h2>
                <p className="text-muted">Update the details of the post</p>
            </div>

            <form onSubmit={handleSubmit} className="add-blog-form">
                <Row>
                    <Col lg={12}>
                        <Card className="border mb-4">
                            <Card.Header className="bg-light">
                                <h5 className="mb-0">Post Details</h5>
                            </Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Title</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="Enter post title"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Meta Title</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="meta_title"
                                                value={formData.meta_title}
                                                onChange={handleInputChange}
                                                placeholder="Enter meta title"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Form.Group className="mb-3">
                                    <Form.Label>Meta Description</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        name="meta_description"
                                        value={formData.meta_description}
                                        onChange={handleInputChange}
                                        placeholder="Enter a brief meta description..."
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Tags (comma separated)</Form.Label>
                                    <Form.Control
                                    type="text"
                                    name="tags"
                                    value={formData.tags}
                                    onChange={(e) => setFormData(prev => ({...prev, tags: e.target.value.split(',')}))}
                                    placeholder="Enter tags"
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Thumbnail</Form.Label>
                                    <Form.Control
                                    type="file"
                                    name="thumbnail"
                                    onChange={handleFileChange}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Content</Form.Label>
                                    <JoditEditor
                                        ref={editorRef}
                                        value={formData.content}
                                        config={editorConfig}
                                        tabIndex={1}
                                        onBlur={handleEditorChange}
                                    />
                                </Form.Group>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <div className="form-actions">
                    <button
                        type="button"
                        className="btn btn-light"
                        onClick={() => navigate('/blog')}
                    >
                        <FaArrowLeft className="me-2" />
                        Back to Posts
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary btn-with-icon"
                        disabled={loading}
                    >
                        {loading ? 'Updating...' : <><FaSave /> Update Post</>}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ViewPost;