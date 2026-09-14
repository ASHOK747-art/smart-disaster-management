import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import Button from "../../components/common/Button";
import { ROLES, DASHBOARD_ROUTE_BY_ROLE } from "../../data/roles";
import { login } from "../../services/authService";
import "./Auth.css";

function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState("citizen");
  const [form, setForm] = useState({ identifier: "", password: "", remember: false });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login({ ...form, role });
      navigate(DASHBOARD_ROUTE_BY_ROLE[role]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth">
      <div className="auth__card">
        <div className="auth__head">
          <h1>Welcome back</h1>
          <p>Sign in to access your disaster response dashboard.</p>
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
            <label htmlFor="identifier">Email or phone</label>
            <input
              id="identifier"
              name="identifier"
              type="text"
              placeholder="you@example.com"
              value={form.identifier}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth__meta-row">
            <label className="auth__checkbox">
              <input
                type="checkbox"
                name="remember"
                checked={form.remember}
                onChange={handleChange}
              />
              Remember me
            </label>
            <Link to="/forgot-password" className="auth__link">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" variant="primary" size="lg" fullWidth disabled={loading}>
            {loading ? "Signing in…" : `Login as ${ROLES.find((r) => r.id === role).label}`}
          </Button>
        </form>

        <p className="auth__footer-note">
          Don't have an account? <Link to="/register" className="auth__link">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
