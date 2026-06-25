import { useEffect, useMemo, useState } from "react";
import { API_BASE_URL, api } from "../lib/api";

const emptyForm = {
  name: "",
  status: "active",
  order: 0,
  shortDescription: "",
  image: null,
};

function getImageUrl(image) {
  if (!image) return "";
  return image.startsWith("http") ? image : `${API_BASE_URL}${image}`;
}

export default function ServiceManager() {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingService, setEditingService] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  const selectedCount = selectedIds.length;
  const allSelected = services.length > 0 && selectedCount === services.length;
  const imagePreview = useMemo(() => {
    if (form.image) return URL.createObjectURL(form.image);
    if (editingService?.image) return getImageUrl(editingService.image);
    return "";
  }, [editingService, form.image]);

  const fetchServices = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await api("/api/admin/services");
      setServices(data.services || []);
      setSelectedIds([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function loadServices() {
      try {
        const data = await api("/api/admin/services");
        if (!isMounted) return;
        setServices(data.services || []);
        setSelectedIds([]);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadServices();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (form.image && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [form.image, imagePreview]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingService(null);
    setFormOpen(false);
    setError("");
    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    const payload = new FormData();
    payload.append("name", form.name);
    payload.append("status", form.status);
    payload.append("order", form.order);
    payload.append("shortDescription", form.shortDescription);
    if (form.image) payload.append("image", form.image);

    try {
      if (editingService) {
        await api(`/api/admin/services/${editingService._id}`, {
          method: "PUT",
          body: payload,
        });
        setMessage("Service updated successfully");
      } else {
        await api("/api/admin/services", {
          method: "POST",
          body: payload,
        });
        setMessage("Service added successfully");
      }

      setForm(emptyForm);
      setEditingService(null);
      setFormOpen(false);
      await fetchServices();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setForm({
      name: service.name || "",
      status: service.status || "active",
      order: service.order || 0,
      shortDescription: service.shortDescription || "",
      image: null,
    });
    setError("");
    setMessage("");
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (serviceId) => {
    const confirmed = window.confirm("Delete this service?");
    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await api(`/api/admin/services/${serviceId}`, { method: "DELETE" });
      setMessage("Service deleted successfully");
      await fetchServices();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    const confirmed = window.confirm(`Delete ${selectedIds.length} selected service(s)?`);
    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await api("/api/admin/services", {
        method: "DELETE",
        body: JSON.stringify({ ids: selectedIds }),
      });
      setMessage("Selected services deleted successfully");
      await fetchServices();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleService = (serviceId) => {
    setSelectedIds((current) =>
      current.includes(serviceId)
        ? current.filter((id) => id !== serviceId)
        : [...current, serviceId]
    );
  };

  const toggleAll = () => {
    setSelectedIds(allSelected ? [] : services.map((service) => service._id));
  };

  return (
    <div className="banner-module">
      <section className="banner-editor">
        <div
          className="banner-section-head"
          onClick={() => setFormOpen((o) => !o)}
          style={{ cursor: "pointer", userSelect: "none" }}
        >
          <div>
            <p className="admin-panel-label">Service Control</p>
            <h2>{editingService ? "Edit Service" : "Add Service"}</h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {editingService && (
              <button
                className="admin-secondary-button"
                type="button"
                onClick={(e) => { e.stopPropagation(); resetForm(); }}
              >
                Cancel
              </button>
            )}
            <span style={{ fontSize: "20px", transition: "transform 0.25s", transform: formOpen ? "rotate(180deg)" : "rotate(0deg)", display: "inline-block", color: "var(--primary, #6c63ff)" }}>▾</span>
          </div>
        </div>

        {formOpen && <form className="banner-form" onSubmit={handleSubmit}>
          <label>
            Name
            <input
              type="text"
              required
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
          </label>

          <label>
            Short Description
            <textarea
              required
              rows={3}
              value={form.shortDescription}
              onChange={(event) => setForm({ ...form, shortDescription: event.target.value })}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "6px",
                border: "1px solid var(--border-color, #e2e8f0)",
                background: "var(--input-bg, #ffffff)",
                color: "var(--text-main, #0f172a)",
                fontFamily: "inherit",
                fontSize: "0.875rem",
                resize: "vertical",
              }}
            />
          </label>

          <label>
            Status
            <select
              value={form.status}
              onChange={(event) => setForm({ ...form, status: event.target.value })}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>

          <label>
            Order
            <input
              type="number"
              min="0"
              value={form.order}
              onChange={(event) => setForm({ ...form, order: event.target.value })}
            />
          </label>

          <label className="banner-file-field">
            Image
            <input
              type="file"
              accept="image/png,image/jpeg"
              required={!editingService}
              onChange={(event) =>
                setForm({ ...form, image: event.target.files?.[0] || null })
              }
            />
          </label>

          {imagePreview && (
            <div className="banner-preview">
              <img src={imagePreview} alt={form.name || "Service preview"} />
            </div>
          )}

          <button className="btn-primary" type="submit" disabled={saving}>
            {saving ? "Saving..." : editingService ? "Update Service" : "Add Service"}
          </button>
        </form>}
      </section>

      <section className="banner-list-panel">
        <div className="banner-section-head">
          <div>
            <p className="admin-panel-label">All Services</p>
            <h2>Service List</h2>
          </div>
          <div className="banner-list-actions">
            <button className="admin-secondary-button" type="button" onClick={fetchServices}>
              Refresh
            </button>
            <button
              className="admin-danger-button"
              type="button"
              disabled={selectedCount === 0}
              onClick={handleBulkDelete}
            >
              Delete Selected
            </button>
          </div>
        </div>

        {error && <p className="admin-alert error">{error}</p>}
        {message && <p className="admin-alert success">{message}</p>}

        <div className="banner-table-wrap">
          <table className="banner-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    aria-label="Select all services"
                  />
                </th>
                <th>Image</th>
                <th>Name</th>
                <th>Short Description</th>
                <th>Status</th>
                <th>Order</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7">Loading services...</td>
                </tr>
              ) : services.length === 0 ? (
                <tr>
                  <td colSpan="7">No services added yet.</td>
                </tr>
              ) : (
                services.map((service) => (
                  <tr key={service._id}>
                    <td data-label="Select">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(service._id)}
                        onChange={() => toggleService(service._id)}
                        aria-label={`Select ${service.name}`}
                      />
                    </td>
                    <td data-label="Image">
                      <img
                        className="banner-thumb"
                        src={getImageUrl(service.image)}
                        alt={service.name}
                      />
                    </td>
                    <td data-label="Name">{service.name}</td>
                    <td data-label="Short Description" style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {service.shortDescription}
                    </td>
                    <td data-label="Status">
                      <span className={`banner-status ${service.status}`}>
                        {service.status}
                      </span>
                    </td>
                    <td data-label="Order">{service.order}</td>
                    <td data-label="Actions">
                      <div className="banner-row-actions">
                        <button type="button" onClick={() => handleEdit(service)}>
                          Edit
                        </button>
                        <button
                          className="danger"
                          type="button"
                          onClick={() => handleDelete(service._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
