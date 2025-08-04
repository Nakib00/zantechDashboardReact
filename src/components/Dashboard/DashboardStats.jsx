import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { FaShoppingCart, FaBox, FaMoneyBillWave, FaCalendarDay } from 'react-icons/fa';

const StatCard = ({ icon, title, value, colorClass }) => (
    <Card className="dashboard-card text-center h-100">
        <Card.Body className="d-flex flex-column justify-content-center">
            <div className={`dashboard-icon ${colorClass} mx-auto mb-2`}>
                {icon}
            </div>
            <div>
                <h6 className="card-subtitle mb-1 text-muted">{title}</h6>
                <h3 className="card-title mb-0">{value}</h3>
            </div>
        </Card.Body>
    </Card>
);

const DashboardStats = ({ data }) => {
    const stats = [
        { icon: <FaShoppingCart />, title: "Total Orders", value: data?.total_order_count ?? 0, colorClass: "total-orders" },
        { icon: <FaBox />, title: "New Orders", value: data?.new_order_count ?? 0, colorClass: "new-orders" },
        { icon: <FaMoneyBillWave />, title: "Total Sales", value: `৳${(data?.total_revenue ?? 0).toLocaleString()}`, colorClass: "revenue" },
        { icon: <FaCalendarDay />, title: "Today's Orders", value: data?.today_order_count ?? 0, colorClass: "today-orders" },
        { icon: <FaMoneyBillWave />, title: "Today's Sales", value: `৳${(data?.today_revenue ?? 0).toLocaleString()}`, colorClass: "today-revenue" }
    ];

    return (
        <Row>
            {stats.map((stat, index) => (
                <Col lg={2} md={4} className="mb-3" key={index}>
                    <StatCard {...stat} />
                </Col>
            ))}
        </Row>
    );
};

export default DashboardStats;