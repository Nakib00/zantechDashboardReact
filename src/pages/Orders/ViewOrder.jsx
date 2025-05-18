import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaSpinner, FaBox, FaUser, FaTruck, FaCreditCard, FaShoppingCart } from "react-icons/fa";
import { toast } from "react-hot-toast";
import axiosInstance from "../../config/axios";
import { Card, Button, Row, Col, Table, Badge, Form } from "react-bootstrap";
import Loading from "../../components/Loading";
import "../Categories/Categories.css";

const ViewOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await axiosInstance.get(`/orders/${id}`);
      if (response.data.success) {
        setOrderData(response.data.data);
      } else {
        throw new Error(response.data.message || "Failed to fetch order");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch order details");
      navigate("/orders");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (updatingStatus) return;
    
    setUpdatingStatus(true);
    try {
      const response = await axiosInstance.post(`/orders/update-status/${id}`, {
        status: parseInt(newStatus)
      });

      if (response.data.success) {
        toast.success(response.data.message || "Order status updated successfully");
        // Update the local state with new status and status change description
        setOrderData(prev => ({
          ...prev,
          order: {
            ...prev.order,
            status: response.data.data.new_status.toString(),
            status_change_desc: response.data.data.status_change_desc
          }
        }));
      } else {
        throw new Error(response.data.message || "Failed to update status");
      }
    } catch (error) {
      console.error('Status update error:', error);
      toast.error(error.response?.data?.message || "Failed to update order status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      "0": "Processing",
      "1": "Completed",
      "2": "On Hold",
      "3": "Cancelled",
      "4": "Refunded"
    };
    return statusMap[status?.toString()] || "Unknown";
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      "0": { label: "Processing", variant: "info" },
      "1": { label: "Completed", variant: "success" },
      "2": { label: "On Hold", variant: "secondary" },
      "3": { label: "Cancelled", variant: "danger" },
      "4": { label: "Refunded", variant: "danger" }
    };

    const statusStr = status?.toString();
    const { label, variant } = statusMap[statusStr] || { label: "Unknown", variant: "secondary" };
    return <span className={`badge bg-${variant}`}>{label}</span>;
  };

  const getPaymentStatusBadge = (status) => {
    const statusMap = {
      "0": { label: "Pending", variant: "warning" },
      "1": { label: "Paid", variant: "success" },
      "2": { label: "Failed", variant: "danger" },
      "3": { label: "Partial", variant: "info" },
    };

    const { label, variant } = statusMap[status] || { label: "Unknown", variant: "secondary" };
    return <span className={`badge bg-${variant}`}>{label}</span>;
  };

  const getPaymentType = (type) => {
    const types = {
      "1": "Cash",
      "2": "Card",
      "3": "Mobile Banking",
    };
    return types[type] || "Unknown";
  };

  if (loading) {
    return <Loading />;
  }

  if (!orderData) {
    return (
      <div className="categories-container">
        <Card>
          <Card.Body>
            <div className="text-center">
              <h3>Order not found</h3>
              <Button variant="primary" onClick={() => navigate("/orders")}>
                <FaArrowLeft className="me-2" /> Back to Orders
              </Button>
            </div>
          </Card.Body>
        </Card>
      </div>
    );
  }

  const { order, user, shipping_address, coupon, order_items, payments } = orderData;

  return (
    <div className="categories-container">
      <Card>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">Order Details</h2>
            <div className="d-flex gap-2">
              <Form.Select
                value={orderData?.order?.status?.toString() || "0"}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={updatingStatus}
                style={{ width: "auto" }}
                className="me-2"
              >
                <option value="0">Processing</option>
                <option value="1">Completed</option>
                <option value="2">On Hold</option>
                <option value="3">Cancelled</option>
                <option value="4">Refunded</option>
              </Form.Select>
              <Button variant="outline-primary" onClick={() => navigate("/orders")}>
                <FaArrowLeft className="me-2" /> Back to Orders
              </Button>
            </div>
          </div>

          {/* Order Information Section */}
          <Card className="border mb-4">
            <Card.Header className="bg-light">
              <h5 className="mb-0 d-flex align-items-center">
                <FaBox className="me-2" /> Order Information
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <div className="mb-2">
                    <strong>Invoice Code:</strong> {order.invoice_code}
                  </div>
                  <div className="mb-2">
                    <strong>Status:</strong> {getStatusBadge(order.status)}
                  </div>
                  <div className="mb-2">
                    <strong>Order Date:</strong>{" "}
                    {new Date(order.created_at).toLocaleString()}
                  </div>
                  {order.status_change_desc && (
                    <div className="mb-2">
                      <strong>Status Change:</strong>{" "}
                      <small className="text-muted">{order.status_change_desc}</small>
                    </div>
                  )}
                </Col>
                <Col md={6}>
                  <div className="mb-2">
                    <strong>Item Subtotal:</strong> ৳{parseFloat(order.item_subtotal).toLocaleString()}
                  </div>
                  <div className="mb-2">
                    <strong>Shipping Charge:</strong> ৳{parseFloat(order.shipping_charge).toLocaleString()}
                  </div>
                  {parseFloat(order.discount) > 0 && (
                    <div className="mb-2">
                      <strong>Discount:</strong> ৳{parseFloat(order.discount).toLocaleString()}
                    </div>
                  )}
                  <div className="mb-2">
                    <strong>Total Amount:</strong> ৳{parseFloat(order.total_amount).toLocaleString()}
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Customer Information Section */}
          <Card className="border mb-4">
            <Card.Header className="bg-light">
              <h5 className="mb-0 d-flex align-items-center">
                <FaUser className="me-2" /> Customer Information
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <div className="mb-2">
                    <strong>Name:</strong> {user.name}
                  </div>
                  <div className="mb-2">
                    <strong>Email:</strong> {user.email}
                  </div>
                  <div className="mb-2">
                    <strong>Phone:</strong> {user.phone}
                  </div>
                  <div>
                    <strong>Address:</strong> {user.address}
                  </div>
                </Col>
                <Col md={6}>
                  <h6 className="mb-3">Shipping Address</h6>
                  <div className="mb-2">
                    <strong>Name:</strong> {shipping_address.f_name} {shipping_address.l_name}
                  </div>
                  <div className="mb-2">
                    <strong>Phone:</strong> {shipping_address.phone}
                  </div>
                  <div className="mb-2">
                    <strong>Address:</strong> {shipping_address.address}
                  </div>
                  <div className="mb-2">
                    <strong>City:</strong> {shipping_address.city}
                  </div>
                  <div>
                    <strong>ZIP:</strong> {shipping_address.zip}
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Payment Information Section */}
          <Card className="border mb-4">
            <Card.Header className="bg-light">
              <h5 className="mb-0 d-flex align-items-center">
                <FaCreditCard className="me-2" /> Payment Information
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table className="table-hover align-middle">
                  <thead className="bg-light">
                    <tr>
                      <th>Payment ID</th>
                      <th>Status</th>
                      <th>Amount</th>
                      <th>Paid Amount</th>
                      <th>Due Amount</th>
                      <th>Payment Type</th>
                      <th>Transaction ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.payment_id}>
                        <td>{payment.payment_id}</td>
                        <td>{getPaymentStatusBadge(payment.status)}</td>
                        <td>৳{parseFloat(payment.amount).toLocaleString()}</td>
                        <td>৳{parseFloat(payment.paid_amount).toLocaleString()}</td>
                        <td>৳{parseFloat(payment.due_amount).toLocaleString()}</td>
                        <td>{getPaymentType(payment.payment_type)}</td>
                        <td>{payment.transaction_id || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>

          {/* Order Items Section */}
          <Card className="border">
            <Card.Header className="bg-light">
              <h5 className="mb-0 d-flex align-items-center">
                <FaShoppingCart className="me-2" /> Order Items
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table className="table-hover align-middle">
                  <thead className="bg-light">
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order_items.map((item) => (
                      <tr key={item.product_id}>
                        <td>
                          <div className="d-flex align-items-center">
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="rounded me-3"
                                style={{ width: "50px", height: "50px", objectFit: "cover" }}
                              />
                            )}
                            <div>
                              <h6 className="mb-0">{item.name}</h6>
                              {item.is_bundle === 1 && (
                                <small className="text-muted">Bundle Product</small>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>৳{parseFloat(item.price).toLocaleString()}</td>
                        <td>{item.quantity}</td>
                        <td>
                          ৳{(parseFloat(item.price) * parseInt(item.quantity)).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="3" className="text-end">
                        <strong>Item Subtotal:</strong>
                      </td>
                      <td>
                        <strong>৳{parseFloat(order.item_subtotal).toLocaleString()}</strong>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="3" className="text-end">
                        <strong>Shipping Charge:</strong>
                      </td>
                      <td>
                        <strong>৳{parseFloat(order.shipping_charge).toLocaleString()}</strong>
                      </td>
                    </tr>
                    {parseFloat(order.discount) > 0 && (
                      <tr>
                        <td colSpan="3" className="text-end">
                          <strong>Discount:</strong>
                        </td>
                        <td>
                          <strong className="text-danger">
                            -৳{parseFloat(order.discount).toLocaleString()}
                          </strong>
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td colSpan="3" className="text-end">
                        <strong>Total Amount:</strong>
                      </td>
                      <td>
                        <strong>৳{parseFloat(order.total_amount).toLocaleString()}</strong>
                      </td>
                    </tr>
                  </tfoot>
                </Table>
              </div>
            </Card.Body>
          </Card>

          {/* Coupon Information */}
          {coupon && (
            <Card className="border mt-4">
              <Card.Header className="bg-light">
                <h5 className="mb-0">Coupon Applied</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-flex align-items-center">
                  <Badge bg="success" className="me-2">
                    {coupon.code}
                  </Badge>
                  <span>Discount Amount: ৳{parseFloat(coupon.amount).toLocaleString()}</span>
                </div>
              </Card.Body>
            </Card>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default ViewOrder; 