import { useEffect, useMemo, useState } from "react";
import { API_BASE_URL, api } from "../lib/api";

export default function GalleryManager() {
  const [gallery, setGallery] = useState([]);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const imagePreview = useMemo(() => {
    if (image) return URL.createObjectURL(image);
    return "";
  }, [image]);

  const fetchGallery = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await api("/api/admin/gallery");
      setGallery(data.gallery || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function loadGallery() {
      try {
        const data = await api("/api/admin/gallery");
        if (!isMounted) return;
        setGallery(data.gallery || []);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadGallery();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (image && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [image, imagePreview]);

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!image) return;

    setUploading(true);
    setError("");
    setMessage("");

    const payload = new FormData();
    payload.append("image", image);

    try {
      await api("/api/admin/gallery", {
        method: "POST",
        body: payload,
      });
      setMessage("Image uploaded successfully to gallery");
      setImage(null);
      await fetchGallery();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (itemId) => {
    const confirmed = window.confirm("Are you sure you want to delete this photo from the gallery?");
    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await api(`/api/admin/gallery/${itemId}`, { method: "DELETE" });
      setMessage("Image deleted successfully");
      await fetchGallery();
    } catch (err) {
      setError(err.message);
    }
  };

  const getImageUrl = (img) => {
    if (!img) return "";
    return img.startsWith("http") ? img : `${API_BASE_URL}${img}`;
  };

  return (
    <div className="banner-module">
      <section className="banner-editor">
        <div className="banner-section-head">
          <div>
            <p className="admin-panel-label">Gallery Control</p>
            <h2>Upload Photo</h2>
          </div>
        </div>

        <form className="doctor-form" onSubmit={handleUpload}>
          <div className="doctor-form-grid" style={{ gridTemplateColumns: "1fr" }}>
            <label className="banner-file-field">
              Select Photo
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                required
                onChange={(event) => setImage(event.target.files?.[0] || null)}
              />
            </label>
          </div>

          {imagePreview && (
            <div className="doctor-preview" style={{ maxWidth: "280px", marginBottom: "16px", aspectRatio: "16 / 9" }}>
              <img src={imagePreview} alt="Preview" style={{ borderRadius: "8px" }} />
            </div>
          )}

          <button className="btn-primary" type="submit" disabled={uploading || !image} style={{ width: "auto", minWidth: "150px" }}>
            {uploading ? "Uploading..." : "Upload Photo"}
          </button>
        </form>
      </section>

      <section className="banner-list-panel">
        <div className="banner-section-head">
          <div>
            <p className="admin-panel-label">All Photos</p>
            <h2>Gallery Grid</h2>
          </div>
          <button className="admin-secondary-button" type="button" onClick={fetchGallery}>
            Refresh
          </button>
        </div>

        {error && <p className="admin-alert error">{error}</p>}
        {message && <p className="admin-alert success">{message}</p>}

        {loading ? (
          <p style={{ color: "#64748b" }}>Loading gallery photos...</p>
        ) : gallery.length === 0 ? (
          <p style={{ color: "#64748b" }}>No photos in the gallery yet.</p>
        ) : (
          <div className="gallery-grid">
            {gallery.map((item) => (
              <div className="gallery-card" key={item._id}>
                <img src={getImageUrl(item.image)} alt="Gallery Item" />
                <div className="gallery-card-overlay">
                  <button
                    className="admin-danger-button"
                    type="button"
                    onClick={() => handleDelete(item._id)}
                    style={{ minHeight: "34px", padding: "0 14px", fontSize: "13px" }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
