import { useEffect, useMemo, useState } from "react";
import { API_BASE_URL, api } from "../lib/api";

const emptyForm = {
  name: "",
  department: "",
  gender: "male",
  position: "",
  aboutDoctor: "",
  opdDays: "",
  sundayTiming: "",
  dailyTime: "",
  features: [""],
  image: null,
};

function getImageUrl(image) {
  if (!image) return "";
  return image.startsWith("http") ? image : `${API_BASE_URL}${image}`;
}

export default function DoctorManager() {
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const imagePreview = useMemo(() => {
    if (form.image) return URL.createObjectURL(form.image);
    if (editingDoctor?.image) return getImageUrl(editingDoctor.image);
    return "";
  }, [editingDoctor, form.image]);

  const fetchDoctors = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await api("/api/admin/doctors");
      setDoctors(data.doctors || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function loadDoctors() {
      try {
        const data = await api("/api/admin/doctors");
        if (!isMounted) return;
        setDoctors(data.doctors || []);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDoctors();

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
    setEditingDoctor(null);
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
    payload.append("department", form.department);
    payload.append("gender", form.gender);
    payload.append("position", form.position);
    payload.append("aboutDoctor", form.aboutDoctor);
    payload.append("opdDays", form.opdDays);
    payload.append("sundayTiming", form.sundayTiming);
    payload.append("dailyTime", form.dailyTime);
    payload.append(
      "features",
      JSON.stringify(form.features.map((feature) => feature.trim()).filter(Boolean))
    );
    if (form.image) payload.append("image", form.image);

    try {
      if (editingDoctor) {
        await api(`/api/admin/doctors/${editingDoctor._id}`, {
          method: "PUT",
          body: payload,
        });
        setMessage("Doctor updated successfully");
      } else {
        await api("/api/admin/doctors", {
          method: "POST",
          body: payload,
        });
        setMessage("Doctor added successfully");
      }

      setForm(emptyForm);
      setEditingDoctor(null);
      await fetchDoctors();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (doctor) => {
    setEditingDoctor(doctor);
    setForm({
      name: doctor.name || "",
      department: doctor.department || "",
      gender: doctor.gender || "male",
      position: doctor.position || "",
      aboutDoctor: doctor.aboutDoctor || "",
      opdDays: doctor.opdDays || "",
      sundayTiming: doctor.sundayTiming || "",
      dailyTime: doctor.dailyTime || "",
      features: doctor.features?.length ? doctor.features : [""],
      image: null,
    });
    setError("");
    setMessage("");
  };

  const handleDelete = async (doctorId) => {
    const confirmed = window.confirm("Delete this doctor?");
    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await api(`/api/admin/doctors/${doctorId}`, { method: "DELETE" });
      setMessage("Doctor deleted successfully");
      await fetchDoctors();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="doctor-module">
      <section className="doctor-editor">
        <div className="banner-section-head">
          <div>
            <p className="admin-panel-label">Doctor Control</p>
            <h2>{editingDoctor ? "Edit Doctor" : "Add Doctor"}</h2>
          </div>
          {editingDoctor && (
            <button className="admin-secondary-button" type="button" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>

        <form className="doctor-form" onSubmit={handleSubmit}>
          <div className="doctor-form-grid">
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
              Department
              <input
                type="text"
                required
                value={form.department}
                onChange={(event) => setForm({ ...form, department: event.target.value })}
              />
            </label>

            <label>
              Gender
              <select
                value={form.gender}
                onChange={(event) => setForm({ ...form, gender: event.target.value })}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </label>

            <label>
              Position
              <input
                type="text"
                required
                value={form.position}
                onChange={(event) => setForm({ ...form, position: event.target.value })}
              />
            </label>

            <label>
              OPD Days
              <input
                type="text"
                required
                value={form.opdDays}
                onChange={(event) => setForm({ ...form, opdDays: event.target.value })}
              />
            </label>

            <label>
              Sunday Timing
              <input
                type="text"
                required
                value={form.sundayTiming}
                onChange={(event) => setForm({ ...form, sundayTiming: event.target.value })}
              />
            </label>

            <label>
              Daily Time
              <input
                type="text"
                required
                value={form.dailyTime}
                onChange={(event) => setForm({ ...form, dailyTime: event.target.value })}
              />
            </label>

            <label className="banner-file-field">
              Image
              <input
                type="file"
                accept="image/png,image/jpeg"
                required={!editingDoctor}
                onChange={(event) =>
                  setForm({ ...form, image: event.target.files?.[0] || null })
                }
              />
            </label>
          </div>

          <label className="doctor-about-field">
            About Doctor
            <textarea
              required
              value={form.aboutDoctor}
              onChange={(event) => setForm({ ...form, aboutDoctor: event.target.value })}
            />
          </label>

          {imagePreview && (
            <div className="doctor-preview">
              <img src={imagePreview} alt={form.name || "Doctor preview"} />
            </div>
          )}

          <div className="doctor-feature-panel">
            <div className="banner-section-head">
              <div>
                <p className="admin-panel-label">Features</p>
                <h2>Doctor Features</h2>
              </div>
              <button className="admin-secondary-button" type="button" onClick={addFeature}>
                Add Feature
              </button>
            </div>

            <div className="doctor-feature-table-wrap">
              <table className="doctor-feature-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Feature</th>
                    <th>Action</th>
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
                        />
                      </td>
                      <td data-label="Action">
                        <button
                          className="admin-danger-button"
                          type="button"
                          onClick={() => removeFeature(index)}
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

          <button className="btn-primary" type="submit" disabled={saving}>
            {saving ? "Saving..." : editingDoctor ? "Update Doctor" : "Add Doctor"}
          </button>
        </form>
      </section>

      <section className="doctor-list-panel">
        <div className="banner-section-head">
          <div>
            <p className="admin-panel-label">All Doctors</p>
            <h2>Doctor List</h2>
          </div>
          <button className="admin-secondary-button" type="button" onClick={fetchDoctors}>
            Refresh
          </button>
        </div>

        {error && <p className="admin-alert error">{error}</p>}
        {message && <p className="admin-alert success">{message}</p>}

        <div className="banner-table-wrap">
          <table className="banner-table doctor-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Department</th>
                <th>Gender</th>
                <th>Position</th>
                <th>Timing</th>
                <th>Features</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8">Loading doctors...</td>
                </tr>
              ) : doctors.length === 0 ? (
                <tr>
                  <td colSpan="8">No doctors added yet.</td>
                </tr>
              ) : (
                doctors.map((doctor) => (
                  <tr key={doctor._id}>
                    <td data-label="Image">
                      <img
                        className="doctor-thumb"
                        src={getImageUrl(doctor.image)}
                        alt={doctor.name}
                      />
                    </td>
                    <td data-label="Name">{doctor.name}</td>
                    <td data-label="Department">{doctor.department}</td>
                    <td data-label="Gender">
                      <span className="doctor-gender">{doctor.gender}</span>
                    </td>
                    <td data-label="Position">{doctor.position}</td>
                    <td data-label="Timing">
                      <span className="doctor-time-text">{doctor.dailyTime}</span>
                    </td>
                    <td data-label="Features">{doctor.features?.length || 0}</td>
                    <td data-label="Actions">
                      <div className="banner-row-actions">
                        <button type="button" onClick={() => handleEdit(doctor)}>
                          Edit
                        </button>
                        <button
                          className="danger"
                          type="button"
                          onClick={() => handleDelete(doctor._id)}
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
