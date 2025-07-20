import React, { useState, useEffect } from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { FaShoppingCart, FaBox, FaMoneyBillWave, FaCalendarDay } from 'react-icons/fa';
import axiosInstance from '../../config/axios';
import { toast } from 'react-hot-toast';
import './Dashboard.css';
import Loading from '../../components/Loading';

const Dashboard = () => {
    const [dashboardData, setDashboardData] = useState({
        total_order_count: 0,
        new_order_count: 0,
        total_revenue: 0,
        today_order_count: 0,
        today_revenue: 0
    });
    const [loading, setLoading] = useState(true);
    const [pageLoading, setPageLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await axiosInstance.get('/admin/dashboard');
            if (response.data.success) {
                setDashboardData(response.data.data);
            } else {
                throw new Error(response.data.message || 'Failed to fetch dashboard data');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch dashboard data');
        } finally {
            setLoading(false);
            setPageLoading(false);
        }
    };

    if (pageLoading) {
        return <Loading />;
    }

    return (
        <div className="dashboard-container">
            <h2 className="dashboard-title mb-4">Dashboard Overview</h2>
            <Row>
                <Col md={3} lg={2}>
                    <Card className="dashboard-card">
                        <Card.Body>
                            <div className="d-flex align-items-center">
                                <div className="dashboard-icon total-orders">
                                    <FaShoppingCart />
                                </div>
                                <div className="ms-3">
                                    <h6 className="card-subtitle mb-1 text-muted">Total Orders</h6>
                                    <h3 className="card-title mb-0">{dashboardData.total_order_count}</h3>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} lg={2}>
                    <Card className="dashboard-card">
                        <Card.Body>
                            <div className="d-flex align-items-center">
                                <div className="dashboard-icon new-orders">
                                    <FaBox />
                                </div>
                                <div className="ms-3">
                                    <h6 className="card-subtitle mb-1 text-muted">New Orders</h6>
                                    <h3 className="card-title mb-0">{dashboardData.new_order_count}</h3>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} lg={2}>
                    <Card className="dashboard-card">
                        <Card.Body>
                            <div className="d-flex align-items-center">
                                <div className="dashboard-icon revenue">
                                    <FaMoneyBillWave />
                                </div>
                                <div className="ms-3">
                                    <h6 className="card-subtitle mb-1 text-muted">Total Sales</h6>
                                    <h3 className="card-title mb-0">৳{dashboardData.total_revenue.toLocaleString()}</h3>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} lg={2}>
                    <Card className="dashboard-card">
                        <Card.Body>
                            <div className="d-flex align-items-center">
                                <div className="dashboard-icon today-orders">
                                    <FaCalendarDay />
                                </div>
                                <div className="ms-3">
                                    <h6 className="card-subtitle mb-1 text-muted">Today's Orders</h6>
                                    <h3 className="card-title mb-0">{dashboardData.today_order_count}</h3>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} lg={2}>
                    <Card className="dashboard-card">
                        <Card.Body>
                            <div className="d-flex align-items-center">
                                <div className="dashboard-icon today-revenue">
                                    <FaMoneyBillWave />
                                </div>
                                <div className="ms-3">
                                    <h6 className="card-subtitle mb-1 text-muted">Today's Sales</h6>
                                    <h3 className="card-title mb-0">৳{dashboardData.today_revenue.toLocaleString()}</h3>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;