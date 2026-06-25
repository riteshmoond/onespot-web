const navItems = [
  ["dashboard", "Dashboard", "DB"],
  ["banners", "Banners", "BN"],
  ["cms", "CMS", "CM"],
  ["doctors", "Doctors", "DR"],
  ["messages", "Messages", "MS"],
  ["gallery", "Gallery Control", "GL"],
  ["packages", "Packages Control", "PK"],
  ["team", "Team", "TM"],
  ["reviews", "Reviews", "RV"],
  ["faqs", "FAQs", "FQ"],
  ["diagnoses", "Diagnosis Control", "DI"],
  ["testimonials", "Testimonials", "TS"],
  ["services", "Services", "SV"],
  ["settings", "Settings", "ST"],
];

export default function AdminSidebar({
  activePage = "dashboard",
  isOpen = false,
  onClose = () => {},
  onLogout = () => {},
  onSelectPage = () => {},
}) {
  return (
    <aside className={`admin-sidebar ${isOpen ? "is-open" : ""}`}>
      <div className="admin-sidebar-head">
        <span className="admin-mark">A</span>
        <div>
          <strong>Admin Panel</strong>
          <small>Onespot Studio</small>
        </div>
        <button className="admin-icon-button admin-close-button" type="button" onClick={onClose}>
          x
        </button>
      </div>

      <nav className="admin-nav">
        {navItems.map(([id, label, icon]) => (
          <button
            key={id}
            className={`admin-nav-item ${activePage === id ? "active" : ""}`}
            type="button"
            onClick={() => onSelectPage(id)}
          >
            <span>{icon}</span>
            {label}
          </button>
        ))}
      </nav>

      <button className="admin-logout-button" type="button" onClick={onLogout}>
        <span>LO</span>
        Logout
      </button>
    </aside>
  );
}
