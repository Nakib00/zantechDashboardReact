import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';

const ambassadors = [
    { name: 'John Doe', title: 'Lead Ambassador', location: 'New York, USA' },
    { name: 'Jane Smith', title: 'Community Manager', location: 'London, UK' },
    { name: 'Sam Wilson', title: 'Tech Evangelist', location: 'San Francisco, USA' },
];

const OurAmbassadors = () => {
    return (
        <div className="tab-content-container">
            <h2>Our Ambassadors</h2>
            <p className="lead">Meet the dedicated individuals who represent Zantech.</p>
            <Row>
                {ambassadors.map((ambassador, index) => (
                    <Col md={4} key={index} className="mb-3">
                        <Card>
                            <Card.Body>
                                <Card.Title>{ambassador.name}</Card.Title>
                                <Card.Subtitle className="mb-2 text-muted">{ambassador.title}</Card.Subtitle>
                                <Card.Text>{ambassador.location}</Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default OurAmbassadors;