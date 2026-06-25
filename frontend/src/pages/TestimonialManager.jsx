import { useEffect, useMemo, useState } from "react";
import { API_BASE_URL, api } from "../lib/api";

const emptyForm = {
  customerName: "",
  location: "",
  diagnose: "",
  status: "active",
  message: "",
  image: null,
};

function getImageUrl(image) {
  if (!image) return "";
  return image.startsWith("http") ? image : `${API_BASE_URL}${image}`;
}

export default function TestimonialManager() {
  const [testimonials, setTestimonials] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const imagePreview = useMemo(() => {
    if (form.image) return URL.createObjectURL(form.image);
    if (editingTestimonial?.image) return getImageUrl(editingTestimonial.image);
    return "";
  }, [editingTestimonial, form.image]);

  const fetchTestimonials = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await api("/api/admin/testimonials");
      setTestimonials(data.testimonials || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function loadTestimonials() {
      try {
        const data = await api("/api/admin/testimonials");
        if (!isMounted) return;
        setTestimonials(data.testimonials || []);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadTestimonials();

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
    setEditingTestimonial(null);
    setError("");
    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    const payload = new FormData();
    payload.append("customerName", form.customerName);
    payload.append("location", form.location);
    payload.append("diagnose", form.diagnose);
    payload.append("status", form.status);
    payload.append("message", form.message);
    if (form.image) {
      payload.append("image", form.image);
    }

    try {
      if (editingTestimonial) {
        await api(`/api/admin/testimonials/${editingTestimonial._id}`, {
          method: "PUT",
          body: payload,
        });
        setMessage("Testimonial updated successfully");
      } else {
        await api("/api/admin/testimonials", {
          method: "POST",
          body: payload,
        });
        setMessage("Testimonial added successfully");
      }

      resetForm();
      await fetchTestimonials();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (testimonial) => {
    setEditingTestimonial(testimonial);
    setForm({
      customerName: testimonial.customerName || "",
      location: testimonial.location || "",
      diagnose: testimonial.diagnose || "",
      status: testimonial.status || "active",
      message: testimonial.message || "",
      image: null,
    });
    setError("");
    setMessage("");
  };

  const handleDelete = async (testimonialId) => {
    const confirmed = window.confirm("Are you sure you want to delete this testimonial?");
    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await api(`/api/admin/testimonials/${testimonialId}`, { method: "DELETE" });
      setMessage("Testimonial deleted successfully");
      await fetchTestimonials();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="doctor-module">
      <section className="doctor-editor">
        <div className="banner-section-head">
          <div>
            <p className="admin-panel-label">Testimonials Control</p>
            <h2>{editingTestimonial ? "Edit Testimonial" : "Add Testimonial"}</h2>
          </div>
          {editingTestimonial && (
            <button className="admin-secondary-button" type="button" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>

        <form className="doctor-form" onSubmit={handleSubmit}>
          <div className="doctor-form-grid">
            <label>
              Customer Name
              <input
                type="text"
                required
                value={form.customerName}
                onChange={(event) => setForm({ ...form, customerName: event.target.value })}
                placeholder="e.g. Sarah Smith"
              />
            </label>

            <label>
              Location
              <input
                type="text"
                value={form.location}
                onChange={(event) => setForm({ ...form, location: event.target.value })}
                placeholder="e.g. New York, USA"
              />
            </label>

            <label>
              Diagnosis / Treatment
              <input
                type="text"
                value={form.diagnose}
                onChange={(event) => setForm({ ...form, diagnose: event.target.value })}
                placeholder="e.g. Cardiology"
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

            <label className="banner-file-field">
              Customer Photo
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                required={!editingTestimonial}
                onChange={(event) =>
                  setForm({ ...form, image: event.target.files?.[0] || null })
                }
              />
            </label>
          </div>

          <label className="doctor-about-field">
            Testimonial Message
            <textarea
              required
              value={form.message}
              onChange={(event) => setForm({ ...form, message: event.target.value })}
              placeholder="Enter what the customer said..."
              style={{ minHeight: "100px" }}
            />
          </label>

          {imagePreview && (
            <div className="doctor-preview" style={{ maxWidth: "160px", marginBottom: "16px" }}>
              <img
                src={imagePreview}
                alt={form.customerName || "Customer preview"}
                style={{ borderRadius: "50%", width: "100px", height: "100px", objectFit: "cover" }}
              />
            </div>
          )}

          <button className="btn-primary" type="submit" disabled={saving} style={{ width: "auto", minWidth: "170px" }}>
            {saving ? "Saving..." : editingTestimonial ? "Update Testimonial" : "Add Testimonial"}
          </button>
        </form>
      </section>

      <section className="doctor-list-panel">
        <div className="banner-section-head">
          <div>
            <p className="admin-panel-label">All Testimonials</p>
            <h2>Testimonial List</h2>
          </div>
          <button className="admin-secondary-button" type="button" onClick={fetchTestimonials}>
            Refresh
          </button>
        </div>

        {error && <p className="admin-alert error">{error}</p>}
        {message && <p className="admin-alert success">{message}</p>}

        <div className="banner-table-wrap">
          <table className="banner-table">
            <thead>
              <tr>
                <th style={{ width: "80px" }}>Photo</th>
                <th>Customer</th>
                <th>Message</th>
                <th>Diagnosis & Info</th>
                <th>Status</th>
                <th style={{ width: "180px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6">Loading testimonials...</td>
                </tr>
              ) : testimonials.length === 0 ? (
                <tr>
                  <td colSpan="6">No testimonials added yet.</td>
                </tr>
              ) : (
                testimonials.map((t) => (
                  <tr key={t._id}>
                    <td data-label="Photo">
                      <img
                        src={getImageUrl(t.image)}
                        alt={t.customerName}
                        style={{ width: "50px", height: "50px", borderRadius: "50%", objectFit: "cover" }}
                      />
                    </td>
                    <td data-label="Customer">
                      <div style={{ fontWeight: 600, color: "#1e293b" }}>{t.customerName}</div>
                      {t.location && <div style={{ fontSize: "12px", color: "#64748b" }}>{t.location}</div>}
                    </td>
                    <td data-label="Message" className="cms-content-cell" style={{ maxWidth: "300px" }}>
                      "{t.message}"
                    </td>
                    <td data-label="Diagnosis & Info">
                      {t.diagnose ? (
                        <div style={{ color: "#334155", fontWeight: 500 }}>{t.diagnose}</div>
                      ) : (
                        <span style={{ color: "#94a3b8", fontStyle: "italic" }}>Not specified</span>
                      )}
                    </td>
                    <td data-label="Status">
                      <span className={`banner-status ${t.status}`}>
                        {t.status}
                      </span>
                    </td>
                    <td data-label="Actions">
                      <div className="banner-row-actions">
                        <button type="button" onClick={() => handleEdit(t)}>
                          Edit
                        </button>
                        <button
                          className="danger"
                          type="button"
                          onClick={() => handleDelete(t._id)}
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
