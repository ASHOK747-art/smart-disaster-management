import { useEffect, useState } from "react";
import {
  Settings,
  UserCircle,
  Lock,
  ShieldCheck,
  Check,
  AlertTriangle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Save,
  Bell,
  Volume2,
  RefreshCw,
  Sliders,
  CheckCircle2,
} from "lucide-react";
import StatusBadge from "../../components/common/StatusBadge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { getMe, changePassword } from "../../services/authService";
import { updateUser } from "../../services/userService";
import { ROLE_LABEL } from "../../data/navigation";
import "./AdminDashboard.css";
import "./AdminSettingsPage.css";

function formatJoinDate(iso) {
  if (!iso) return "Recently";
  return new Date(iso).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function AdminSettingsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  // Profile Edit State
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    phone: "",
    location: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  // Password Change State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Preferences State (persisted to localStorage)
  const [preferences, setPreferences] = useState(() => {
    try {
      const saved = localStorage.getItem("admin_preferences");
      return saved
        ? JSON.parse(saved)
        : {
            emailAlerts: true,
            soundAlerts: false,
            autoRefresh: true,
            compactTables: false,
          };
    } catch {
      return {
        emailAlerts: true,
        soundAlerts: false,
        autoRefresh: true,
        compactTables: false,
      };
    }
  });
  const [prefSuccess, setPrefSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;
    getMe()
      .then((res) => {
        if (cancelled) return;
        const u = res?.user;
        if (u) {
          setUser(u);
          setProfileForm({
            fullName: u.fullName || "",
            phone: u.phone || "",
            location: u.location || "",
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load admin account data:", err);
        if (!cancelled) {
          setFetchError("Failed to fetch administrator account details from backend.");
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setSavingProfile(true);
    setProfileSuccess("");
    setProfileError("");

    try {
      const userId = user.id || user._id;
      const updatedUser = await updateUser(userId, profileForm);

      setUser(updatedUser);
      // Sync localStorage session
      try {
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } catch (err) {
        console.warn("Failed to sync localStorage user:", err);
      }

      setProfileSuccess("Administrator profile details updated successfully!");
      setTimeout(() => setProfileSuccess(""), 4000);
    } catch (err) {
      console.error("Profile update error:", err);
      setProfileError(err.response?.data?.message || "Failed to update profile details.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordSuccess("");
    setPasswordError("");

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setPasswordError("Please fill out all password fields.");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New password and confirmation password do not match.");
      return;
    }

    setSavingPassword(true);

    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordSuccess("Security password updated successfully!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => setPasswordSuccess(""), 4000);
    } catch (err) {
      console.error("Password change error:", err);
      setPasswordError(
        err.response?.data?.message || "Failed to change password. Please verify current password."
      );
    } finally {
      setSavingPassword(false);
    }
  };

  const togglePreference = (key) => {
    setPreferences((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem("admin_preferences", JSON.stringify(updated));
      } catch (err) {
        console.warn("Failed to save admin preferences:", err);
      }
      return updated;
    });
    setPrefSuccess("System preferences saved!");
    setTimeout(() => setPrefSuccess(""), 3000);
  };

  if (loading) return <LoadingSpinner label="Loading administrator settings..." />;

  return (
    <div className="admin-page settings-page">
      {/* Page Header */}
      <div className="admin-dashboard__head settings-head">
        <div>
          <div className="settings-head-title-row">
            <h1>Settings</h1>
            <StatusBadge tone="info">Admin Control Center</StatusBadge>
          </div>
          <p>Manage your administrator account details, security credentials, and system preferences.</p>
        </div>
      </div>

      {fetchError && (
        <div className="settings-error-banner">
          <AlertTriangle size={18} />
          <span>{fetchError}</span>
        </div>
      )}

      {user && (
        <div className="settings-grid">
          {/* Identity & Overview Card */}
          <div className="chart-card settings-card settings-identity-card">
            <div className="settings-identity-header">
              <div className="settings-avatar">
                {(user.fullName || "A").charAt(0).toUpperCase()}
              </div>
              <div className="settings-identity-info">
                <h2>{user.fullName || "Administrator"}</h2>
                <span className="settings-role-tag">
                  <ShieldCheck size={14} /> {ROLE_LABEL[user.role] || user.role || "Administrator"}
                </span>
              </div>
            </div>

            <div className="settings-detail-grid">
              <div className="settings-detail-item">
                <Mail size={15} className="settings-detail-icon" />
                <div>
                  <span className="settings-detail-lbl">Email Address</span>
                  <strong className="settings-detail-val">{user.email}</strong>
                </div>
              </div>

              <div className="settings-detail-item">
                <Phone size={15} className="settings-detail-icon" />
                <div>
                  <span className="settings-detail-lbl">Phone Contact</span>
                  <strong className="settings-detail-val">{user.phone || "Not provided"}</strong>
                </div>
              </div>

              <div className="settings-detail-item">
                <MapPin size={15} className="settings-detail-icon" />
                <div>
                  <span className="settings-detail-lbl">District / Base</span>
                  <strong className="settings-detail-val">{user.location || "District Headquarters"}</strong>
                </div>
              </div>

              <div className="settings-detail-item">
                <Calendar size={15} className="settings-detail-icon" />
                <div>
                  <span className="settings-detail-lbl">Account Created</span>
                  <strong className="settings-detail-val">{formatJoinDate(user.createdAt)}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Update Form */}
          <div className="chart-card settings-card">
            <div className="settings-card-title">
              <UserCircle size={18} className="settings-icon-brand" />
              <h3>Account Profile Settings</h3>
            </div>

            {profileSuccess && (
              <div className="settings-success-banner">
                <CheckCircle2 size={16} />
                <span>{profileSuccess}</span>
              </div>
            )}

            {profileError && (
              <div className="settings-error-banner">
                <AlertTriangle size={16} />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="settings-form">
              <div className="settings-form-row">
                <div className="settings-field">
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  />
                </div>

                <div className="settings-field">
                  <label htmlFor="email">Email Address (Read-Only)</label>
                  <input
                    id="email"
                    type="email"
                    disabled
                    value={user.email || ""}
                    className="input-disabled"
                  />
                </div>
              </div>

              <div className="settings-form-row">
                <div className="settings-field">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    id="phone"
                    type="text"
                    placeholder="+91 98765 43210"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  />
                </div>

                <div className="settings-field">
                  <label htmlFor="location">District / Base Location</label>
                  <input
                    id="location"
                    type="text"
                    placeholder="e.g. District Emergency Command Center"
                    value={profileForm.location}
                    onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="settings-form-actions">
                <button type="submit" className="settings-btn-primary" disabled={savingProfile}>
                  <Save size={14} />
                  {savingProfile ? "Saving Profile..." : "Save Profile Changes"}
                </button>
              </div>
            </form>
          </div>

          {/* Security & Password Form */}
          <div className="chart-card settings-card">
            <div className="settings-card-title">
              <Lock size={18} className="settings-icon-brand" />
              <h3>Security & Password Credentials</h3>
            </div>

            {passwordSuccess && (
              <div className="settings-success-banner">
                <CheckCircle2 size={16} />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="settings-error-banner">
                <AlertTriangle size={16} />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="settings-form">
              <div className="settings-field">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  id="currentPassword"
                  type="password"
                  required
                  placeholder="Enter current password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                />
              </div>

              <div className="settings-form-row">
                <div className="settings-field">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    id="newPassword"
                    type="password"
                    required
                    placeholder="At least 6 characters"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  />
                </div>

                <div className="settings-field">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    placeholder="Re-enter new password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  />
                </div>
              </div>

              <div className="settings-form-actions">
                <button type="submit" className="settings-btn-primary" disabled={savingPassword}>
                  <Lock size={14} />
                  {savingPassword ? "Updating Password..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>

          {/* System & Notification Preferences */}
          <div className="chart-card settings-card">
            <div className="settings-card-title">
              <Sliders size={18} className="settings-icon-brand" />
              <h3>System & Console Preferences</h3>
            </div>

            {prefSuccess && (
              <div className="settings-success-banner">
                <CheckCircle2 size={16} />
                <span>{prefSuccess}</span>
              </div>
            )}

            <div className="settings-toggles-list">
              <PreferenceToggle
                icon={Bell}
                label="Critical Email Alerts"
                description="Receive instant email notifications when critical disaster incidents are reported."
                checked={preferences.emailAlerts}
                onChange={() => togglePreference("emailAlerts")}
              />

              <PreferenceToggle
                icon={Volume2}
                label="Emergency Sound Tone"
                description="Play audio alerts when high severity disaster events arrive on the dashboard."
                checked={preferences.soundAlerts}
                onChange={() => togglePreference("soundAlerts")}
              />

              <PreferenceToggle
                icon={RefreshCw}
                label="Auto-Refresh Dashboard Data"
                description="Automatically refresh live incident and risk metrics every 30 seconds."
                checked={preferences.autoRefresh}
                onChange={() => togglePreference("autoRefresh")}
              />

              <PreferenceToggle
                icon={Sliders}
                label="Compact Table Views"
                description="Display management tables in compact mode across admin pages."
                checked={preferences.compactTables}
                onChange={() => togglePreference("compactTables")}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PreferenceToggle({ icon: Icon, label, description, checked, onChange }) {
  return (
    <div className="settings-toggle-row" onClick={onChange}>
      <div className="settings-toggle-left">
        <span className="settings-toggle-icon">
          <Icon size={16} />
        </span>
        <div>
          <span className="settings-toggle-label">{label}</span>
          <span className="settings-toggle-desc">{description}</span>
        </div>
      </div>

      <div className={`settings-switch ${checked ? "settings-switch--on" : ""}`}>
        <div className="settings-switch-knob" />
      </div>
    </div>
  );
}

export default AdminSettingsPage;
