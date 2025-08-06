import React from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';

const AmbassadorApplication = () => {
    return (
        <div className="tab-content-container">
            <h2>Become a Zantech Ambassador</h2>
            <p className="lead">Join our community of innovators and help us grow.</p>
            <Form>
                <Row className="mb-3">
                    <Form.Group as={Col} controlId="formGridName">
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control type="text" placeholder="Enter your name" />
                    </Form.Group>

                    <Form.Group as={Col} controlId="formGridEmail">
                        <Form.Label>Email</Form.Label>
                        <Form.Control type="email" placeholder="Enter your email" />
                    </Form.Group>
                </Row>

                <Form.Group className="mb-3" controlId="formGridWhy">
                    <Form.Label>Why do you want to be an ambassador?</Form.Label>
                    <Form.Control as="textarea" rows={3} placeholder="Tell us about your motivation..." />
                </Form.Group>

                <Button variant="primary" type="submit">
                    Submit Application
                </Button>
            </Form>
        </div>
    );
};

export default AmbassadorApplication;