import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, ShieldAlert } from "lucide-react";
import Button from "../common/Button";
import "./Navbar.css";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Features", to: "/#features" },
  { label: "Emergency Info", to: "/emergency-info" },
];

function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <Link to="/" className="navbar__brand">
          <span className="navbar__brand-icon">
            <ShieldAlert size={20} strokeWidth={2.4} />
          </span>
          <span>
            Suraksha
            <small>Disaster Response Platform</small>
          </span>
        </Link>

        <nav className={`navbar__links ${open ? "navbar__links--open" : ""}`}>
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              className="navbar__link"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
          <div className="navbar__actions navbar__actions--mobile">
            <Button as={Link} to="/login" variant="outline" size="sm" fullWidth>
              Login
            </Button>
            <Button as={Link} to="/register" variant="primary" size="sm" fullWidth>
              Register
            </Button>
          </div>
        </nav>

        <div className="navbar__actions navbar__actions--desktop">
          <Button as={Link} to="/login" variant="outline" size="sm">
            Login
          </Button>
          <Button as={Link} to="/register" variant="primary" size="sm">
            Register
          </Button>
        </div>

        <button
          className="navbar__toggle"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </header>
  );
}

export default Navbar;
