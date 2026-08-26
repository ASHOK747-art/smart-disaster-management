import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import Button from "../../components/common/Button";
import { ROLES, DASHBOARD_ROUTE_BY_ROLE } from "../../data/roles";
import { register } from "../../services/authService";
import "./Auth.css";

const INITIAL_FORM = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  location: "",
  skills: "",
  availability: "full-time",
};

function RegisterPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState("citizen");
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function validate() {
    const next = {};
    if (!form.fullName.trim()) next.fullName = "Full name is required.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email address.";
    if (!form.phone.trim()) next.phone = "Phone number is required.";
    if (form.password.length < 6) next.password = "Password must be at least 6 characters.";
    if (form.confirmPassword !== form.password) next.confirmPassword = "Passwords do not match.";
    if (!form.location.trim()) next.location = "Location is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!validate()) return;
    setLoading(true);
    try {
      await register({ ...form, role });
      navigate(DASHBOARD_ROUTE_BY_ROLE[role]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth">
      <div className="auth__card auth__card--wide">
        <div className="auth__head">
          <h1>Create your account</h1>
          <p>Register to report incidents, coordinate response, or manage resources.</p>
        </div>

        {error && (
          <div className="auth__error-banner">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <div className="auth__roles">
          {ROLES.map(({ id, label, icon: Icon }) => (
            <button
              type="button"
              key={id}
              className={`auth__role ${role === id ? "auth__role--active" : ""}`}
              onClick={() => setRole(id)}
              aria-pressed={role === id}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="fullName">Full name</label>
            <input id="fullName" name="fullName" value={form.fullName} onChange={handleChange} />
            {errors.fullName && <span className="form-field__error">{errors.fullName}</span>}
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" value={form.email} onChange={handleChange} />
              {errors.email && <span className="form-field__error">{errors.email}</span>}
            </div>
            <div className="form-field">
              <label htmlFor="phone">Phone</label>
              <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} />
              {errors.phone && <span className="form-field__error">{errors.phone}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type="password" value={form.password} onChange={handleChange} />
              {errors.password && <span className="form-field__error">{errors.password}</span>}
            </div>
            <div className="form-field">
              <label htmlFor="confirmPassword">Confirm password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
              />
              {errors.confirmPassword && <span className="form-field__error">{errors.confirmPassword}</span>}
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="location">Location</label>
            <input
              id="location"
              name="location"
              placeholder="District, city or area"
              value={form.location}
              onChange={handleChange}
            />
            {errors.location && <span className="form-field__error">{errors.location}</span>}
          </div>

          {role === "volunteer" && (
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="skills">Skills</label>
                <input
                  id="skills"
                  name="skills"
                  placeholder="First aid, driving, swimming…"
                  value={form.skills}
                  onChange={handleChange}
                />
              </div>
              <div className="form-field">
                <label htmlFor="availability">Availability</label>
                <select id="availability" name="availability" value={form.availability} onChange={handleChange}>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="on-call">On-call only</option>
                </select>
              </div>
            </div>
          )}

          <Button type="submit" variant="primary" size="lg" fullWidth disabled={loading}>
            {loading ? "Creating account…" : `Register as ${ROLES.find((r) => r.id === role).label}`}
          </Button>
        </form>

        <p className="auth__footer-note">
          Already have an account? <Link to="/login" className="auth__link">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
