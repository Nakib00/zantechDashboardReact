import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { toast } from "react-hot-toast";
import axiosInstance from "../../config/axios";
import { Card, Button, Row, Col } from "react-bootstrap";
import Loading from "../../components/Loading";
import "../Categories/Categories.css";

const ViewCustomer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomerDetails();
  }, [id]);

  const fetchCustomerDetails = async () => {
    try {
      const response = await axiosInstance.get(`/clints/all-info/${id}`);
      if (response.data.success) {
        setCustomer(response.data.data[0]);
      } else {
        throw new Error(
          response.data.message || "Failed to fetch customer details"
        );
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch customer details"
      );
      navigate("/customers");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!customer) {
    return (
      <div className="categories-container">
        <div className="alert alert-danger">Customer not found</div>
      </div>
    );
  }

  const { user, shipping_addresses, order_summary, payment_summary } = customer;

  return (
    <div className="categories-container">
      <div className="categories-header">
        <div className="d-flex align-items-center gap-3">
          <Button
            variant="outline-secondary"
            onClick={() => navigate("/customers")}
            className="d-flex align-items-center gap-2"
          >
            <FaArrowLeft /> Back
          </Button>
          <h2 className="mb-0">Customer Details</h2>
        </div>
      </div>

      <Row className="g-4">
        <Col md={6}>
          <Card className="h-100">
            <Card.Body>
              <h5 className="mb-4">Basic Information</h5>
              <div className="mb-3">
                <strong>Name:</strong> {user.name}
              </div>
              <div className="mb-3">
                <strong>Email:</strong> {user.email}
              </div>
              <div className="mb-3">
                <strong>Phone:</strong> {user.phone}
              </div>
              <div className="mb-3">
                <strong>Address:</strong> {user.address || "N/A"}
              </div>
              <div className="mb-3">
                <strong>Member Since:</strong>{" "}
                {new Date(user.created_at).toLocaleDateString()}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="h-100">
            <Card.Body>
              <h5 className="mb-4">Order Summary</h5>
              <div className="mb-3">
                <strong>Total Orders:</strong> {order_summary.total_orders}
              </div>
              <div className="mb-3">
                <strong>Total Spend:</strong> ৳
                {order_summary.total_spend.toLocaleString()}
              </div>
              <div className="mb-3">
                <strong>Due Amount:</strong> ৳
                {payment_summary.due_amount.toLocaleString()}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={12}>
          <Card>
            <Card.Body>
              <h5 className="mb-4">Shipping Addresses</h5>
              {shipping_addresses.length > 0 ? (
                <div className="row g-3">
                  {shipping_addresses.map((address, index) => (
                    <div key={index} className="col-md-6">
                      <Card className="h-100 border">
                        <Card.Body>
                          <div className="mb-2">
                            <strong>Address:</strong> {address.address}
                          </div>
                          <div className="mb-2">
                            <strong>City:</strong> {address.city}
                          </div>
                          <div className="mb-2">
                            <strong>State:</strong> {address.state}
                          </div>
                          <div className="mb-2">
                            <strong>Postal Code:</strong> {address.postal_code}
                          </div>
                          <div>
                            <strong>Country:</strong> {address.country}
                          </div>
                        </Card.Body>
                      </Card>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted">No shipping addresses found</div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ViewCustomer;
