import { useState } from "react";
import { api, setSession } from "../lib/api";
import AdminDashboard from "./AdminDashboard";

export default function AdminLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(localStorage.getItem("adminToken")));

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await api("/api/admin/login", {
        method: "POST",
        body: JSON.stringify(form),
      });

      setSession(data);
      setIsLoggedIn(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (isLoggedIn) {
    return <AdminDashboard onLogout={() => setIsLoggedIn(false)} />;
  }

  return (
    <main className="admin-login-screen">
      <form onSubmit={handleSubmit} className="admin-login-card">
        <span className="admin-mark">A</span>
        <p className="eyebrow">Secure Access</p>
        <h1>Admin login</h1>
        <div className="admin-login-fields">
          <input
            className="dark-input"
            type="email"
            placeholder="Admin email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="dark-input"
            type="password"
            placeholder="Password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {error && <p className="admin-login-error">{error}</p>}
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>
      </form>
    </main>
  );
}

