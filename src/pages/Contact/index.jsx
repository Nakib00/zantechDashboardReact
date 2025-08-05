import React, { useState, useEffect } from "react";
import { FaTrash, FaSearch, FaSpinner, FaTimes, FaEye } from "react-icons/fa";
import { toast } from "react-hot-toast";
import axiosInstance from "../../config/axios";
import { Card, Form, InputGroup, Button, Table, Row, Col, Modal } from "react-bootstrap";
import Loading from "../../components/Loading";
import "./Contact.css";
import usePageTitle from '../../hooks/usePageTitle';

const Contact = () => {
  usePageTitle('Manage Contacts');
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState({
    search: "",
  });
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeoutId = setTimeout(() => {
      if (searchParams.search !== "") {
        setIsSearching(true);
        handleSearch(searchParams.search);
      } else {
        setFilteredContacts(contacts);
      }
      setIsSearching(false);
    }, 300);

    setSearchTimeout(timeoutId);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [searchParams.search, contacts]);

  const fetchContacts = async () => {
    try {
      const response = await axiosInstance.get("/contact");
      setContacts(response.data.data);
      setFilteredContacts(response.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch contacts");
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  const handleSearch = (searchTerm) => {
    const searchLower = searchTerm.toLowerCase();
    const filtered = contacts.filter((contact) => {
      return (
        contact.name.toLowerCase().includes(searchLower) ||
        contact.email.toLowerCase().includes(searchLower) ||
        contact.phone.toLowerCase().includes(searchLower)
      );
    });
    setFilteredContacts(filtered);
  };

  const handleSearchChange = (e) => {
    setSearchParams((prev) => ({ ...prev, search: e.target.value }));
  };

  const handleDeleteContact = async (id) => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
      try {
        await axiosInstance.delete(`/contact/${id}`);
        const updatedContacts = contacts.filter((contact) => contact.id !== id);
        setContacts(updatedContacts);
        setFilteredContacts(updatedContacts);
        toast.success("Contact deleted successfully");
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete contact");
      }
    }
  };

  const handleViewMessage = (message, contact) => {
    setSelectedMessage({ message, contact });
    setShowMessageModal(true);
  };

  const handleCloseMessageModal = () => {
    setShowMessageModal(false);
    setSelectedMessage(null);
  };

  const truncateMessage = (message, maxLength = 50) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + "...";
  };

  if (loading && !contacts.length) {
    return <Loading />;
  }

  return (
    <div className="orders-container">
      <Card className="modern-card">
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="page-title mb-1">Contacts</h2>
              <p className="text-muted mb-0">Manage your contact messages and inquiries</p>
            </div>
          </div>

          <div className="filters-section mb-4">
            <Row className="g-3">
              <Col md={4}>
                <div className="search-box">
                  <InputGroup>
                    <InputGroup.Text className="search-icon">
                      {isSearching ? <FaSpinner className="spinner" /> : <FaSearch />}
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Search by name, email or phone..."
                      value={searchParams.search}
                      onChange={handleSearchChange}
                      className="search-input"
                    />
                    {searchParams.search && (
                      <Button
                        variant="link"
                        className="clear-search"
                        onClick={() => {
                          setSearchParams((prev) => ({ ...prev, search: "" }));
                          setFilteredContacts(contacts);
                        }}
                      >
                        <FaTimes />
                      </Button>
                    )}
                  </InputGroup>
                </div>
              </Col>
            </Row>
          </div>

          <div className="table-container">
            <div className="table-responsive">
              <table className="table table-hover modern-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Message</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContacts.length > 0 ? (
                    filteredContacts.map((contact) => (
                      <tr key={contact.id}>
                        <td className="fw-medium">#{contact.id}</td>
                        <td>{contact.name}</td>
                        <td>{contact.email}</td>
                        <td>{contact.phone}</td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <span className="message-preview">
                              {truncateMessage(contact.message)}
                            </span>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleViewMessage(contact.message, contact)}
                              title="View Message"
                              className="view-message-btn"
                            >
                              <FaEye />
                            </Button>
                          </div>
                        </td>
                        <td>{new Date(contact.created_at).toLocaleDateString()}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteContact(contact.id)}
                              title="Delete"
                              className="delete-btn"
                            >
                              <FaTrash />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-4">
                        {searchParams.search ? (
                          <div className="text-muted">
                            No contacts found matching "{searchParams.search}"
                          </div>
                        ) : (
                          <div className="text-muted">No contacts available</div>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Message View Modal */}
      <Modal
        show={showMessageModal}
        onHide={handleCloseMessageModal}
        centered
        className="message-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Message from {selectedMessage?.contact?.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="message-details">
            <div className="contact-info mb-3">
              <p className="mb-1">
                <strong>From:</strong> {selectedMessage?.contact?.name}
              </p>
              <p className="mb-1">
                <strong>Email:</strong> {selectedMessage?.contact?.email}
              </p>
              <p className="mb-1">
                <strong>Phone:</strong> {selectedMessage?.contact?.phone}
              </p>
              <p className="mb-1">
                <strong>Date:</strong>{" "}
                {selectedMessage?.contact?.created_at
                  ? new Date(selectedMessage.contact.created_at).toLocaleString()
                  : ""}
              </p>
            </div>
            <div className="message-content">
              <h6 className="mb-2">Message:</h6>
              <div className="message-text p-3 bg-light rounded">
                {selectedMessage?.message}
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseMessageModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Contact;
