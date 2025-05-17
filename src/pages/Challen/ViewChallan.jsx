import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaSpinner, FaDownload } from "react-icons/fa";
import { toast } from "react-hot-toast";
import axiosInstance from "../../config/axios";
import { Card, Button, Row, Col, Table, Image } from "react-bootstrap";
import "../Categories/Categories.css";

const ViewChallan = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [challan, setChallan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChallan();
  }, [id]);

  const fetchChallan = async () => {
    try {
      const response = await axiosInstance.get(`/challans/${id}`);
      if (response.data.success) {
        setChallan(response.data.data);
      } else {
        throw new Error(response.data.message || "Failed to fetch challan");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch challan details");
      navigate('/challans');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="categories-container">
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center py-5">
            <FaSpinner className="spinner-border spinner-border-lg mb-3" />
            <p>Loading challan details...</p>
          </Card.Body>
        </Card>
      </div>
    );
  }

  if (!challan) {
    return null;
  }

  return (
    <div className="categories-container">
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center gap-3">
              <Button
                variant="outline-secondary"
                onClick={() => navigate('/challans')}
                className="d-flex align-items-center gap-2"
              >
                <FaArrowLeft /> Back
              </Button>
              <div>
                <h4 className="mb-1">Challan Details</h4>
                <p className="text-muted mb-0">View challan information</p>
              </div>
            </div>
          </div>

          <Row className="mb-4">
            <Col md={6}>
              <Card className="border h-100">
                <Card.Body>
                  <h5 className="mb-3">Basic Information</h5>
                  <div className="mb-2">
                    <strong>Challan ID:</strong> {challan.id}
                  </div>
                  <div className="mb-2">
                    <strong>Date:</strong> {new Date(challan.Date).toLocaleDateString()}
                  </div>
                  <div className="mb-2">
                    <strong>Created By:</strong> {challan.user.name}
                  </div>
                  <div className="mb-2">
                    <strong>Total Amount:</strong> ৳{parseFloat(challan.total).toLocaleString()}
                  </div>
                  <div className="mb-2">
                    <strong>Delivery Price:</strong> ৳{parseFloat(challan.delivery_price).toLocaleString()}
                  </div>
                  <div>
                    <strong>Grand Total:</strong> ৳{(parseFloat(challan.total) + parseFloat(challan.delivery_price)).toLocaleString()}
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="border h-100">
                <Card.Body>
                  <h5 className="mb-3">Supplier Information</h5>
                  <div className="mb-2">
                    <strong>Name:</strong> {challan.supplier.name}
                  </div>
                  <div className="mb-2">
                    <strong>Phone:</strong> {challan.supplier.phone}
                  </div>
                  <div>
                    <strong>Address:</strong> {challan.supplier.address}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card className="border mb-4">
            <Card.Body>
              <h5 className="mb-3">Items</h5>
              <div className="table-responsive">
                <Table className="table-hover">
                  <thead className="bg-light">
                    <tr>
                      <th>Item Name</th>
                      <th>Buying Price</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {challan.items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.item_name}</td>
                        <td>৳{parseFloat(item.buying_price || 0).toLocaleString()}</td>
                        <td>৳{parseFloat(item.price).toLocaleString()}</td>
                        <td>{item.quantity}</td>
                        <td>৳{(parseFloat(item.price) * parseInt(item.quantity)).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>

          {challan.invoice && (
            <Card className="border">
              <Card.Body>
                <h5 className="mb-3">Invoice</h5>
                <div className="d-flex align-items-center gap-3">
                  <Image
                    src={challan.invoice.path}
                    alt="Invoice"
                    style={{ maxHeight: '200px', objectFit: 'contain' }}
                    className="border rounded"
                  />
                  <Button
                    variant="outline-primary"
                    href={challan.invoice.path}
                    target="_blank"
                    className="d-flex align-items-center gap-2"
                  >
                    <FaDownload /> Download Invoice
                  </Button>
                </div>
              </Card.Body>
            </Card>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default ViewChallan; 