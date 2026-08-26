import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  CloudRain,
  Flame,
  Building2,
  Mountain,
  Wind,
  Car,
  HeartPulse,
  CircleHelp,
  LocateFixed,
  ImagePlus,
  X,
  CheckCircle2,
  FileText,
} from "lucide-react";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/common/StatusBadge";
import { INCIDENT_TYPES } from "../../data/mockIncidents";
import { SEVERITY_LEVELS, severityTone } from "../../utils/severity";
import { submitIncident } from "../../services/incidentService";
import "./ReportEmergencyPage.css";

const TYPE_ICONS = {
  Flood: CloudRain,
  Fire: Flame,
  "Building Collapse": Building2,
  Landslide: Mountain,
  Cyclone: Wind,
  Accident: Car,
  "Medical Emergency": HeartPulse,
  Other: CircleHelp,
};

const INITIAL_FORM = {
  type: "",
  severity: "",
  description: "",
  location: "",
  peopleAffected: 1,
};

function ReportEmergencyPage() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [coords, setCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);

  // Release the object URL when the photo changes or the page unmounts.
  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  function updateField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function handleUseLocation() {
    if (!navigator.geolocation) {
      setGeoError("Location access isn't supported on this device. Enter it manually below.");
      return;
    }
    setLocating(true);
    setGeoError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ latitude, longitude });
        setForm((f) => ({
          ...f,
          location: f.location.trim()
            ? f.location
            : `Lat ${latitude.toFixed(5)}, Lng ${longitude.toFixed(5)}`,
        }));
        setLocating(false);
        if (errors.location) setErrors((e) => ({ ...e, location: undefined }));
      },
      () => {
        setGeoError("Couldn't get your location. Please enter it manually.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    e.target.value = "";
  }

  function removePhoto() {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhoto(null);
    setPhotoPreview(null);
  }

  function validate() {
    const next = {};
    if (!form.type) next.type = "Select the type of emergency.";
    if (!form.severity) next.severity = "Select a severity level.";
    if (form.description.trim().length < 10) {
      next.description = "Add a few more details (at least 10 characters).";
    }
    if (!form.location.trim()) {
      next.location = "Enter a location, or use your current GPS location.";
    }
    if (!form.peopleAffected || Number(form.peopleAffected) < 1) {
      next.peopleAffected = "Enter at least 1.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const incident = await submitIncident({
        type: form.type,
        severity: form.severity,
        description: form.description.trim(),
        location: form.location.trim(),
        peopleAffected: Number(form.peopleAffected),
        ...(coords && { latitude: coords.latitude, longitude: coords.longitude }),
        hasPhoto: Boolean(photo),
      });
      setSubmitted(incident);
    } finally {
      setSubmitting(false);
    }
  }

  function handleReportAnother() {
    setForm(INITIAL_FORM);
    setErrors({});
    setCoords(null);
    setGeoError("");
    removePhoto();
    setSubmitted(null);
  }

  if (submitted) {
    return (
      <div className="report-page container">
        <div className="report-confirm">
          <span className="report-confirm__icon">
            <CheckCircle2 size={28} />
          </span>
          <h1>Report submitted</h1>
          <p>
            Your report has been logged and is awaiting verification. A response team will be
            dispatched once it's confirmed.
          </p>

          <div className="report-confirm__card">
            <div className="report-confirm__row">
              <span>Reference ID</span>
              <span className="data-text">{submitted.id}</span>
            </div>
            <div className="report-confirm__row">
              <span>Status</span>
              <StatusBadge tone="info">{submitted.status}</StatusBadge>
            </div>
            <div className="report-confirm__row">
              <span>Type</span>
              <span>{submitted.type}</span>
            </div>
            <div className="report-confirm__row">
              <span>Severity</span>
              <StatusBadge tone={severityTone(submitted.severity)}>{submitted.severity}</StatusBadge>
            </div>
          </div>

          <p className="report-confirm__note">
            Keep your reference ID handy — you'll be able to track this report's status once
            incident tracking is live.
          </p>

          <div className="report-confirm__actions">
            <Button variant="outline" onClick={handleReportAnother}>
              Report Another Emergency
            </Button>
            <Button as={Link} to="/citizen/my-reports" icon={FileText}>
              View My Reports
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="report-page container">
      <div className="report-page__head">
        <h1>Report an Emergency</h1>
        <p>Give us as much detail as you can — every field helps responders act faster.</p>
      </div>

      <div className="report-page__safety-banner">
        <AlertTriangle size={18} />
        <p>
          If someone's life is in immediate danger, call <strong>112</strong> (India's national
          emergency number) right now. This form alerts our response team, but it doesn't replace
          an emergency call.
        </p>
      </div>

      <form className="report-form" onSubmit={handleSubmit} noValidate>
        {/* ---- Type ---- */}
        <div className={`report-field ${errors.type ? "report-field--error" : ""}`}>
          <label>Type of emergency</label>
          <div className="report-type-grid">
            {INCIDENT_TYPES.map((type) => {
              const Icon = TYPE_ICONS[type];
              const active = form.type === type;
              return (
                <button
                  type="button"
                  key={type}
                  className={`report-type ${active ? "report-type--active" : ""}`}
                  onClick={() => updateField("type", type)}
                  aria-pressed={active}
                >
                  <Icon size={20} />
                  <span>{type}</span>
                </button>
              );
            })}
          </div>
          {errors.type && <span className="report-field__error">{errors.type}</span>}
        </div>

        {/* ---- Severity ---- */}
        <div className={`report-field ${errors.severity ? "report-field--error" : ""}`}>
          <label>How severe is it?</label>
          <div className="report-severity-row">
            {SEVERITY_LEVELS.map((level) => {
              const active = form.severity === level;
              return (
                <button
                  type="button"
                  key={level}
                  className={`report-severity report-severity--${severityTone(level)} ${
                    active ? "report-severity--active" : ""
                  }`}
                  onClick={() => updateField("severity", level)}
                  aria-pressed={active}
                >
                  {level}
                </button>
              );
            })}
          </div>
          {errors.severity && <span className="report-field__error">{errors.severity}</span>}
        </div>

        {/* ---- Description ---- */}
        <div className={`report-field ${errors.description ? "report-field--error" : ""}`}>
          <label htmlFor="description">What's happening?</label>
          <textarea
            id="description"
            rows={4}
            placeholder="Describe the situation — what you're seeing, who's affected, and anything responders should know."
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
          />
          {errors.description && <span className="report-field__error">{errors.description}</span>}
        </div>

        {/* ---- Location ---- */}
        <div className={`report-field ${errors.location ? "report-field--error" : ""}`}>
          <label htmlFor="location">Location</label>
          <div className="report-location-row">
            <input
              id="location"
              type="text"
              placeholder="Street, area, or landmark"
              value={form.location}
              onChange={(e) => updateField("location", e.target.value)}
            />
            <Button
              type="button"
              variant="outline"
              icon={LocateFixed}
              onClick={handleUseLocation}
              disabled={locating}
            >
              {locating ? "Locating…" : "Use my location"}
            </Button>
          </div>
          {coords && (
            <span className="report-field__hint">
              GPS captured: {coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)}
            </span>
          )}
          {geoError && <span className="report-field__error">{geoError}</span>}
          {errors.location && <span className="report-field__error">{errors.location}</span>}
        </div>

        {/* ---- People affected ---- */}
        <div
          className={`report-field report-field--narrow ${
            errors.peopleAffected ? "report-field--error" : ""
          }`}
        >
          <label htmlFor="peopleAffected">People affected</label>
          <input
            id="peopleAffected"
            type="number"
            min={1}
            value={form.peopleAffected}
            onChange={(e) => updateField("peopleAffected", e.target.value)}
          />
          {errors.peopleAffected && (
            <span className="report-field__error">{errors.peopleAffected}</span>
          )}
        </div>

        {/* ---- Photo (optional) ---- */}
        <div className="report-field">
          <label>Photo (optional)</label>
          {photoPreview ? (
            <div className="report-photo-preview">
              <img src={photoPreview} alt="Selected emergency scene" />
              <button type="button" className="report-photo-preview__remove" onClick={removePhoto}>
                <X size={16} />
              </button>
            </div>
          ) : (
            <label className="report-photo-upload">
              <ImagePlus size={20} />
              <span>Add a photo of the scene</span>
              <input type="file" accept="image/*" onChange={handlePhotoChange} hidden />
            </label>
          )}
          <span className="report-field__hint">
            Helps responders assess the situation. Automatic AI damage analysis isn't available
            yet — this photo is stored with your report as-is.
          </span>
        </div>

        <Button type="submit" variant="critical" size="lg" fullWidth disabled={submitting}>
          {submitting ? "Submitting…" : "Submit Report"}
        </Button>
      </form>
    </div>
  );
}

export default ReportEmergencyPage;
