import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaSpinner,
  FaEnvelope,
  FaFileInvoice,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import axiosInstance from "../../config/axios";
import {
  Card,
  Button,
  Form,
} from "react-bootstrap";
import Loading from "../../components/Loading";
import "../Categories/Categories.css";
import OrderInformation from "../../components/Orders/ViewOrder/OrderInformation";
import CustomerInformation from "../../components/Orders/ViewOrder/CustomerInformation";
import PaymentInformation from "../../components/Orders/ViewOrder/PaymentInformation";
import OrderItems from "../../components/Orders/ViewOrder/OrderItems";
import StatusUpdateModal from "../../components/Orders/ViewOrder/StatusUpdateModal";
import EmailModal from "../../components/Orders/ViewOrder/EmailModal";
import InvoiceDocument from '../../components/InvoiceDocument';
import EditShippingAddressModal from "../../components/Orders/EditShippingAddressModal";

const ViewOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showEditAddressModal, setShowEditAddressModal] = useState(false);

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

  const refreshOrderData = async () => {
    setIsRefreshing(true);
    try {
      await fetchOrder();
      toast.success('Order data refreshed');
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setIsRefreshing(false);
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
        setOrderData((prev) => ({
          ...prev,
          order: {
            ...prev.order,
            status: response.data.data.new_status.toString(),
            status_change_desc: response.data.data.status_change_desc,
          },
        }));
        toast.success(response.data.message || "Order status updated successfully");
        refreshOrderData();
      } else {
        throw new Error(response.data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Status update error:", error);
      toast.error(error.response?.data?.message || "Failed to update order status");
    } finally {
      setUpdatingStatus(false);
      setShowStatusModal(false);
      setSelectedStatus(null);
    }
  };

  const handleGenerateInvoice = () => {
    if (generatingInvoice || !orderData) return;

    setGeneratingInvoice(true);
    try {
      const printWindow = window.open('', '_blank');

      const invoiceContent = InvoiceDocument({ orderData });

      printWindow.document.write(invoiceContent);
      printWindow.document.close();

      printWindow.onload = function() {
        setTimeout(() => {
          printWindow.print();
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

  const handleAddressUpdated = (updatedData) => {
    refreshOrderData();
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
    <div className="orders-container">
      <EditShippingAddressModal
        show={showEditAddressModal}
        onHide={() => setShowEditAddressModal(false)}
        orderData={orderData}
        onUpdate={handleAddressUpdated}
      />
      <Card className="modern-card">
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <Button
                variant="link"
                className="p-0 mb-2 text-decoration-none"
                onClick={() => navigate('/orders')}
              >
                <FaArrowLeft className="me-2" /> Back to Orders
              </Button>
              <h2 className="page-title mb-1">Order Details</h2>
              <p className="text-muted mb-0">View and manage order information</p>
            </div>
            <div className="d-flex gap-2">
              <Button
                variant="outline-secondary"
                onClick={refreshOrderData}
                disabled={isRefreshing}
                className="d-flex align-items-center gap-2 modern-btn"
              >
                {isRefreshing ? (
                  <>
                    <FaSpinner className="spinner-border spinner-border-sm" /> Refreshing...
                  </>
                ) : (
                  <>
                    <FaSpinner /> Refresh
                  </>
                )}
              </Button>
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
                className="modern-select me-2"
              >
                <option value="0">Processing</option>
                <option value="1">Completed</option>
                <option value="2">On Hold</option>
                <option value="3">Cancelled</option>
                <option value="4">Refunded</option>
              </Form.Select>
            </div>
          </div>
          
          <EmailModal
            show={showEmailModal}
            handleClose={() => setShowEmailModal(false)}
            orderId={id}
          />
          
          <StatusUpdateModal
            show={showStatusModal}
            handleClose={() => setShowStatusModal(false)}
            selectedStatus={selectedStatus}
            orderStatus={orderData?.order?.status}
            updatingStatus={updatingStatus}
            confirmStatusChange={confirmStatusChange}
          />

          <OrderInformation order={order} />

          <CustomerInformation
            user={user}
            shipping_address={shipping_address}
            order={order}
            setShowEditAddressModal={setShowEditAddressModal}
          />
          
          <PaymentInformation
            payments={payments}
            refreshOrderData={refreshOrderData}
          />

          <OrderItems
            orderItems={order_items}
            orderId={id}
            refreshOrderData={refreshOrderData}
          />
          
          {coupon && (
            <Card className="modern-card mt-4">
              <Card.Header className="bg-light">
                <h5 className="mb-0">Coupon Applied</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-flex align-items-center">
                  <Badge bg="success" className="me-2 modern-badge">
                    {coupon.code}
                  </Badge>
                  <span className="fw-medium">
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