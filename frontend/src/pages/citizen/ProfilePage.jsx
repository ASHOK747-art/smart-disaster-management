import { useEffect, useState } from "react";
import { UserCircle, Mail, Phone, MapPin, Calendar, Pencil, Check, X } from "lucide-react";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/common/StatusBadge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { getProfile, updateProfile } from "../../services/userService";
import { getMyIncidents } from "../../services/incidentService";
import { ROLE_LABEL } from "../../data/navigation";
import "./ProfilePage.css";

function formatJoinDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [reportCount, setReportCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getProfile(), getMyIncidents()]).then(([profileRes, incidentsRes]) => {
      if (cancelled) return;
      setProfile(profileRes);
      setReportCount(incidentsRes.length);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <LoadingSpinner label="Loading your profile…" />;

  function startEditing() {
    setForm({ fullName: profile.fullName, phone: profile.phone, location: profile.location });
    setEditing(true);
  }

  function cancelEditing() {
    setEditing(false);
    setForm(null);
  }

  async function saveEditing() {
    setSaving(true);
    const updated = await updateProfile(form);
    setProfile(updated);
    setSaving(false);
    setEditing(false);
  }

  function toggleNotify(key) {
    updateProfile({ [key]: !profile[key] }).then(setProfile);
  }

  return (
    <div className="profile-page">
      <div className="profile-page__head">
        <h1>Profile</h1>
        <p>Manage your account details and notification preferences.</p>
      </div>

      {/* ---- Identity card ---- */}
      <div className="profile-card">
        <div className="profile-card__avatar">{profile.fullName.charAt(0)}</div>

        <div className="profile-card__info">
          <div className="profile-card__name-row">
            <h2>{profile.fullName}</h2>
            {profile.verified && <StatusBadge tone="safe">Verified</StatusBadge>}
          </div>
          <span className="profile-card__role">{ROLE_LABEL[profile.role]}</span>
        </div>

        {!editing && (
          <Button variant="outline" size="sm" icon={Pencil} onClick={startEditing}>
            Edit Profile
          </Button>
        )}
      </div>

      {/* ---- Details ---- */}
      <div className="profile-section">
        <h3>Account Details</h3>

        {editing ? (
          <div className="profile-form">
            <div className="form-field">
              <label htmlFor="fullName">Full name</label>
              <input
                id="fullName"
                value={form.fullName}
                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
              />
            </div>
            <div className="form-field">
              <label htmlFor="phone">Phone</label>
              <input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div className="form-field">
              <label htmlFor="location">Location</label>
              <input
                id="location"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              />
            </div>
            <div className="profile-form__actions">
              <Button variant="primary" size="sm" icon={Check} onClick={saveEditing} disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </Button>
              <Button variant="ghost" size="sm" icon={X} onClick={cancelEditing} disabled={saving}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="profile-detail-list">
            <div className="profile-detail-list__item">
              <Mail size={16} />
              <div>
                <span>Email</span>
                <strong>{profile.email}</strong>
              </div>
            </div>
            <div className="profile-detail-list__item">
              <Phone size={16} />
              <div>
                <span>Phone</span>
                <strong>{profile.phone}</strong>
              </div>
            </div>
            <div className="profile-detail-list__item">
              <MapPin size={16} />
              <div>
                <span>Location</span>
                <strong>{profile.location}</strong>
              </div>
            </div>
            <div className="profile-detail-list__item">
              <Calendar size={16} />
              <div>
                <span>Member since</span>
                <strong>{formatJoinDate(profile.joinedAt)}</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ---- Activity ---- */}
      <div className="profile-section">
        <h3>Activity</h3>
        <div className="profile-stat">
          <UserCircle size={18} />
          <span>
            You've submitted <strong className="data-text">{reportCount}</strong> emergency report
            {reportCount === 1 ? "" : "s"} so far.
          </span>
        </div>
      </div>

      {/* ---- Notification preferences ---- */}
      <div className="profile-section">
        <h3>Notification Preferences</h3>
        <div className="profile-toggles">
          <ToggleRow
            label="Email notifications"
            description="Receive alerts and updates by email."
            checked={profile.notifyEmail}
            onChange={() => toggleNotify("notifyEmail")}
          />
          <ToggleRow
            label="SMS notifications"
            description="Get critical alerts as text messages."
            checked={profile.notifySms}
            onChange={() => toggleNotify("notifySms")}
          />
          <ToggleRow
            label="Push notifications"
            description="Receive alerts directly in the app."
            checked={profile.notifyPush}
            onChange={() => toggleNotify("notifyPush")}
          />
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <label className="toggle-row">
      <div>
        <span className="toggle-row__label">{label}</span>
        <span className="toggle-row__desc">{description}</span>
      </div>
      <span className={`toggle-switch ${checked ? "toggle-switch--on" : ""}`} onClick={onChange}>
        <span className="toggle-switch__knob" />
      </span>
    </label>
  );
}

export default ProfilePage;
