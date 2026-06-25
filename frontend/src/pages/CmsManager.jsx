import { useEffect, useRef, useState } from "react";
import JoditEditor from "jodit-react";
import { api } from "../lib/api";

const emptyForm = {
  name: "",
  key: "",
  status: "active",
  content: "",
};

function stripHtml(html) {
  const element = document.createElement("div");
  element.innerHTML = html;
  return element.textContent || element.innerText || "";
}

export default function CmsManager() {
  const editorRef = useRef(null);
  const [pages, setPages] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingPage, setEditingPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  // Form panel is collapsed by default; opens on Edit or manual toggle
  const [formOpen, setFormOpen] = useState(false);

  // Jodit config — preserves all HTML including custom CSS classes & placeholders
  const joditConfig = {
    readonly: false,
    height: 400,
    toolbarButtonSize: "middle",
    buttons: [
      "source",
      "|",
      "bold", "italic", "underline", "strikethrough",
      "|",
      "ul", "ol",
      "|",
      "font", "fontsize", "paragraph",
      "|",
      "align",
      "|",
      "link", "image",
      "|",
      "hr", "table",
      "|",
      "undo", "redo",
      "|",
      "fullsize",
    ],
    allowResizeTags: true,
    processPasteHTML: false,
    cleanHTML: {
      fillEmptyParagraph: false,
      replaceNBSP: false,
      allowTags: false,
      denyTags: false,
    },
    sanitize: false,
    enter: "P",
    defaultMode: 1,
    theme: "default",
    showCharsCounter: false,
    showWordsCounter: false,
    showXPathInStatusbar: false,
    placeholder: "Enter CMS content here. Use {{services}}, {{doctors}}, {{faqs}}, {{testimonials}}, {{gallery}} as placeholders.",
  };

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
        if (isMounted) setLoading(false);
      }
    }
    loadPages();
    return () => { isMounted = false; };
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingPage(null);
    setFormOpen(false);
    setError("");
    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    const plainText = stripHtml(form.content).trim();
    if (!plainText) {
      setError("Content cannot be empty.");
      setSaving(false);
      return;
    }

    const payload = {
      name: form.name.trim(),
      key: form.key.trim().toLowerCase().replace(/\s+/g, "_"),
      status: form.status,
      content: form.content,
    };

    try {
      if (editingPage) {
        await api(`/api/admin/cms/${editingPage._id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setMessage("CMS page updated successfully!");
      } else {
        await api("/api/admin/cms", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setMessage("CMS page added successfully!");
      }
      resetForm();
      await fetchPages();
    } catch (err) {
      const msg = err.message || "Something went wrong";
      if (msg.includes("duplicate") || msg.includes("E11000")) {
        setError("A CMS entry with this key already exists. Use a different key.");
      } else {
        setError(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (page) => {
    setEditingPage(page);
    setForm({
      name: page.name || "",
      key: page.key || "",
      status: page.status || "active",
      content: page.content || "",
    });
    setError("");
    setMessage("");
    // Auto-open form panel on edit
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
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

      {/* ── Collapsible Form Panel ── */}
      <section className="cms-editor">
        {/* Collapse header — always visible, acts as toggle */}
        <div
          className="banner-section-head cms-collapse-header"
          onClick={() => setFormOpen((o) => !o)}
          style={{ cursor: "pointer", userSelect: "none" }}
        >
          <div>
            <p className="admin-panel-label">CMS Control</p>
            <h2>{editingPage ? "Edit CMS Page" : "Add New CMS Page"}</h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {editingPage && (
              <button
                className="admin-secondary-button"
                type="button"
                onClick={(e) => {
                  e.stopPropagation(); // don't toggle collapse when clicking Cancel
                  resetForm();
                }}
              >
                Cancel
              </button>
            )}
            <span
              style={{
                fontSize: "20px",
                transition: "transform 0.25s",
                transform: formOpen ? "rotate(180deg)" : "rotate(0deg)",
                display: "inline-block",
                color: "var(--primary, #6c63ff)",
              }}
            >
              ▾
            </span>
          </div>
        </div>

        {/* Collapsible body */}
        {formOpen && (
          <form className="cms-form" onSubmit={handleSubmit}>
            <div className="cms-form-grid">
              <label>
                Name
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                />
              </label>

              <label>
                Key
                <input
                  type="text"
                  required
                  placeholder="e.g. services_cms"
                  value={form.key}
                  onChange={(e) => setForm((prev) => ({ ...prev, key: e.target.value }))}
                />
              </label>

              <label>
                Status
                <select
                  value={form.status}
                  onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>
            </div>

            <div className="cms-editor-shell" style={{ marginTop: "16px" }}>
              <JoditEditor
                ref={editorRef}
                value={form.content}
                config={joditConfig}
                onBlur={(newContent) => setForm((prev) => ({ ...prev, content: newContent }))}
              />
            </div>

            {form.content && (
              <div className="cms-preview">
                <p className="admin-panel-label">Preview</p>
                <div dangerouslySetInnerHTML={{ __html: form.content }} />
              </div>
            )}

            {error && <p className="admin-alert error" style={{ marginTop: "10px" }}>{error}</p>}

            <button className="btn-primary" type="submit" disabled={saving}>
              {saving ? "Saving..." : editingPage ? "Update CMS Page" : "Add CMS Page"}
            </button>
          </form>
        )}
      </section>

      {/* ── CMS List Panel ── */}
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

        {message && <p className="admin-alert success">{message}</p>}
        {!formOpen && error && <p className="admin-alert error">{error}</p>}

        <div className="banner-table-wrap">
          <table className="banner-table cms-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Key</th>
                <th>Status</th>
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
                    <td data-label="Key"><code>{page.key}</code></td>
                    <td data-label="Status">
                      <span className={`banner-status ${page.status}`}>
                        {page.status}
                      </span>
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
