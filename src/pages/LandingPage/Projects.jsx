import React from 'react';
import { ListGroup } from 'react-bootstrap';

const Projects = () => {
    return (
        <div className="tab-content-container">
            <h2>Our Projects</h2>
            <p className="lead">A showcase of the innovative projects we are working on.</p>
            <ListGroup>
                <ListGroup.Item>
                    <h5>Project Alpha</h5>
                    <p>A revolutionary new dashboard for e-commerce analytics.</p>
                </ListGroup.Item>
                <ListGroup.Item>
                    <h5>Project Beta</h5>
                    <p>Developing next-generation inventory management solutions.</p>
                </ListGroup.Item>
                <ListGroup.Item>
                    <h5>Project Gamma</h5>
                    <p>AI-powered customer support and engagement platform.</p>
                </ListGroup.Item>
            </ListGroup>
        </div>
    );
};

export default Projects;