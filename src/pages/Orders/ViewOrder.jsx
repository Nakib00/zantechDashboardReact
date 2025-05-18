import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaSpinner,
  FaBox,
  FaUser,
  FaTruck,
  FaCreditCard,
  FaShoppingCart,
  FaTrash,
  FaEdit,
  FaPlus,
  FaTimes,
  FaEnvelope,
  FaMoneyBillWave,
  FaUniversity,
  FaMobileAlt,
  FaSave,
  FaFileInvoice,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import axiosInstance from "../../config/axios";
import {
  Card,
  Button,
  Row,
  Col,
  Table,
  Badge,
  Form,
  Modal,
} from "react-bootstrap";
import Loading from "../../components/Loading";
import "../Categories/Categories.css";
import Select from "react-select/async";
import InvoiceDocument from '../../components/InvoiceDocument';

const ViewOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [updatingQuantity, setUpdatingQuantity] = useState(false);
  const [removingItem, setRemovingItem] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [quantityInput, setQuantityInput] = useState("");
  const [isAddingItems, setIsAddingItems] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [addingItemsLoading, setAddingItemsLoading] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [sendingEmails, setSendingEmails] = useState(false);
  const [emailList, setEmailList] = useState([]);
  const [updatingPaymentStatus, setUpdatingPaymentStatus] = useState(false);
  const [updatingPaidAmount, setUpdatingPaidAmount] = useState(false);
  const [editingPaidAmount, setEditingPaidAmount] = useState(null);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);

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
      toast.error(
        error.response?.data?.message || "Failed to fetch order details"
      );
      navigate("/orders");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (updatingStatus) return;

    if (newStatus === orderData?.order?.status?.toString()) {
      return;
    }

    setSelectedStatus(newStatus);
    setShowStatusModal(true);
  };

  const confirmStatusChange = async () => {
    if (!selectedStatus) return;

    setUpdatingStatus(true);
    try {
      const response = await axiosInstance.put(`/orders/update-status/${id}`, {
        status: parseInt(selectedStatus),
      });

      if (response.data.success) {
        toast.success(
          response.data.message || "Order status updated successfully"
        );
        setOrderData((prev) => ({
          ...prev,
          order: {
            ...prev.order,
            status: response.data.data.new_status.toString(),
            status_change_desc: response.data.data.status_change_desc,
          },
        }));
      } else {
        throw new Error(response.data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Status update error:", error);
      toast.error(
        error.response?.data?.message || "Failed to update order status"
      );
    } finally {
      setUpdatingStatus(false);
      setShowStatusModal(false);
      setSelectedStatus(null);
    }
  };

  const isStatusTransitionAllowed = (currentStatus, newStatus) => {
    const allowedTransitions = {
      0: ["1", "2", "3"],
      1: ["4"],
      2: ["0", "1", "3"],
      3: [],
      4: [],
    };

    return allowedTransitions[currentStatus]?.includes(newStatus) || false;
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      "0": "Processing",
      "1": "Completed",
      "2": "On Hold",
      "3": "Cancelled",
      "4": "Refunded",
    };
    return statusMap[status?.toString()] || "Unknown";
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      "0": { label: "Processing", variant: "info" },
      "1": { label: "Completed", variant: "success" },
      "2": { label: "On Hold", variant: "secondary" },
      "3": { label: "Cancelled", variant: "danger" },
      "4": { label: "Refunded", variant: "danger" },
    };

    const statusStr = status?.toString();
    const { label, variant } = statusMap[statusStr] || {
      label: "Unknown",
      variant: "secondary",
    };
    return <span className={`badge bg-${variant}`}>{label}</span>;
  };

  const getPaymentType = (type) => {
    const types = {
      "1": "Cash on Delivery",
      "2": "Mobile Banking",
      "3": "Card",
    };
    return types[type] || "Unknown";
  };

  const handleRemoveItem = async (productId) => {
    if (removingItem) return;

    if (
      !window.confirm(
        "Are you sure you want to remove this item from the order?"
      )
    ) {
      return;
    }

    setRemovingItem(true);
    try {
      const response = await axiosInstance.delete(
        `/orders/products/${id}/remove/${productId}`
      );

      if (response.data.success) {
        toast.success("Item removed successfully");
        // Update the order items list
        setOrderData((prev) => ({
          ...prev,
          order_items: prev.order_items.filter(
            (item) => item.product_id !== productId
          ),
          order: {
            ...prev.order,
            item_subtotal: response.data.data.item_subtotal,
            total_amount: response.data.data.total_amount,
          },
        }));
      } else {
        throw new Error(response.data.message || "Failed to remove item");
      }
    } catch (error) {
      console.error("Remove item error:", error);
      toast.error(error.response?.data?.message || "Failed to remove item");
    } finally {
      setRemovingItem(false);
    }
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (updatingQuantity || !newQuantity || newQuantity < 1) return;

    setUpdatingQuantity(true);
    try {
      const response = await axiosInstance.put(
        `/orders/products/${id}/update-quantity/${productId}`,
        {
          quantity: parseInt(newQuantity),
        }
      );

      if (response.data.success) {
        toast.success("Quantity updated successfully");
        // Update the order items and totals
        setOrderData((prev) => ({
          ...prev,
          order_items: prev.order_items.map((item) =>
            item.product_id === productId
              ? { ...item, quantity: parseInt(newQuantity) }
              : item
          ),
          order: {
            ...prev.order,
            item_subtotal: response.data.data.item_subtotal,
            total_amount: response.data.data.total_amount,
          },
        }));
        setEditingItem(null);
      } else {
        throw new Error(response.data.message || "Failed to update quantity");
      }
    } catch (error) {
      console.error("Update quantity error:", error);
      toast.error(error.response?.data?.message || "Failed to update quantity");
    } finally {
      setUpdatingQuantity(false);
    }
  };

  const startEditingQuantity = (item) => {
    setEditingItem(item.product_id);
    setQuantityInput(item.quantity.toString());
  };

  const handleItemSelect = (selectedOption) => {
    if (!selectedOption) return;

    // Check if item is already selected
    if (
      selectedItems.some((item) => item.product_id === selectedOption.value)
    ) {
      toast.error("This item is already selected");
      return;
    }

    setSelectedItems((prev) => [
      ...prev,
      {
        product_id: selectedOption.value,
        name: selectedOption.label,
        price: selectedOption.price,
        image: selectedOption.image,
        quantity: 1,
      },
    ]);
  };

  const handleItemRemove = (index) => {
    setSelectedItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddItems = async () => {
    if (selectedItems.length === 0) {
      toast.error("Please select at least one item");
      return;
    }

    setAddingItemsLoading(true);
    try {
      // Add items sequentially
      for (const item of selectedItems) {
        const response = await axiosInstance.post(`/orders/add-product/${id}`, {
          product_id: item.product_id,
          quantity: item.quantity,
        });

        if (!response.data.success) {
          throw new Error(response.data.message || "Failed to add item");
        }
      }

      toast.success("Items added successfully");
      // Refresh order data
      await fetchOrder();
      // Reset form
      setSelectedItems([]);
      setIsAddingItems(false);
    } catch (error) {
      console.error("Error adding items:", error);
      toast.error(error.response?.data?.message || "Failed to add items");
    } finally {
      setAddingItemsLoading(false);
    }
  };

  const handleAddEmail = () => {
    const email = emailInput.trim();
    if (!email) return;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (emailList.includes(email)) {
      toast.error("This email is already added");
      return;
    }

    setEmailList((prev) => [...prev, email]);
    setEmailInput("");
  };

  const handleRemoveEmail = (emailToRemove) => {
    setEmailList((prev) => prev.filter((email) => email !== emailToRemove));
  };

  const handleSendEmails = async () => {
    if (emailList.length === 0) {
      toast.error("Please add at least one email address");
      return;
    }

    setSendingEmails(true);
    try {
      const response = await axiosInstance.post(
        `/orders/sendOrderEmails/${id}`,
        {
          emails: emailList,
        }
      );

      if (response.data.success) {
        toast.success("Order details sent successfully");
        setShowEmailModal(false);
        setEmailList([]);
      } else {
        throw new Error(response.data.message || "Failed to send emails");
      }
    } catch (error) {
      console.error("Error sending emails:", error);
      toast.error(
        error.response?.data?.message || "Failed to send order details"
      );
    } finally {
      setSendingEmails(false);
    }
  };

  const handlePaymentStatusChange = async (paymentId, newStatus) => {
    if (updatingPaymentStatus) return;

    setUpdatingPaymentStatus(true);
    try {
      const response = await axiosInstance.put(
        `/payments/update-status/${paymentId}`,
        {
          status: parseInt(newStatus),
        }
      );

      if (response.data.success) {
        toast.success("Payment status updated successfully");
        // Refresh the order data to get updated values
        await fetchOrder();
      } else {
        throw new Error(
          response.data.message || "Failed to update payment status"
        );
      }
    } catch (error) {
      console.error("Payment status update error:", error);
      toast.error(
        error.response?.data?.message || "Failed to update payment status"
      );
    } finally {
      setUpdatingPaymentStatus(false);
    }
  };

  const handlePaidAmountChange = async (paymentId, newAmount) => {
    if (updatingPaidAmount || !newAmount || newAmount < 0) return;

    // Validate amount
    const payment = orderData.payments.find((p) => p.payment_id === paymentId);
    if (!payment) return;

    const totalAmount = parseFloat(payment.amount);
    const paidAmount = parseFloat(newAmount);

    if (paidAmount > totalAmount) {
      toast.error("Paid amount cannot exceed total amount");
      return;
    }

    setUpdatingPaidAmount(true);
    try {
      const response = await axiosInstance.put(
        `/payments/update-paid-amount/${paymentId}`,
        {
          padi_amount: paidAmount
        }
      );

      if (response.data.success) {
        toast.success("Paid amount updated successfully");
        // Refresh the order data to get updated values
        await fetchOrder();
      } else {
        throw new Error(
          response.data.message || "Failed to update paid amount"
        );
      }
    } catch (error) {
      console.error("Paid amount update error:", error);
      toast.error(
        error.response?.data?.message || "Failed to update paid amount"
      );
    } finally {
      setUpdatingPaidAmount(false);
      setEditingPaidAmount(null);
    }
  };

  const handleGenerateInvoice = () => {
    if (generatingInvoice || !orderData) return;

    setGeneratingInvoice(true);
    try {
      // Create a new window for printing
      const printWindow = window.open('', '_blank');

      // Generate invoice HTML content using the component
      const invoiceContent = InvoiceDocument({ orderData });

      // Write the content to the new window
      printWindow.document.write(invoiceContent);
      printWindow.document.close();

      // Wait for content to load then print
      printWindow.onload = function() {
        // Adding a small timeout to ensure all styles and images are loaded before printing
        setTimeout(() => {
          printWindow.print();
          // Close the window after printing (optional)
          // printWindow.close();
        }, 500);
      };

      toast.success("Invoice generated successfully");
    } catch (error) {
      console.error("Invoice generation error:", error);
      toast.error("Failed to generate invoice");
    } finally {
      setGeneratingInvoice(false);
    }
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

  // Helper function to get customer name
  const getCustomerName = () => {
    if (user?.name) return user.name;
    if (order.user_name) return order.user_name;
    return 'N/A';
  };

  // Helper function to get customer phone
  const getCustomerPhone = () => {
    if (user?.phone) return user.phone;
    if (order.user_phone) return order.user_phone;
    return 'N/A';
  };

  // Helper function to get customer address
  const getCustomerAddress = () => {
    if (user?.address) return user.address;
    if (order.address) return order.address;
    return 'N/A';
  };

  return (
    <div className="categories-container">
      <Card>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">Order Details</h2>
            <div className="d-flex gap-2">
              <Button
                variant="outline-success"
                onClick={handleGenerateInvoice}
                disabled={generatingInvoice}
                className="d-flex align-items-center gap-2"
              >
                {generatingInvoice ? (
                  <>
                    <FaSpinner className="spinner-border spinner-border-sm" /> Generating...
                  </>
                ) : (
                  <>
                    <FaFileInvoice /> Generate Invoice
                  </>
                )}
              </Button>
              <Button
                variant="outline-info"
                onClick={() => setShowEmailModal(true)}
                className="d-flex align-items-center gap-2"
              >
                <FaEnvelope /> Resend Order Details
              </Button>
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

          {/* Email Modal */}
          <Modal
            show={showEmailModal}
            onHide={() => setShowEmailModal(false)}
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>Send Order Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Email Addresses</Form.Label>
                <div className="d-flex gap-2 mb-2">
                  <Form.Control
                    type="email"
                    placeholder="Enter email address"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddEmail();
                      }
                    }}
                  />
                  <Button variant="outline-primary" onClick={handleAddEmail}>
                    Add
                  </Button>
                </div>
                {emailList.length > 0 && (
                  <div className="border rounded p-2">
                    {emailList.map((email, index) => (
                      <div
                        key={index}
                        className="d-flex justify-content-between align-items-center mb-1"
                      >
                        <span>{email}</span>
                        <Button
                          variant="link"
                          className="text-danger p-0"
                          onClick={() => handleRemoveEmail(email)}
                        >
                          <FaTimes />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowEmailModal(false);
                  setEmailList([]);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSendEmails}
                disabled={sendingEmails || emailList.length === 0}
                className="d-flex align-items-center gap-2"
              >
                {sendingEmails ? (
                  <>
                    <FaSpinner className="spinner-border spinner-border-sm" />{" "}
                    Sending...
                  </>
                ) : (
                  <>
                    <FaEnvelope /> Send Emails
                  </>
                )}
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Status Change Confirmation Modal */}
          <Modal
            show={showStatusModal}
            onHide={() => setShowStatusModal(false)}
          >
            <Modal.Header closeButton>
              <Modal.Title>Confirm Status Change</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>
                Are you sure you want to change the order status from{" "}
                <strong>{getStatusLabel(orderData?.order?.status)}</strong> to{" "}
                <strong>{getStatusLabel(selectedStatus)}</strong>?
              </p>
              {!isStatusTransitionAllowed(
                orderData?.order?.status?.toString(),
                selectedStatus
              ) && (
                <div className="alert alert-warning">
                  This status transition may not be allowed. Please verify
                  before proceeding.
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowStatusModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={confirmStatusChange}
                disabled={updatingStatus}
              >
                {updatingStatus ? (
                  <>
                    <FaSpinner className="me-2" spin /> Updating...
                  </>
                ) : (
                  "Confirm Change"
                )}
              </Button>
            </Modal.Footer>
          </Modal>

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
                      <small className="text-muted">
                        {order.status_change_desc}
                      </small>
                    </div>
                  )}
                </Col>
                <Col md={6}>
                  <div className="mb-2">
                    <strong>Item Subtotal:</strong> ৳
                    {parseFloat(order.item_subtotal).toLocaleString()}
                  </div>
                  <div className="mb-2">
                    <strong>Shipping Charge:</strong> ৳
                    {parseFloat(order.shipping_charge).toLocaleString()}
                  </div>
                  {parseFloat(order.discount) > 0 && (
                    <div className="mb-2">
                      <strong>Discount:</strong> ৳
                      {parseFloat(order.discount).toLocaleString()}
                    </div>
                  )}
                  <div className="mb-2">
                    <strong>Total Amount:</strong> ৳
                    {parseFloat(order.total_amount).toLocaleString()}
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
                    <strong>Name:</strong> {getCustomerName()}
                  </div>
                  {user?.email && (
                    <div className="mb-2">
                      <strong>Email:</strong> {user.email}
                    </div>
                  )}
                  <div className="mb-2">
                    <strong>Phone:</strong> {getCustomerPhone()}
                  </div>
                  <div>
                    <strong>Address:</strong> {getCustomerAddress()}
                  </div>
                </Col>
                <Col md={6}>
                  <h6 className="mb-3">Shipping Address</h6>
                  {shipping_address ? (
                    <>
                      <div className="mb-2">
                        <strong>Name:</strong> {shipping_address.f_name}{" "}
                        {shipping_address.l_name}
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
                    </>
                  ) : (
                    <>
                      <div className="mb-2">
                        <strong>Name:</strong> {getCustomerName()}
                      </div>
                      <div className="mb-2">
                        <strong>Phone:</strong> {getCustomerPhone()}
                      </div>
                      <div className="mb-2">
                        <strong>Address:</strong> {getCustomerAddress()}
                      </div>
                      <div className="text-muted">
                        <small>Using customer's address as shipping address</small>
                      </div>
                    </>
                  )}
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
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <Form.Select
                              value={payment.status}
                              onChange={(e) =>
                                handlePaymentStatusChange(
                                  payment.payment_id,
                                  e.target.value
                                )
                              }
                              disabled={updatingPaymentStatus}
                              size="sm"
                              style={{ width: "auto" }}
                            >
                              <option value="0">Unpaid</option>
                              <option value="1">Paid by Cash</option>
                              <option value="3">Paid by Bank</option>
                              <option value="4">Paid by Mobile Bank</option>
                            </Form.Select>
                            {updatingPaymentStatus && (
                              <FaSpinner className="spinner-border spinner-border-sm" />
                            )}
                          </div>
                        </td>
                        <td>৳{parseFloat(payment.amount).toLocaleString()}</td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            {editingPaidAmount === payment.payment_id ? (
                              <div className="d-flex align-items-center gap-2">
                                <Form.Control
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  defaultValue={payment.paid_amount}
                                  onKeyPress={(e) => {
                                    if (e.key === "Enter") {
                                      handlePaidAmountChange(
                                        payment.payment_id,
                                        e.target.value
                                      );
                                    }
                                  }}
                                  onBlur={(e) => {
                                    handlePaidAmountChange(
                                      payment.payment_id,
                                      e.target.value
                                    );
                                  }}
                                  autoFocus
                                  size="sm"
                                  style={{ width: "120px" }}
                                  disabled={updatingPaidAmount}
                                />
                                {updatingPaidAmount && (
                                  <FaSpinner className="spinner-border spinner-border-sm" />
                                )}
                              </div>
                            ) : (
                              <div
                                className="d-flex align-items-center gap-2"
                                onClick={() =>
                                  setEditingPaidAmount(payment.payment_id)
                                }
                                style={{ cursor: "pointer" }}
                              >
                                <span>
                                  ৳
                                  {parseFloat(
                                    payment.paid_amount
                                  ).toLocaleString()}
                                </span>
                                <FaEdit size={12} className="text-muted" />
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          ৳{parseFloat(payment.due_amount).toLocaleString()}
                        </td>
                        <td>
                          <Badge
                            bg={
                              payment.payment_type === "1" ? "success" : "info"
                            }
                          >
                            {getPaymentType(payment.payment_type)}
                          </Badge>
                        </td>
                        <td>
                          {payment.transaction_id ? (
                            <span className="text-muted">
                              {payment.transaction_id}
                            </span>
                          ) : payment.payment_type === "1" ? (
                            <span className="text-muted">
                              N/A (Cash on Delivery)
                            </span>
                          ) : (
                            <span className="text-muted">Pending</span>
                          )}
                        </td>
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
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0 d-flex align-items-center">
                  <FaShoppingCart className="me-2" /> Order Items
                </h5>
                <Button
                  variant="outline-primary"
                  onClick={() => setIsAddingItems(!isAddingItems)}
                  className="d-flex align-items-center gap-2"
                >
                  {isAddingItems ? <FaTimes /> : <FaPlus />}
                  {isAddingItems ? "Cancel" : "Add Items"}
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {isAddingItems && (
                <div className="mb-4">
                  <Form.Group className="mb-3">
                    <Form.Label>Add Items</Form.Label>
                    <Select
                      cacheOptions
                      defaultOptions
                      onChange={handleItemSelect}
                      placeholder="Search and select items..."
                      noOptionsMessage={() => "No items found"}
                      loadingMessage={() => "Loading items..."}
                      formatOptionLabel={(option) => (
                        <div className="d-flex align-items-center">
                          {option.image && (
                            <img
                              src={option.image}
                              alt={option.label}
                              style={{
                                width: "30px",
                                height: "30px",
                                objectFit: "cover",
                                marginRight: "10px",
                              }}
                              className="rounded"
                            />
                          )}
                          <div>
                            <div>{option.label}</div>
                            <small className="text-muted">
                              Price: ৳
                              {parseFloat(option.price).toLocaleString()} |
                              Available: {option.quantity}
                            </small>
                          </div>
                        </div>
                      )}
                    />
                  </Form.Group>

                  {selectedItems.length > 0 && (
                    <div className="mb-3">
                      <h6>Selected Items</h6>
                      {selectedItems.map((item, index) => (
                        <div key={index} className="border rounded p-3 mb-2">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <div className="d-flex align-items-center">
                              {item.image && (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  style={{
                                    width: "40px",
                                    height: "40px",
                                    objectFit: "cover",
                                    marginRight: "10px",
                                  }}
                                  className="rounded"
                                />
                              )}
                              <div>
                                <strong>{item.name}</strong>
                                <div className="text-muted">
                                  Price: ৳
                                  {parseFloat(item.price).toLocaleString()}
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="link"
                              className="text-danger p-0"
                              onClick={() => handleItemRemove(index)}
                            >
                              <FaTrash />
                            </Button>
                          </div>
                          <Row>
                            <Col md={6}>
                              <Form.Group>
                                <Form.Label>Quantity</Form.Label>
                                <Form.Control
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => {
                                    const newItems = [...selectedItems];
                                    newItems[index].quantity = parseInt(
                                      e.target.value
                                    );
                                    setSelectedItems(newItems);
                                  }}
                                  required
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Label>Subtotal</Form.Label>
                              <div className="form-control bg-light">
                                ৳
                                {(
                                  parseFloat(item.price) * item.quantity
                                ).toLocaleString()}
                              </div>
                            </Col>
                          </Row>
                        </div>
                      ))}
                      <Button
                        variant="primary"
                        onClick={handleAddItems}
                        disabled={addingItemsLoading}
                        className="d-flex align-items-center gap-2"
                      >
                        {addingItemsLoading ? (
                          <>
                            <FaSpinner className="spinner-border spinner-border-sm" />{" "}
                            Adding Items...
                          </>
                        ) : (
                          <>
                            <FaPlus /> Add Items to Order
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )}

              <div className="table-responsive">
                <Table className="table-hover align-middle">
                  <thead className="bg-light">
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Subtotal</th>
                      <th>Actions</th>
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
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  objectFit: "cover",
                                }}
                              />
                            )}
                            <div>
                              <h6 className="mb-0">{item.name}</h6>
                              {item.is_bundle === 1 && (
                                <small className="text-muted">
                                  Bundle Product
                                </small>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>৳{parseFloat(item.price).toLocaleString()}</td>
                        <td>
                          {editingItem === item.product_id ? (
                            <div className="d-flex align-items-center gap-2">
                              <Form.Control
                                type="number"
                                min="1"
                                value={quantityInput}
                                onChange={(e) =>
                                  setQuantityInput(e.target.value)
                                }
                                style={{ width: "80px" }}
                                disabled={updatingQuantity}
                              />
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() =>
                                  handleUpdateQuantity(
                                    item.product_id,
                                    quantityInput
                                  )
                                }
                                disabled={updatingQuantity}
                              >
                                {updatingQuantity ? (
                                  <FaSpinner className="spin" />
                                ) : (
                                  "Save"
                                )}
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                  setEditingItem(null);
                                  setQuantityInput("");
                                }}
                                disabled={updatingQuantity}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <div className="d-flex align-items-center gap-2">
                              <span>{item.quantity}</span>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => startEditingQuantity(item)}
                                disabled={updatingQuantity || removingItem}
                              >
                                <FaEdit />
                              </Button>
                            </div>
                          )}
                        </td>
                        <td>
                          ৳
                          {(
                            parseFloat(item.price) * parseInt(item.quantity)
                          ).toLocaleString()}
                        </td>
                        <td>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleRemoveItem(item.product_id)}
                            disabled={updatingQuantity || removingItem}
                          >
                            {removingItem ? (
                              <FaSpinner className="spin" />
                            ) : (
                              <FaTrash />
                            )}
                          </Button>
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
                        <strong>
                          ৳{parseFloat(order.item_subtotal).toLocaleString()}
                        </strong>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="3" className="text-end">
                        <strong>Shipping Charge:</strong>
                      </td>
                      <td>
                        <strong>
                          ৳{parseFloat(order.shipping_charge).toLocaleString()}
                        </strong>
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
                        <strong>
                          ৳{parseFloat(order.total_amount).toLocaleString()}
                        </strong>
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
                  <span>
                    Discount Amount: ৳
                    {parseFloat(coupon.amount).toLocaleString()}
                  </span>
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
