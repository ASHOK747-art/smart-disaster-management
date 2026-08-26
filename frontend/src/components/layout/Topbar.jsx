import { Menu, Bell, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import "./Topbar.css";

function Topbar({ onMenuClick, roleLabel, userName = "Demo User", notificationCount = 3 }) {
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
          <span className="topbar__avatar">{userName.charAt(0)}</span>
          <span className="topbar__user-name">{userName}</span>
        </div>
        <Link to="/login" className="topbar__icon-btn" aria-label="Logout">
          <LogOut size={18} />
        </Link>
      </div>
    </header>
  );
}

export default Topbar;
