import { useEffect, useMemo, useState } from "react";
import { API_BASE_URL, api } from "../lib/api";

const emptyForm = {
  name: "",
  status: "active",
  order: 0,
  image: null,
};

function getImageUrl(image) {
  if (!image) return "";
  return image.startsWith("http") ? image : `${API_BASE_URL}${image}`;
}

export default function BannerManager() {
  const [banners, setBanners] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingBanner, setEditingBanner] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const selectedCount = selectedIds.length;
  const allSelected = banners.length > 0 && selectedCount === banners.length;
  const imagePreview = useMemo(() => {
    if (form.image) return URL.createObjectURL(form.image);
    if (editingBanner?.image) return getImageUrl(editingBanner.image);
    return "";
  }, [editingBanner, form.image]);

  const fetchBanners = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await api("/api/admin/banners");
      setBanners(data.banners || []);
      setSelectedIds([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function loadBanners() {
      try {
        const data = await api("/api/admin/banners");
        if (!isMounted) return;
        setBanners(data.banners || []);
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

    loadBanners();

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
    setEditingBanner(null);
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
    if (form.image) payload.append("image", form.image);

    try {
      if (editingBanner) {
        await api(`/api/admin/banners/${editingBanner._id}`, {
          method: "PUT",
          body: payload,
        });
        setMessage("Banner updated successfully");
      } else {
        await api("/api/admin/banners", {
          method: "POST",
          body: payload,
        });
        setMessage("Banner added successfully");
      }

      setForm(emptyForm);
      setEditingBanner(null);
      await fetchBanners();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setForm({
      name: banner.name || "",
      status: banner.status || "active",
      order: banner.order || 0,
      image: null,
    });
    setError("");
    setMessage("");
  };

  const handleDelete = async (bannerId) => {
    const confirmed = window.confirm("Delete this banner?");
    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await api(`/api/admin/banners/${bannerId}`, { method: "DELETE" });
      setMessage("Banner deleted successfully");
      await fetchBanners();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    const confirmed = window.confirm(`Delete ${selectedIds.length} selected banner(s)?`);
    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await api("/api/admin/banners", {
        method: "DELETE",
        body: JSON.stringify({ ids: selectedIds }),
      });
      setMessage("Selected banners deleted successfully");
      await fetchBanners();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleBanner = (bannerId) => {
    setSelectedIds((current) =>
      current.includes(bannerId)
        ? current.filter((id) => id !== bannerId)
        : [...current, bannerId]
    );
  };

  const toggleAll = () => {
    setSelectedIds(allSelected ? [] : banners.map((banner) => banner._id));
  };

  return (
    <div className="banner-module">
      <section className="banner-editor">
        <div className="banner-section-head">
          <div>
            <p className="admin-panel-label">Banner Control</p>
            <h2>{editingBanner ? "Edit Banner" : "Add Banner"}</h2>
          </div>
          {editingBanner && (
            <button className="admin-secondary-button" type="button" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>

        <form className="banner-form" onSubmit={handleSubmit}>
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
              required={!editingBanner}
              onChange={(event) =>
                setForm({ ...form, image: event.target.files?.[0] || null })
              }
            />
          </label>

          {imagePreview && (
            <div className="banner-preview">
              <img src={imagePreview} alt={form.name || "Banner preview"} />
            </div>
          )}

          <button className="btn-primary" type="submit" disabled={saving}>
            {saving ? "Saving..." : editingBanner ? "Update Banner" : "Add Banner"}
          </button>
        </form>
      </section>

      <section className="banner-list-panel">
        <div className="banner-section-head">
          <div>
            <p className="admin-panel-label">All Banners</p>
            <h2>Banner List</h2>
          </div>
          <div className="banner-list-actions">
            <button className="admin-secondary-button" type="button" onClick={fetchBanners}>
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
                    aria-label="Select all banners"
                  />
                </th>
                <th>Image</th>
                <th>Name</th>
                <th>Status</th>
                <th>Order</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6">Loading banners...</td>
                </tr>
              ) : banners.length === 0 ? (
                <tr>
                  <td colSpan="6">No banners added yet.</td>
                </tr>
              ) : (
                banners.map((banner) => (
                  <tr key={banner._id}>
                    <td data-label="Select">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(banner._id)}
                        onChange={() => toggleBanner(banner._id)}
                        aria-label={`Select ${banner.name}`}
                      />
                    </td>
                    <td data-label="Image">
                      <img
                        className="banner-thumb"
                        src={getImageUrl(banner.image)}
                        alt={banner.name}
                      />
                    </td>
                    <td data-label="Name">{banner.name}</td>
                    <td data-label="Status">
                      <span className={`banner-status ${banner.status}`}>
                        {banner.status}
                      </span>
                    </td>
                    <td data-label="Order">{banner.order}</td>
                    <td data-label="Actions">
                      <div className="banner-row-actions">
                        <button type="button" onClick={() => handleEdit(banner)}>
                          Edit
                        </button>
                        <button
                          className="danger"
                          type="button"
                          onClick={() => handleDelete(banner._id)}
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
