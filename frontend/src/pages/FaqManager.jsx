import { useEffect, useState } from "react";
import { api } from "../lib/api";

const emptyForm = {
  question: "",
  answer: "",
};

export default function FaqManager() {
  const [faqs, setFaqs] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingFaq, setEditingFaq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  const fetchFaqs = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await api("/api/admin/faqs");
      setFaqs(data.faqs || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function loadFaqs() {
      try {
        const data = await api("/api/admin/faqs");
        if (!isMounted) return;
        setFaqs(data.faqs || []);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadFaqs();

    return () => {
      isMounted = false;
    };
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingFaq(null);
    setFormOpen(false);
    setError("");
    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    const payload = {
      question: form.question,
      answer: form.answer,
    };

    try {
      if (editingFaq) {
        await api(`/api/admin/faqs/${editingFaq._id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setMessage("FAQ updated successfully");
      } else {
        await api("/api/admin/faqs", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setMessage("FAQ added successfully");
      }

      resetForm();
      await fetchFaqs();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (faq) => {
    setEditingFaq(faq);
    setForm({
      question: faq.question || "",
      answer: faq.answer || "",
    });
    setError("");
    setMessage("");
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (faqId) => {
    const confirmed = window.confirm("Are you sure you want to delete this FAQ?");
    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await api(`/api/admin/faqs/${faqId}`, { method: "DELETE" });
      setMessage("FAQ deleted successfully");
      await fetchFaqs();
    } catch (err) {
      setError(err.message);
    }
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
            <p className="admin-panel-label">FAQ Control</p>
            <h2>{editingFaq ? "Edit FAQ" : "Add FAQ"}</h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {editingFaq && (
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
          <label>
            Question
            <input
              type="text"
              required
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
              placeholder="Enter FAQ question"
            />
          </label>

          <label>
            Answer
            <textarea
              required
              value={form.answer}
              onChange={(e) => setForm({ ...form, answer: e.target.value })}
              placeholder="Enter FAQ answer"
            />
          </label>

          <button className="btn-primary" type="submit" disabled={saving} style={{ width: "auto", minWidth: "150px" }}>
            {saving ? "Saving..." : editingFaq ? "Update FAQ" : "Add FAQ"}
          </button>
        </form>}
      </section>

      <section className="banner-list-panel">
        <div className="banner-section-head">
          <div>
            <p className="admin-panel-label">All FAQs</p>
            <h2>FAQ List</h2>
          </div>
          <button className="admin-secondary-button" type="button" onClick={fetchFaqs}>
            Refresh
          </button>
        </div>

        {error && <p className="admin-alert error">{error}</p>}
        {message && <p className="admin-alert success">{message}</p>}

        <div className="banner-table-wrap">
          <table className="banner-table">
            <thead>
              <tr>
                <th style={{ width: "30%" }}>Question</th>
                <th style={{ width: "50%" }}>Answer</th>
                <th style={{ width: "20%" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="3">Loading FAQs...</td>
                </tr>
              ) : faqs.length === 0 ? (
                <tr>
                  <td colSpan="3">No FAQs added yet.</td>
                </tr>
              ) : (
                faqs.map((faq) => (
                  <tr key={faq._id}>
                    <td data-label="Question" style={{ fontWeight: 600, color: "#1e293b" }}>
                      {faq.question}
                    </td>
                    <td data-label="Answer" className="cms-content-cell">
                      {faq.answer}
                    </td>
                    <td data-label="Actions">
                      <div className="banner-row-actions">
                        <button type="button" onClick={() => handleEdit(faq)}>
                          Edit
                        </button>
                        <button
                          className="danger"
                          type="button"
                          onClick={() => handleDelete(faq._id)}
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
