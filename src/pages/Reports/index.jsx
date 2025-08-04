import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, ButtonGroup, Button, Spinner } from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../config/axios';
import Loading from '../../components/Loading';
import './Reports.css';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [monthlyComparison, setMonthlyComparison] = useState([]);
  const [topSellingItems, setTopSellingItems] = useState([]);
  const [salesOverTime, setSalesOverTime] = useState([]);
  const [salesPeriod, setSalesPeriod] = useState('daily');
  const [salesLoading, setSalesLoading] = useState(false);

  useEffect(() => {
    const fetchAllReports = async () => {
      try {
        setLoading(true);
        const [expensesRes, salesRes, topItemsRes] = await Promise.all([
          axiosInstance.get('/reports/expenses/monthly-total'),
          axiosInstance.get('/reports/transitions/monthly-total'),
          axiosInstance.get('/reports/top-selling-items')
        ]);

        const salesData = salesRes.data.data;
        const expensesData = expensesRes.data.data;
        const mergedData = mergeMonthlyData(salesData, expensesData);
        setMonthlyComparison(mergedData);

        setTopSellingItems(topItemsRes.data.data);
      } catch (error) {
        toast.error("Failed to load initial reports data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllReports();
    fetchSalesOverTime('daily');
  }, []);

  const fetchSalesOverTime = async (period) => {
    setSalesLoading(true);
    try {
      const response = await axiosInstance.get(`/reports/sales-over-time?period=${period}`);
      setSalesOverTime(response.data.data);
    } catch (error) {
      toast.error(`Failed to fetch ${period} sales data.`);
    } finally {
      setSalesLoading(false);
    }
  };

  const handleSalesPeriodChange = (period) => {
    setSalesPeriod(period);
    fetchSalesOverTime(period);
  };

  const mergeMonthlyData = (sales, expenses) => {
    const dataMap = new Map();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    sales.forEach(item => {
      const key = `${item.year}-${item.month}`;
      if (!dataMap.has(key)) {
        dataMap.set(key, { name: `${monthNames[item.month - 1]} ${item.year}`, sales: 0, expenses: 0 });
      }
      dataMap.get(key).sales = item.total_amount;
    });

    expenses.forEach(item => {
        const key = `${item.year}-${item.month}`;
        if (!dataMap.has(key)) {
          dataMap.set(key, { name: `${monthNames[item.month - 1]} ${item.year}`, sales: 0, expenses: 0 });
        }
        dataMap.get(key).expenses = item.total_amount;
      });
  
      return Array.from(dataMap.values()).reverse();
    };
  
    if (loading) {
      return <Loading />;
    }
  
    return (
      <div className="reports-container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="page-title mb-1">Reports</h2>
            <p className="text-muted mb-0">Analytics and insights on your business performance</p>
          </div>
        </div>
  
        <Row>
          <Col lg={6} className="mb-4">
            <Card className="modern-card h-100">
              <Card.Header>
                <h5 className="mb-0">Monthly Sales vs. Expenses</h5>
              </Card.Header>
              <Card.Body>
                <div className="table-responsive">
                    <Table hover className="modern-table">
                        <thead>
                            <tr>
                                <th>Month</th>
                                <th className="text-end">Total Sales</th>
                                <th className="text-end">Total Expenses</th>
                            </tr>
                        </thead>
                        <tbody>
                            {monthlyComparison.map((item, index) => (
                            <tr key={index}>
                                <td>{item.name}</td>
                                <td className="text-end text-success">৳{item.sales.toLocaleString()}</td>
                                <td className="text-end text-danger">৳{item.expenses.toLocaleString()}</td>
                            </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
              </Card.Body>
            </Card>
          </Col>
  
          <Col lg={6} className="mb-4">
            <Card className="modern-card h-100">
              <Card.Header>
                <h5 className="mb-0">Top Selling Items</h5>
              </Card.Header>
              <Card.Body>
                <div className="table-responsive">
                  <Table hover className="modern-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Product Name</th>
                        <th className="text-end">Price</th>
                        <th className="text-end">Total Sold</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topSellingItems.map((item, index) => (
                        <tr key={item.item_id}>
                          <td>{index + 1}</td>
                          <td>{item.name}</td>
                          <td className="text-end">৳{parseFloat(item.price).toLocaleString()}</td>
                          <td className="text-end fw-bold">{item.total_sold}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={12}>
            <Card className="modern-card">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Sales Over Time</h5>
                <ButtonGroup size="sm">
                  <Button variant={salesPeriod === 'daily' ? 'primary' : 'outline-primary'} onClick={() => handleSalesPeriodChange('daily')}>Daily</Button>
                  <Button variant={salesPeriod === 'weekly' ? 'primary' : 'outline-primary'} onClick={() => handleSalesPeriodChange('weekly')}>Weekly</Button>
                  <Button variant={salesPeriod === 'monthly' ? 'primary' : 'outline-primary'} onClick={() => handleSalesPeriodChange('monthly')}>Monthly</Button>
                </ButtonGroup>
              </Card.Header>
              <Card.Body>
              {salesLoading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
                  <Spinner animation="border" variant="primary" />
                </div>
                 ) : (
                <div className="table-responsive">
                  <Table hover className="modern-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th className="text-end">Total Sales</th>
                        <th className="text-end">Order Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesOverTime.map((item, index) => (
                        <tr key={index}>
                          <td>{item.date}</td>
                          <td className="text-end text-success">৳{parseFloat(item.total_sales).toLocaleString()}</td>
                          <td className="text-end">{item.order_count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
                 )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };
  
  export default Reports;