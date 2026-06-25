import { useEffect, useMemo, useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { api } from "../lib/api";

const emptyForm = {
  name: "",
  status: "active",
  content: "",
};

function stripHtml(html) {
  const element = document.createElement("div");
  element.innerHTML = html;
  return element.textContent || element.innerText || "";
}

export default function CmsManager() {
  const [pages, setPages] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingPage, setEditingPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSource, setShowSource] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const editorModules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ color: [] }, { background: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }],
        ["blockquote", "code-block"],
        ["link", "image", "video"],
        ["clean"],
      ],
    }),
    []
  );

  const editorFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "list",
    "bullet",
    "align",
    "blockquote",
    "code-block",
    "link",
    "image",
    "video",
  ];

  const fetchPages = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await api("/api/admin/cms");
      setPages(data.pages || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function loadPages() {
      try {
        const data = await api("/api/admin/cms");
        if (!isMounted) return;
        setPages(data.pages || []);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadPages();

    return () => {
      isMounted = false;
    };
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingPage(null);
    setShowSource(false);
    setError("");
    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    const payload = {
      name: form.name,
      status: form.status,
      content: form.content,
    };

    try {
      if (editingPage) {
        await api(`/api/admin/cms/${editingPage._id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setMessage("CMS page updated successfully");
      } else {
        await api("/api/admin/cms", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setMessage("CMS page added successfully");
      }

      resetForm();
      await fetchPages();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (page) => {
    setEditingPage(page);
    setForm({
      name: page.name || "",
      status: page.status || "active",
      content: page.content || "",
    });
    setShowSource(false);
    setError("");
    setMessage("");
  };

  const handleDelete = async (pageId) => {
    const confirmed = window.confirm("Delete this CMS page?");
    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await api(`/api/admin/cms/${pageId}`, { method: "DELETE" });
      setMessage("CMS page deleted successfully");
      await fetchPages();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="cms-module">
      <section className="cms-editor">
        <div className="banner-section-head">
          <div>
            <p className="admin-panel-label">CMS Control</p>
            <h2>{editingPage ? "Edit CMS Page" : "Add CMS Page"}</h2>
          </div>
          {editingPage && (
            <button className="admin-secondary-button" type="button" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>

        <form className="cms-form" onSubmit={handleSubmit}>
          <div className="cms-form-grid">
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
          </div>

          <div className="cms-editor-shell">
            <div className="cms-editor-modebar">
              <button
                type="button"
                className={showSource ? "active" : ""}
                onClick={() => setShowSource((current) => !current)}
              >
                HTML
              </button>
            </div>

            {showSource ? (
              <textarea
                className="cms-source-editor"
                required
                value={form.content}
                onChange={(event) => setForm({ ...form, content: event.target.value })}
              />
            ) : (
              <ReactQuill
                className="cms-rich-editor"
                theme="snow"
                value={form.content}
                modules={editorModules}
                formats={editorFormats}
                onChange={(content) => setForm({ ...form, content })}
              />
            )}
          </div>

          {form.content && (
            <div className="cms-preview">
              <p className="admin-panel-label">Preview</p>
              <div dangerouslySetInnerHTML={{ __html: form.content }} />
            </div>
          )}

          <button className="btn-primary" type="submit" disabled={saving}>
            {saving ? "Saving..." : editingPage ? "Update CMS Page" : "Add CMS Page"}
          </button>
        </form>
      </section>

      <section className="cms-list-panel">
        <div className="banner-section-head">
          <div>
            <p className="admin-panel-label">All CMS Pages</p>
            <h2>CMS List</h2>
          </div>
          <button className="admin-secondary-button" type="button" onClick={fetchPages}>
            Refresh
          </button>
        </div>

        {error && <p className="admin-alert error">{error}</p>}
        {message && <p className="admin-alert success">{message}</p>}

        <div className="banner-table-wrap">
          <table className="banner-table cms-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Content</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4">Loading CMS pages...</td>
                </tr>
              ) : pages.length === 0 ? (
                <tr>
                  <td colSpan="4">No CMS pages added yet.</td>
                </tr>
              ) : (
                pages.map((page) => (
                  <tr key={page._id}>
                    <td data-label="Name">{page.name}</td>
                    <td data-label="Status">
                      <span className={`banner-status ${page.status}`}>
                        {page.status}
                      </span>
                    </td>
                    <td data-label="Content" className="cms-content-cell">
                      {stripHtml(page.content).slice(0, 110) || "Empty content"}
                    </td>
                    <td data-label="Actions">
                      <div className="banner-row-actions">
                        <button type="button" onClick={() => handleEdit(page)}>
                          Edit
                        </button>
                        <button
                          className="danger"
                          type="button"
                          onClick={() => handleDelete(page._id)}
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
