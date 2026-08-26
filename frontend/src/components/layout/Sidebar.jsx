import { NavLink } from "react-router-dom";
import { ShieldAlert, X } from "lucide-react";
import "./Sidebar.css";

function Sidebar({ items, open, onClose }) {
  return (
    <>
      {open && <div className="sidebar__scrim" onClick={onClose} aria-hidden="true" />}
      <aside className={`sidebar ${open ? "sidebar--open" : ""}`}>
        <div className="sidebar__brand">
          <span className="sidebar__brand-icon">
            <ShieldAlert size={18} strokeWidth={2.4} />
          </span>
          <span>Suraksha</span>
          <button className="sidebar__close" onClick={onClose} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar__nav">
          {items.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={label}
              to={to}
              onClick={onClose}
              className={({ isActive }) => `sidebar__link ${isActive ? "sidebar__link--active" : ""}`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
