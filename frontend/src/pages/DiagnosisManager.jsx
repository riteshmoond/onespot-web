import { useEffect, useMemo, useState } from "react";
import { API_BASE_URL, api } from "../lib/api";

const emptyForm = {
  name: "",
  doctorName: "",
  doctorPosition: "",
  features: [""],
  image: null,
};

function getImageUrl(image) {
  if (!image) return "";
  return image.startsWith("http") ? image : `${API_BASE_URL}${image}`;
}

export default function DiagnosisManager() {
  const [diagnoses, setDiagnoses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingDiagnosis, setEditingDiagnosis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  const imagePreview = useMemo(() => {
    if (form.image) return URL.createObjectURL(form.image);
    if (editingDiagnosis?.image) return getImageUrl(editingDiagnosis.image);
    return "";
  }, [editingDiagnosis, form.image]);

  const fetchDiagnoses = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await api("/api/admin/diagnoses");
      setDiagnoses(data.diagnoses || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function loadDiagnoses() {
      try {
        const data = await api("/api/admin/diagnoses");
        if (!isMounted) return;
        setDiagnoses(data.diagnoses || []);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDiagnoses();

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
    setEditingDiagnosis(null);
    setFormOpen(false);
    setError("");
    setMessage("");
  };

  const setFeature = (index, value) => {
    setForm((current) => ({
      ...current,
      features: current.features.map((feature, featureIndex) =>
        featureIndex === index ? value : feature
      ),
    }));
  };

  const addFeature = () => {
    setForm((current) => ({
      ...current,
      features: [...current.features, ""],
    }));
  };

  const removeFeature = (index) => {
    setForm((current) => {
      const nextFeatures = current.features.filter((_, featureIndex) => featureIndex !== index);
      return {
        ...current,
        features: nextFeatures.length > 0 ? nextFeatures : [""],
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    const payload = new FormData();
    payload.append("name", form.name);
    payload.append("doctorName", form.doctorName);
    payload.append("doctorPosition", form.doctorPosition);
    if (form.image) {
      payload.append("image", form.image);
    }
    form.features.forEach((feature) => {
      if (feature.trim()) {
        payload.append("features", feature.trim());
      }
    });

    try {
      if (editingDiagnosis) {
        await api(`/api/admin/diagnoses/${editingDiagnosis._id}`, {
          method: "PUT",
          body: payload,
        });
        setMessage("Diagnosis updated successfully");
      } else {
        await api("/api/admin/diagnoses", {
          method: "POST",
          body: payload,
        });
        setMessage("Diagnosis added successfully");
      }

      resetForm();
      await fetchDiagnoses();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (diagnosis) => {
    setEditingDiagnosis(diagnosis);
    setForm({
      name: diagnosis.name || "",
      doctorName: diagnosis.doctorName || "",
      doctorPosition: diagnosis.doctorPosition || "",
      features: diagnosis.features?.length ? diagnosis.features : [""],
      image: null,
    });
    setError("");
    setMessage("");
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (diagnosisId) => {
    const confirmed = window.confirm("Are you sure you want to delete this diagnosis?");
    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await api(`/api/admin/diagnoses/${diagnosisId}`, { method: "DELETE" });
      setMessage("Diagnosis deleted successfully");
      await fetchDiagnoses();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="doctor-module">
      <section className="doctor-editor">
        <div
          className="banner-section-head"
          onClick={() => setFormOpen((o) => !o)}
          style={{ cursor: "pointer", userSelect: "none" }}
        >
          <div>
            <p className="admin-panel-label">Diagnosis Control</p>
            <h2>{editingDiagnosis ? "Edit Diagnosis" : "Add Diagnosis"}</h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {editingDiagnosis && (
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

        {formOpen && <form className="doctor-form" onSubmit={handleSubmit}>
          <div className="doctor-form-grid">
            <label>
              Diagnosis Name
              <input
                type="text"
                required
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="e.g. Pathology"
              />
            </label>

            <label>
              Doctor Name
              <input
                type="text"
                value={form.doctorName}
                onChange={(event) => setForm({ ...form, doctorName: event.target.value })}
                placeholder="e.g. Dr. John Doe"
              />
            </label>

            <label>
              Doctor Position
              <input
                type="text"
                value={form.doctorPosition}
                onChange={(event) => setForm({ ...form, doctorPosition: event.target.value })}
                placeholder="e.g. MD, Cardiologist"
              />
            </label>

            <label className="banner-file-field">
              Image
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                required={!editingDiagnosis}
                onChange={(event) =>
                  setForm({ ...form, image: event.target.files?.[0] || null })
                }
              />
            </label>
          </div>

          {imagePreview && (
            <div className="doctor-preview" style={{ maxWidth: "320px", marginBottom: "16px" }}>
              <img src={imagePreview} alt={form.name || "Diagnosis preview"} style={{ borderRadius: "8px" }} />
            </div>
          )}

          <div className="doctor-feature-panel">
            <div className="banner-section-head">
              <div>
                <p className="admin-panel-label">Diagnosis Features</p>
                <h2>Manage Features Grid</h2>
              </div>
              <button className="admin-secondary-button" type="button" onClick={addFeature}>
                Add Feature
              </button>
            </div>

            <div className="doctor-feature-table-wrap">
              <table className="doctor-feature-table">
                <thead>
                  <tr>
                    <th style={{ width: "80px" }}>#</th>
                    <th>Feature Name / Detail</th>
                    <th style={{ width: "120px" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {form.features.map((feature, index) => (
                    <tr key={index}>
                      <td data-label="#">{index + 1}</td>
                      <td data-label="Feature">
                        <input
                          type="text"
                          value={feature}
                          onChange={(event) => setFeature(index, event.target.value)}
                          placeholder="e.g. High resolution scanning"
                          required
                        />
                      </td>
                      <td data-label="Action">
                        <button
                          className="admin-danger-button"
                          type="button"
                          onClick={() => removeFeature(index)}
                          style={{ minHeight: "34px", padding: "0 10px" }}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <button className="btn-primary" type="submit" disabled={saving} style={{ width: "auto", minWidth: "170px" }}>
            {saving ? "Saving..." : editingDiagnosis ? "Update Diagnosis" : "Add Diagnosis"}
          </button>
        </form>}
      </section>

      <section className="doctor-list-panel">
        <div className="banner-section-head">
          <div>
            <p className="admin-panel-label">All Diagnoses</p>
            <h2>Diagnosis List</h2>
          </div>
          <button className="admin-secondary-button" type="button" onClick={fetchDiagnoses}>
            Refresh
          </button>
        </div>

        {error && <p className="admin-alert error">{error}</p>}
        {message && <p className="admin-alert success">{message}</p>}

        <div className="banner-table-wrap">
          <table className="banner-table">
            <thead>
              <tr>
                <th style={{ width: "100px" }}>Image</th>
                <th>Diagnosis Details</th>
                <th>Doctor Details</th>
                <th>Features Count</th>
                <th style={{ width: "180px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5">Loading diagnoses...</td>
                </tr>
              ) : diagnoses.length === 0 ? (
                <tr>
                  <td colSpan="5">No diagnoses added yet.</td>
                </tr>
              ) : (
                diagnoses.map((diagnosis) => (
                  <tr key={diagnosis._id}>
                    <td data-label="Image">
                      <img
                        src={getImageUrl(diagnosis.image)}
                        alt={diagnosis.name}
                        className="banner-thumb"
                        style={{ width: "64px", height: "64px", borderRadius: "8px", objectFit: "cover" }}
                      />
                    </td>
                    <td data-label="Diagnosis Details">
                      <div style={{ fontWeight: 600, color: "#1e293b", fontSize: "15px" }}>
                        {diagnosis.name}
                      </div>
                    </td>
                    <td data-label="Doctor Details">
                      {diagnosis.doctorName ? (
                        <>
                          <div style={{ color: "#334155", fontWeight: 500 }}>
                            {diagnosis.doctorName}
                          </div>
                          {diagnosis.doctorPosition && (
                            <div style={{ fontSize: "12px", color: "#64748b" }}>
                              {diagnosis.doctorPosition}
                            </div>
                          )}
                        </>
                      ) : (
                        <span style={{ color: "#94a3b8", fontStyle: "italic" }}>No doctor assigned</span>
                      )}
                    </td>
                    <td data-label="Features Count">
                      <span className="banner-status active" style={{ minWidth: "50px" }}>
                        {diagnosis.features?.length || 0} features
                      </span>
                    </td>
                    <td data-label="Actions">
                      <div className="banner-row-actions">
                        <button type="button" onClick={() => handleEdit(diagnosis)}>
                          Edit
                        </button>
                        <button
                          className="danger"
                          type="button"
                          onClick={() => handleDelete(diagnosis._id)}
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
