import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaSpinner, FaDownload, FaEdit, FaSave, FaTimes } from "react-icons/fa";
import { toast } from "react-hot-toast";
import axiosInstance from "../../config/axios";
import { Card, Button, Row, Col, Table, Image, Form } from "react-bootstrap";
import Loading from "../../components/Loading";
import "../Categories/Categories.css";

const ViewChallan = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [challan, setChallan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState({
    Date: "",
    delivery_price: "",
    supplier_id: ""
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchChallan();
    fetchSuppliers();
  }, [id]);

  const fetchSuppliers = async () => {
    try {
      const response = await axiosInstance.get("/suppliers");
      setSuppliers(response.data.data);
    } catch (err) {
      console.error("Failed to fetch suppliers:", err);
      toast.error(err.response?.data?.message || "Failed to fetch suppliers");
    }
  };

  const fetchChallan = async () => {
    try {
      const response = await axiosInstance.get(`/challans/${id}`);
      if (response.data.success) {
        const challanData = response.data.data;
        setChallan(challanData);
        setFormData({
          Date: challanData.Date,
          delivery_price: challanData.delivery_price,
          supplier_id: challanData.supplier.id
        });
      } else {
        throw new Error(response.data.message || "Failed to fetch challan");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch challan details"
      );
      navigate("/challans");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      Date: challan.Date,
      delivery_price: challan.delivery_price,
      supplier_id: challan.supplier.id
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await axiosInstance.put(`/challans/${id}`, formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        toast.success("Challan updated successfully");
        setIsEditing(false);
        fetchChallan();
      } else {
        throw new Error(response.data.message || "Failed to update challan");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update challan");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loading />;
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
                onClick={() => navigate("/challans")}
                className="d-flex align-items-center gap-2"
              >
                <FaArrowLeft /> Back
              </Button>
              <div>
                <h4 className="mb-1">Challan Details</h4>
                <p className="text-muted mb-0">View challan information</p>
              </div>
            </div>
            {!isEditing && (
              <Button
                variant="outline-primary"
                onClick={handleEdit}
                className="d-flex align-items-center gap-2"
              >
                <FaEdit /> Edit
              </Button>
            )}
          </div>

          <Row className="mb-4">
            <Col md={6}>
              <Card className="border h-100">
                <Card.Body>
                  <h5 className="mb-3">Basic Information</h5>
                  {isEditing ? (
                    <Form onSubmit={handleSubmit}>
                      <Form.Group className="mb-3">
                        <Form.Label>Date</Form.Label>
                        <Form.Control
                          type="date"
                          value={formData.Date}
                          onChange={(e) => setFormData(prev => ({ ...prev, Date: e.target.value }))}
                          required
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Supplier</Form.Label>
                        <Form.Select
                          value={formData.supplier_id}
                          onChange={(e) => setFormData(prev => ({ ...prev, supplier_id: e.target.value }))}
                          required
                        >
                          <option value="">Select Supplier</option>
                          {suppliers.map(supplier => (
                            <option key={supplier.id} value={supplier.id}>
                              {supplier.name}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Delivery Price</Form.Label>
                        <Form.Control
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.delivery_price}
                          onChange={(e) => setFormData(prev => ({ ...prev, delivery_price: e.target.value }))}
                          required
                        />
                      </Form.Group>

                      <div className="alert alert-info">
                        <strong>Total Amount:</strong> ৳{parseFloat(challan.total).toLocaleString()}
                      </div>

                      <div className="d-flex gap-2">
                        <Button
                          type="submit"
                          variant="primary"
                          disabled={submitting}
                          className="d-flex align-items-center gap-2"
                        >
                          {submitting ? (
                            <>
                              <FaSpinner className="spinner-border spinner-border-sm" /> Saving...
                            </>
                          ) : (
                            <>
                              <FaSave /> Save Changes
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={handleCancel}
                          disabled={submitting}
                          className="d-flex align-items-center gap-2"
                        >
                          <FaTimes /> Cancel
                        </Button>
                      </div>
                    </Form>
                  ) : (
                    <>
                      <div className="mb-2">
                        <strong>Challan ID:</strong> {challan.id}
                      </div>
                      <div className="mb-2">
                        <strong>Date:</strong>{" "}
                        {new Date(challan.Date).toLocaleDateString()}
                      </div>
                      <div className="mb-2">
                        <strong>Created By:</strong> {challan.user.name}
                      </div>
                      <div className="mb-2">
                        <strong>Delivery Price:</strong> ৳
                        {parseFloat(challan.delivery_price).toLocaleString()}
                      </div>
                      <div>
                        <strong>Grand Total:</strong> ৳
                        {(
                          parseFloat(challan.total) +
                          parseFloat(challan.delivery_price)
                        ).toLocaleString()}
                        <div className="mt-2">
                          <strong>Total Amount:</strong> ৳
                          {parseFloat(challan.total).toLocaleString()}
                        </div>
                      </div>
                    </>
                  )}
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
                      <th>Quantity</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {challan.items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.item_name}</td>
                        <td>
                          ৳{parseFloat(item.buying_price || 0).toLocaleString()}
                        </td>
                        <td>{item.quantity}</td>
                        <td>
                          ৳
                          {(
                            parseFloat(item.buying_price) *
                            parseInt(item.quantity)
                          ).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    <tr className="table-secondary fw-bold">
                      <td colSpan="2">
                        <h5>Total Items (Types)</h5>
                      </td>
                      <td>
                        <h5>{challan.items.length}</h5>
                      </td>
                      <td>
                        <h5>
                          ৳
                          {challan.items
                            .reduce(
                              (sum, item) =>
                                sum +
                                parseFloat(item.buying_price || 0) *
                                  parseInt(item.quantity),
                              0
                            )
                            .toLocaleString()}
                        </h5>
                      </td>
                    </tr>
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
                    style={{ maxHeight: "200px", objectFit: "contain" }}
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
