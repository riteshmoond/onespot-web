import { useState } from "react";

export default function AdminTopbar({
  title = "Admin Dashboard",
  onMenuClick = () => {},
  onLogout = () => {},
}) {
  const [openProfile, setOpenProfile] = useState(false);
  const [openNotify, setOpenNotify] = useState(false);

  return (
    <header className="admin-topbar">
      <div className="admin-topbar-title">
        <button className="admin-icon-button admin-menu-button" type="button" onClick={onMenuClick}>
          =
        </button>
        <h1>{title}</h1>
      </div>

      <div className="admin-topbar-actions">
        <button
          className="admin-icon-button has-dot"
          type="button"
          onClick={() => {
            setOpenNotify(!openNotify);
            setOpenProfile(false);
          }}
        >
          BL
        </button>

        {openNotify && (
          <div className="admin-dropdown admin-notify-dropdown">
            <h3>Notifications</h3>
            <p>No new notifications</p>
          </div>
        )}

        <button
          className="admin-profile-button"
          type="button"
          onClick={() => {
            setOpenProfile(!openProfile);
            setOpenNotify(false);
          }}
        >
          <span>AD</span>
          <strong>Admin</strong>
        </button>

        {openProfile && (
          <div className="admin-dropdown admin-profile-dropdown">
            <button type="button">
              <span>ST</span>
              Settings
            </button>
            <button type="button" className="danger" onClick={onLogout}>
              <span>LO</span>
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
