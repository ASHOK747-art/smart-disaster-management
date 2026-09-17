import { Menu, Bell, LogOut } from "lucide-react";
import "./Topbar.css";

function Topbar({
  onMenuClick,
  roleLabel,
  userName = "Demo User",
  userRole = "",
  notificationCount = 3,
  onLogout,
}) {
  const avatarLetter = userName ? userName.charAt(0).toUpperCase() : "U";

  return (
    <header className="topbar">
      <button className="topbar__menu" onClick={onMenuClick} aria-label="Open menu">
        <Menu size={20} />
      </button>

      <div className="topbar__title">
        <span className="topbar__role">{roleLabel}</span>
      </div>

      <div className="topbar__actions">
        <button className="topbar__icon-btn" aria-label="Notifications">
          <Bell size={18} />
          {notificationCount > 0 && <span className="topbar__badge">{notificationCount}</span>}
        </button>
        <div className="topbar__user">
          <span className="topbar__avatar">{avatarLetter}</span>
          <div className="topbar__user-info">
            <span className="topbar__user-name">{userName}</span>
            {userRole && <span className="topbar__user-role">{userRole}</span>}
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="topbar__icon-btn"
          aria-label="Logout"
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}

export default Topbar;
