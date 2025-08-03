import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table } from 'react-bootstrap';
import { FaShoppingCart, FaBox, FaMoneyBillWave, FaCalendarDay } from 'react-icons/fa';
import axiosInstance from '../../config/axios';
import { toast } from 'react-hot-toast';
import './Dashboard.css';
import Loading from '../../components/Loading';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [dashboardData, setDashboardData] = useState({
        total_order_count: 0,
        new_order_count: 0,
        total_revenue: 0,
        today_order_count: 0,
        today_revenue: 0
    });
    const [dueOrders, setDueOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageLoading, setPageLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboardData();
        fetchDueOrders();
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

    const fetchDueOrders = async () => {
        try {
            const response = await axiosInstance.get('/orders/summary/due-amount');
            if (response.data.success) {
                setDueOrders(response.data.data);
            } else {
                toast.error('Failed to fetch due orders');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch due orders');
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

            <Row className="mt-5">
                <Col md={6}>
                    <h2 className="dashboard-title mb-4">Orders with Due Amount</h2>
                    <Card className="dashboard-card">
                        <Card.Body>
                            <div className="due-orders-table-container">
                                <Table striped bordered hover responsive>
                                    <colgroup>
                                        <col style={{ width: '33%' }} />
                                        <col style={{ width: '33%' }} />
                                        <col style={{ width: '34%' }} />
                                    </colgroup>
                                    <thead>
                                        <tr>
                                            <th>Order Info</th>
                                            <th>Customer Info</th>
                                            <th>Payment Info (Total/Paid/Due)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dueOrders.map(order => (
                                            <tr key={order.order_id} onClick={() => navigate(`/orders/${order.order_id}`)} style={{ cursor: 'pointer' }}>
                                                <td>
                                                    <div><strong>ID:</strong> {order.order_id}</div>
                                                    <div><strong>Invoice:</strong> {order.invoice_code}</div>
                                                </td>
                                                <td>
                                                    <div><strong>Name:</strong> {order.user_name}</div>
                                                    <div><strong>Phone:</strong> {order.user_phone}</div>
                                                </td>
                                                <td>
                                                    <div><strong>Total:</strong> ৳{parseFloat(order.total_amount).toLocaleString()}</div>
                                                    <div><strong>Paid:</strong> ৳{parseFloat(order.paid_amount).toLocaleString()}</div>
                                                    <div className="text-danger"><strong>Due:</strong> ৳{parseFloat(order.due_amount).toLocaleString()}</div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;