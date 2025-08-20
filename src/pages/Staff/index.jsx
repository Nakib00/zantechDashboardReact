import { useEffect, useState } from "react";
import axiosInstance from "@/config/axios";
import usePageTitle from "@/hooks/usePageTitle";
import toast from "react-hot-toast";
import CustomModal from "@/components/CustomModal";
import { Form, Button } from "react-bootstrap";

const Staff = () => {
  usePageTitle("Manage Staffs");

  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    type: "stuff",
    password: "zantech123",
  });
  const [searchParams, setSearchParams] = useState({
    search: "",
    page: 1,
    limit: 10,
  });

  const fetchStaffs = async () => {
    setLoading(true);
    try {
      const params = {
        page: searchParams.page,
        limit: searchParams.limit,
        ...(searchParams.search && { search: searchParams.search }),
      };
      const { data } = await axiosInstance.get("/stuff", {
        params,
      });

      if (!data.success) throw new Error(data.message);

      setStaffs(data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch staffs");
      setStaffs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form Submitted:", formData);
    try {
      const response = await axiosInstance.post("/register", formData);
      if (response.data.success) {
        toast.success(response.data.message || "Customer added successfully");
        fetchStaffs();
        setCreateModalOpen(false);
      } else {
        throw new Error(response.data.message || "Failed to add customer");
      }
    } catch (error) {
      let errorMessage = "Something went wrong";

      if (error.response?.data) {
        const { message, errors } = error.response.data;

        if (errors) {
          errorMessage = Object.values(errors).flat().join(", ");
        } else if (message) {
          errorMessage = message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);

      if (error.response?.status >= 500) {
        setCreateModalOpen(false);
      }
    }
  };

  useEffect(() => {
    fetchStaffs();
  }, [searchParams.page, searchParams.limit, searchParams.search]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Manage Staffs</h2>

      {/* Controls: Search + Rows per page */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "40px",
        }}
      >
        <div style={{ display: "flex", gap: "20px" }}>
          <input
            type="text"
            placeholder="Search staff..."
            value={searchParams.search}
            onChange={(e) =>
              setSearchParams({
                ...searchParams,
                search: e.target.value,
                page: 1,
              })
            }
            className="border rounded px-3 py-2 w-full sm:w-64 focus:outline-none focus:ring focus:ring-blue-300"
          />
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700">Rows per page:</label>
            <select
              value={searchParams.limit}
              onChange={(e) =>
                setSearchParams({
                  ...searchParams,
                  limit: Number(e.target.value),
                  page: 1,
                })
              }
              className="border rounded px-2 py-1"
            >
              {[5, 10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button className="actionBtn" onClick={() => setCreateModalOpen(true)}>
          Create Staff
        </button>
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
                <th>Address</th>
                <th>Type</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {staffs?.map((staff) => (
                <tr key={staff?.id}>
                  <td className="fw-medium">#{staff?.id}</td>
                  <td>{staff?.name}</td>
                  <td>{staff?.email}</td>
                  <td>{staff?.phone}</td>
                  <td>{staff?.address || "N/A"}</td>
                  <td>{staff?.type}</td>
                  <td className="fw-medium">{staff?.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <CustomModal
        title={"Create Staff"}
        show={isCreateModalOpen}
        onHide={setCreateModalOpen}
      >
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="staffName">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="staffEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="staffPhone">
            <Form.Label>Phone</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter phone number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="staffAddress">
            <Form.Label>Address</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter address"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="staffAddress">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group
            style={{ display: "flex", alignItems: "baseline", gap: "16px" }}
            className="mb-3"
            controlId="staffType"
          >
            <Form.Label>Type</Form.Label>
            <Form.Select
              name="type"
              value={formData.type}
              onChange={handleChange}
            >
              <option value="admin">Admin</option>
              <option value="stuff">Stuff</option>
              <option value="member">Member</option>
            </Form.Select>
          </Form.Group>

          <div className="d-flex justify-content-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save
            </Button>
          </div>
        </Form>
      </CustomModal>
    </div>
  );
};

export default Staff;
