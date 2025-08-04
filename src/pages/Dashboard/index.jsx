import React, { useState, useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import axiosInstance from '../../config/axios';
import { toast } from 'react-hot-toast';
import './Dashboard.css';
import Loading from '../../components/Loading';
import DashboardStats from '../../components/Dashboard/DashboardStats';
import DueOrdersTable from '../../components/Dashboard/DueOrdersTable';

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

    useEffect(() => {
        const fetchData = async () => {
            try {
                await Promise.all([
                    fetchDashboardData(),
                    fetchDueOrders()
                ]);
            } catch (error) {
                // Errors are handled in the individual functions
            } finally {
                setLoading(false);
            }
        };
        fetchData();
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

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="dashboard-container">
            <h2 className="dashboard-title mb-4">Dashboard Overview</h2>
            
            <DashboardStats data={dashboardData} />

            <Row className="mt-5">
                <Col md={6}>
                    <DueOrdersTable orders={dueOrders} />
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;