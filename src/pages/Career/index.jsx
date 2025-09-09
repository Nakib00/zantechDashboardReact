import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaSpinner,
  FaTimes,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import axiosInstance from "../../config/axios";
import {
  Card,
  Form,
  InputGroup,
  Button,
  Row,
  Col,
  Modal,
} from "react-bootstrap";
import Loading from "../../components/Loading";
import "./Career.css";
import usePageTitle from '../../hooks/usePageTitle';
import CommonTable from "../../components/Common/CommonTable";

const Careers = () => {
  usePageTitle('Manage Careers');
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [formData, setFormData] = useState({
    job_title: "",
    description: "",
    vacancy: "",
    job_type: "Full Time",
    salary: "",
    deadline: "",
    department: "",
    responsibilities: "",
  });
  const [searchParams, setSearchParams] = useState({
    search: "",
  });
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await fetchCareers();
      } finally {
        setPageLoading(false);
      }
    };

    if (pageLoading) {
      loadInitialData();
    } else {
      fetchCareers();
    }
  }, []);

  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeoutId = setTimeout(() => {
      setIsSearching(true);
      fetchCareers();
    }, 500);

    setSearchTimeout(timeoutId);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [searchParams.search]);

  const fetchCareers = async () => {
    setLoading(true);
    setTableLoading(true);
    try {
      const params = {
        ...(searchParams.search && { search: searchParams.search }),
      };

      const response = await axiosInstance.get("/careers", { params });
      const result = response.data;

      if (!result.success) {
        throw new Error(result.message || "Failed to fetch careers");
      }

      await new Promise((resolve) => setTimeout(resolve, 300));

      setCareers(result.data);
    } catch (error) {
      console.error("Error fetching careers:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch careers"
      );
      setCareers([]);
    } finally {
      setLoading(false);
      setTableLoading(false);
      setIsSearching(false);
    }
  };

  const handleAddCareer = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/careers", formData);
      fetchCareers();
      setShowModal(false);
      setFormData({
        job_title: "",
        description: "",
        vacancy: "",
        job_type: "Full Time",
        salary: "",
        deadline: "",
        department: "",
        responsibilities: "",
      });
      toast.success("Career added successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add career");
    }
  };

  const handleEditCareer = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.put(`/careers/${selectedCareer.id}`, formData);
      fetchCareers();
      setShowModal(false);
      setFormData({
        job_title: "",
        description: "",
        vacancy: "",
        job_type: "Full Time",
        salary: "",
        deadline: "",
        department: "",
        responsibilities: "",
      });
      setSelectedCareer(null);
      toast.success("Career updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update career");
    }
  };

  const handleDeleteCareer = async (id) => {
    if (window.confirm("Are you sure you want to delete this career?")) {
      try {
        setTableLoading(true);
        await axiosInstance.delete(`/careers/${id}`);
        toast.success("Career deleted successfully");
        fetchCareers();
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to delete career"
        );
      } finally {
        setTableLoading(false);
      }
    }
  };
  
  const handleToggleStatus = async (id) => {
    try {
      await axiosInstance.patch(`/careers/status/${id}`);
      toast.success("Status updated successfully");
      fetchCareers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleSearch = (e) => {
    const { value } = e.target;
    setSearchParams((prev) => ({
      ...prev,
      search: value,
    }));
  };

  const openEditModal = (career) => {
    setModalMode("edit");
    setSelectedCareer(career);
    setFormData({
      job_title: career.job_title,
      description: career.description,
      vacancy: career.vacancy,
      job_type: career.job_type,
      salary: career.salary,
      deadline: career.deadline,
      department: career.department,
      responsibilities: career.responsibilities,
    });
    setShowModal(true);
  };

  const openAddModal = () => {
    setModalMode("add");
    setSelectedCareer(null);
    setFormData({
      job_title: "",
      description: "",
      vacancy: "",
      job_type: "Full Time",
      salary: "",
      deadline: "",
      department: "",
      responsibilities: "",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({
      job_title: "",
      description: "",
      vacancy: "",
      job_type: "Full Time",
      salary: "",
      deadline: "",
      department: "",
      responsibilities: "",
    });
    setSelectedCareer(null);
  };

  const headers = [
    { key: 'id', label: 'ID' },
    { key: 'job_title', label: 'Job Title' },
    { key: 'deadline', label: 'Deadline' },
    { key: 'department', label: 'Department' },
    { key: 'created_at', label: 'Created At' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Button
            variant={row.status === 1 ? 'success' : 'danger'}
            size="sm"
            onClick={() => handleToggleStatus(row.id)}
        >
            {row.status === 1 ? "Active" : "Inactive"}
        </Button>
      ),
    },
  ];

  const renderActions = (career) => (
    <div className="d-flex gap-2">
      <Button
        variant="outline-primary"
        size="sm"
        onClick={() => openEditModal(career)}
        disabled={tableLoading}
        title="Edit"
        className="view-btn"
      >
        <FaEdit />
      </Button>
      <Button
        variant="outline-danger"
        size="sm"
        onClick={() => handleDeleteCareer(career.id)}
        disabled={tableLoading}
        title="Delete"
        className="delete-btn"
      >
        <FaTrash />
      </Button>
    </div>
  );

  if (pageLoading) {
    return <Loading />;
  }

  return (
    <div className="categories-container">
      <Card className="modern-card">
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="page-title mb-1">Careers</h2>
              {loading && tableLoading ? (
                <div className="d-flex align-items-center">
                  <FaSpinner className="spinner-border spinner-border-sm me-2" />
                  <p className="page-subtitle mb-0">Loading careers...</p>
                </div>
              ) : (
                <p className="page-subtitle mb-0">
                  Showing {careers.length} careers
                </p>
              )}
            </div>
            <Button
              variant="primary"
              onClick={openAddModal}
              className="create-category-btn"
            >
              <FaPlus className="me-2" /> Add Career
            </Button>
          </div>

          <div className="filters-section mb-4">
            <Row className="g-3 align-items-center">
              <Col md={4}>
                <Form onSubmit={(e) => e.preventDefault()}>
                  <InputGroup className="search-box">
                    <InputGroup.Text className="search-icon">
                      {isSearching ? (
                        <FaSpinner className="spinner-border spinner-border-sm" />
                      ) : (
                        <FaSearch />
                      )}
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Search careers..."
                      name="search"
                      value={searchParams.search}
                      onChange={handleSearch}
                      disabled={loading}
                      className={`search-input ${
                        isSearching ? "searching" : ""
                      }`}
                    />
                    {searchParams.search && !isSearching && (
                      <Button
                        variant="link"
                        className="clear-search"
                        onClick={() => {
                          setSearchParams((prev) => ({ ...prev, search: "" }));
                        }}
                        disabled={loading}
                      >
                        <FaTimes />
                      </Button>
                    )}
                  </InputGroup>
                </Form>
              </Col>
            </Row>
          </div>

          <CommonTable
            headers={headers}
            data={careers}
            tableLoading={tableLoading}
            loading={loading}
            renderActions={renderActions}
          />
          <Modal show={showModal} onHide={closeModal} centered>
            <Modal.Header closeButton>
              <Modal.Title>
                {modalMode === "add" ? "Add New Career" : "Edit Career"}
              </Modal.Title>
            </Modal.Header>
            <Form
              onSubmit={
                modalMode === "add" ? handleAddCareer : handleEditCareer
              }
            >
              <Modal.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Job Title</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.job_title}
                    onChange={(e) =>
                      setFormData({ ...formData, job_title: e.target.value })
                    }
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                  />
                </Form.Group>
                 <Form.Group className="mb-3">
                  <Form.Label>Vacancy</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.vacancy}
                    onChange={(e) =>
                      setFormData({ ...formData, vacancy: e.target.value })
                    }
                    required
                  />
                </Form.Group>
                 <Form.Group className="mb-3">
                  <Form.Label>Job Type</Form.Label>
                  <Form.Control
                    as="select"
                    value={formData.job_type}
                    onChange={(e) =>
                      setFormData({ ...formData, job_type: e.target.value })
                    }
                  >
                    <option>Full Time</option>
                    <option>Part Time</option>
                    <option>Contract</option>
                    <option>Internship</option>
                  </Form.Control>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Salary</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.salary}
                    onChange={(e) =>
                      setFormData({ ...formData, salary: e.target.value })
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Deadline</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.deadline}
                    onChange={(e) =>
                      setFormData({ ...formData, deadline: e.target.value })
                    }
                  />
                </Form.Group>
                 <Form.Group className="mb-3">
                  <Form.Label>Department</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Responsibilities</Form.Label>
                  <Form.Control
                    as="textarea"
                    value={formData.responsibilities}
                    onChange={(e) =>
                      setFormData({ ...formData, responsibilities: e.target.value })
                    }
                    rows={3}
                  />
                </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  {modalMode === "add" ? "Add Career" : "Update Career"}
                </Button>
              </Modal.Footer>
            </Form>
          </Modal>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Careers;