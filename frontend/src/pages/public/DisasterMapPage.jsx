import { useEffect, useMemo, useState, Fragment } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polygon } from "react-leaflet";
import L from "leaflet";
import {
  Siren,
  Building2,
  Home as HomeIcon,
  Ambulance,
  HeartHandshake,
  Users,
  MapPin,
  Clock,
  RefreshCw,
  Bed,
  ShieldAlert,
  AlertTriangle,
} from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import StatusBadge from "../../components/common/StatusBadge";
import { getMapData } from "../../services/mapService";
import { severityTone, statusTone, shouldPulse } from "../../utils/severity";
import { timeAgo } from "../../utils/formatTime";
import "leaflet/dist/leaflet.css";
import "./DisasterMapPage.css";

const INDIA_CENTER = [22.0, 79.0]; // Centered view over India for nationwide GIS District Intelligence

const TONE_COLOR = {
  critical: "#e4402c", // High / Critical severity -> Red
  warning: "#f0a202",  // Medium / Warning severity -> Orange/Yellow
  safe: "#1e9e6b",     // Safe / Shelter / Available -> Green
  info: "#2f6690",     // Hospital / Info -> Blue
  neutral: "#667085",  // Neutral / Secondary -> Slate
};

const LAYERS = [
  { id: "all", label: "All Layers" },
  { id: "floodRisk", label: "District Disaster Data", icon: AlertTriangle },
  { id: "incidents", label: "Live Incidents", icon: Siren },
  { id: "hospitals", label: "Hospitals", icon: Building2 },
  { id: "shelters", label: "Shelters", icon: HomeIcon },
  { id: "rescueTeams", label: "Rescue Teams", icon: Ambulance },
  { id: "volunteers", label: "Volunteers", icon: HeartHandshake },
];

/**
 * Coordinate validator to prevent map crashes on invalid/missing lat/lng
 */
function isValidCoord(lat, lng) {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    isFinite(lat) &&
    isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

/**
 * Polygon ring validator to prevent geometry crashes
 */
function isValidRing(ring) {
  if (!Array.isArray(ring) || ring.length < 3) return false;
  return ring.every(
    (pt) =>
      Array.isArray(pt) &&
      pt.length >= 2 &&
      isValidCoord(pt[0], pt[1])
  );
}

/**
 * Creates custom SVG map marker pin with optional pulse effect for critical items
 */
function pinIcon(color, glyph, pulse = false) {
  const html = `
    <div style="position: relative; width: 30px; height: 30px;">
      ${pulse ? `<div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: ${color}; opacity: 0.5; animation: pulse-ring 1.8s infinite; top: -3px; left: -3px;"></div>` : ""}
      <div style="
        width: 30px; height: 30px; border-radius: 50% 50% 50% 0;
        background: ${color}; transform: rotate(-45deg);
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 3px 8px rgba(16,24,40,0.35); border: 2px solid white;
        position: relative; z-index: 2;
      ">
        <span style="transform: rotate(45deg); color: white; font-size: 13px; font-weight: 700; font-family: system-ui;">${glyph}</span>
      </div>
    </div>`;
  return L.divIcon({ html, className: "map-pin", iconSize: [30, 30], iconAnchor: [15, 30], popupAnchor: [0, -28] });
}

/**
 * Safely resolves image URLs (handles relative vs absolute paths)
 */
function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const base = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}

/**
 * Identifies incident disaster category for icon glyph hints
 */
function getDisasterGlyph(typeStr = "") {
  const t = typeStr.toLowerCase();
  if (t.includes("flood")) return "🌊";
  if (t.includes("cyclone") || t.includes("wind") || t.includes("storm")) return "🌪️";
  if (t.includes("landslide") || t.includes("quake")) return "⛰️";
  if (t.includes("rain")) return "🌧️";
  if (t.includes("fire")) return "🔥";
  return "!";
}

function DisasterMapPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [layer, setLayer] = useState("all");

  const loadMapData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMapData();
      setData(res);
    } catch (err) {
      console.error("Failed to load map data:", err);
      setError("Unable to load GIS map data. Please check connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMapData();
  }, []);

  const markers = useMemo(() => {
    if (!data) return [];
    const list = [];

    // --- 1. LIVE INCIDENTS ---
    if (layer === "all" || layer === "incidents") {
      (data.incidents || []).forEach((i) => {
        if (!isValidCoord(i.latitude, i.longitude)) return;
        
        const tone = severityTone(i.severity);
        const color = TONE_COLOR[tone] || TONE_COLOR.critical;
        const pulse = shouldPulse(i.severity) || shouldPulse(i.status);
        const glyph = getDisasterGlyph(i.type || i.title || "");
        const imgUrl = getImageUrl(i.imagePath || (i.images && i.images[0]));

        list.push({
          key: `incident-${i.id || i._id}`,
          lat: i.latitude,
          lng: i.longitude,
          icon: pinIcon(color, glyph, pulse),
          render: () => (
            <>
              <div className="map-popup__head">
                <h4>{i.type ? `${i.type} Incident` : i.title || "Incident Report"}</h4>
                <StatusBadge tone={statusTone(i.status)} pulse={pulse}>
                  {i.status || "Reported"}
                </StatusBadge>
              </div>

              {i.description && <p>{i.description}</p>}

              {imgUrl && (
                <div className="map-popup__image-wrap">
                  <img
                    src={imgUrl}
                    alt={i.type || "Incident scene"}
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                </div>
              )}

              <div className="map-popup__meta">
                <span><MapPin size={13} /> {i.locationText || i.location || `${i.latitude.toFixed(4)}, ${i.longitude.toFixed(4)}`}</span>
                <span><Clock size={13} /> {timeAgo(i.createdAt || i.reportedAt)}</span>
              </div>

              <div style={{ marginTop: "6px" }}>
                <StatusBadge tone={severityTone(i.severity)}>
                  Severity: {i.severity || "Standard"}
                </StatusBadge>
              </div>
            </>
          ),
        });
      });
    }

    // --- 2. HOSPITALS ---
    if (layer === "all" || layer === "hospitals") {
      (data.hospitals || []).forEach((h) => {
        if (!isValidCoord(h.latitude, h.longitude)) return;

        const bedsFree = typeof h.availableBeds === "number" ? h.availableBeds : 0;
        const tone = bedsFree > 0 ? "safe" : "critical";

        list.push({
          key: `hospital-${h.id || h._id}`,
          lat: h.latitude,
          lng: h.longitude,
          icon: pinIcon(TONE_COLOR.info, "H"),
          render: () => (
            <>
              <div className="map-popup__head">
                <h4>{h.name || "Medical Center"}</h4>
                <StatusBadge tone={tone}>
                  {bedsFree > 0 ? `${bedsFree} Beds Free` : "Full"}
                </StatusBadge>
              </div>

              <div className="map-popup__meta">
                <span><MapPin size={13} /> {h.address || h.location || "Hospital Address"}</span>
                {h.contactNumber && <span>📞 {h.contactNumber}</span>}
              </div>

              <div className="map-popup__stats">
                <span><Bed size={13} style={{ display: "inline", verticalAlign: "middle" }} /> Total Beds: {h.totalBeds || h.capacity || "N/A"}</span>
                <span>ICU: {h.icuAvailable || h.icuBeds ? "Available" : "Full/None"}</span>
              </div>
            </>
          ),
        });
      });
    }

    // --- 3. SHELTERS ---
    if (layer === "all" || layer === "shelters") {
      (data.shelters || []).forEach((s) => {
        if (!isValidCoord(s.latitude, s.longitude)) return;

        const cap = s.capacity || 100;
        const occ = s.currentOccupancy || s.occupied || 0;
        const free = Math.max(0, cap - occ);

        list.push({
          key: `shelter-${s.id || s._id}`,
          lat: s.latitude,
          lng: s.longitude,
          icon: pinIcon(TONE_COLOR.safe, "S"),
          render: () => (
            <>
              <div className="map-popup__head">
                <h4>{s.name || "Relief Shelter"}</h4>
                <StatusBadge tone={free > 0 ? "safe" : "warning"}>
                  {free > 0 ? `${free} Spaces Free` : "At Capacity"}
                </StatusBadge>
              </div>

              <div className="map-popup__meta">
                <span><MapPin size={13} /> {s.address || s.location || "Shelter Address"}</span>
              </div>

              <div className="map-popup__stats">
                <span>Occupancy: {occ} / {cap}</span>
              </div>

              {s.facilities && Array.isArray(s.facilities) && s.facilities.length > 0 && (
                <p style={{ marginTop: "6px", fontSize: "11px", color: "#667085" }}>
                  <strong>Amenities:</strong> {s.facilities.join(", ")}
                </p>
              )}
            </>
          ),
        });
      });
    }

    // --- 4. RESCUE TEAMS ---
    if (layer === "all" || layer === "rescueTeams") {
      (data.rescueTeams || []).forEach((r) => {
        if (!isValidCoord(r.latitude, r.longitude)) return;

        const status = r.status || "Deployed";
        const tone = status.toLowerCase() === "deployed" ? "warning" : "safe";

        list.push({
          key: `rescue-${r.id || r._id}`,
          lat: r.latitude,
          lng: r.longitude,
          icon: pinIcon("#1c3b6b", "R"),
          render: () => (
            <>
              <div className="map-popup__head">
                <h4>{r.teamName || r.name || "Emergency Rescue Team"}</h4>
                <StatusBadge tone={tone}>{status}</StatusBadge>
              </div>

              <div className="map-popup__meta">
                <span><MapPin size={13} /> {r.location || "Assigned Sector"}</span>
                <span><Users size={13} /> {r.membersCount || 5} Members</span>
              </div>

              {r.specialization && (
                <p style={{ marginTop: "4px", fontSize: "11px", color: "#475467" }}>
                  <strong>Specialization:</strong> {r.specialization}
                </p>
              )}
            </>
          ),
        });
      });
    }

    // --- 5. VOLUNTEERS ---
    if (layer === "all" || layer === "volunteers") {
      (data.volunteers || []).forEach((v) => {
        if (!isValidCoord(v.latitude, v.longitude)) return;

        list.push({
          key: `volunteer-${v.id || v._id}`,
          lat: v.latitude,
          lng: v.longitude,
          icon: pinIcon("#8a5cf6", "V"),
          render: () => (
            <>
              <div className="map-popup__head">
                <h4>{v.name || "Volunteer Resource"}</h4>
                <StatusBadge tone="safe">Active</StatusBadge>
              </div>

              <div className="map-popup__meta">
                <span><MapPin size={13} /> {v.location || "Stationed Unit"}</span>
                <span><Users size={13} /> {v.availableCount || 1} Available</span>
              </div>
            </>
          ),
        });
      });
    }

    return list;
  }, [data, layer]);

  if (loading) {
    return <LoadingSpinner label="Initializing Smart Disaster GIS Map & Datasets..." />;
  }

  if (error) {
    return (
      <div className="disaster-map-error">
        <ShieldAlert size={40} color="#e4402c" />
        <h3>Map Load Failure</h3>
        <p>{error}</p>
        <button className="disaster-map-error__retry" onClick={loadMapData}>
          <RefreshCw size={14} /> Retry Loading Map
        </button>
      </div>
    );
  }

  return (
    <div className="disaster-map">
      {/* GIS Floating Layer Control Bar */}
      <div className="disaster-map__controls" role="toolbar" aria-label="Map Filter Layers">
        {LAYERS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`disaster-map__filter ${layer === id ? "disaster-map__filter--active" : ""}`}
            onClick={() => setLayer(id)}
          >
            {Icon && <Icon size={14} />}
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Main Leaflet Map Container */}
      <MapContainer
        center={INDIA_CENTER}
        zoom={5}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* --- 6. DISTRICT HISTORICAL DISASTER / FLOOD DATA POLYGONS --- */}
        {(layer === "all" || layer === "floodRisk") &&
          data?.floodRisks &&
          data.floodRisks.map((district, idx) => {
            const color =
              district.riskLevel === "High"
                ? TONE_COLOR.critical
                : district.riskLevel === "Medium"
                ? TONE_COLOR.warning
                : TONE_COLOR.safe;

            const badgeTone =
              district.riskLevel === "High"
                ? "critical"
                : district.riskLevel === "Medium"
                ? "warning"
                : "safe";

            const popContent = (
              <div className="map-popup">
                <div className="map-popup__head">
                  <h4>{district.district} District</h4>
                  <StatusBadge tone={badgeTone}>
                    {district.riskLevel} Flood Risk
                  </StatusBadge>
                </div>
                <div className="map-popup__meta">
                  <span><MapPin size={12} /> State: {district.state}</span>
                </div>
                {district.probabilities && (
                  <div style={{ fontSize: "12px", marginTop: "6px" }}>
                    <strong>Risk Probabilities:</strong>
                    <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                      <span style={{ color: TONE_COLOR.critical, fontWeight: 600 }}>High: {district.probabilities.High}%</span>
                      <span style={{ color: TONE_COLOR.warning, fontWeight: 600 }}>Med: {district.probabilities.Medium}%</span>
                      <span style={{ color: TONE_COLOR.safe, fontWeight: 600 }}>Low: {district.probabilities.Low}%</span>
                    </div>
                  </div>
                )}
                {district.features && (
                  <div style={{ fontSize: "11px", marginTop: "8px", color: "#344054", lineHeight: "1.5" }}>
                    <div><strong>Historical Flood Events:</strong> {district.features.historicalFloodCount} events</div>
                    <div><strong>Flooded Area:</strong> {district.features.percentFloodedArea}% (Corrected: {district.features.correctedFloodedArea}%)</div>
                    <div><strong>Mean Flood Duration:</strong> {district.features.meanFloodDuration} days</div>
                    {district.features.population && (
                      <div><strong>Population:</strong> {district.features.population.toLocaleString()}</div>
                    )}
                    {district.features.permanentWater && (
                      <div><strong>Permanent Water:</strong> {district.features.permanentWater}%</div>
                    )}
                  </div>
                )}
              </div>
            );

            if (
              Array.isArray(district.coordinates) &&
              district.coordinates.length > 0 &&
              district.coordinates.every(isValidRing)
            ) {
              return (
                <Fragment key={`flood-risk-group-${district.district_key || idx}`}>
                  {district.coordinates.map((ring, rIdx) => (
                    <Polygon
                      key={`poly-${district.district_key || idx}-${rIdx}`}
                      positions={ring}
                      pathOptions={{
                        color: color,
                        fillColor: color,
                        fillOpacity: 0.35,
                        weight: 1.5,
                      }}
                    >
                      <Popup>{popContent}</Popup>
                    </Polygon>
                  ))}
                </Fragment>
              );
            } else if (isValidCoord(district.latitude, district.longitude)) {
              return (
                <Marker
                  key={`flood-risk-marker-${district.district_key || idx}`}
                  position={[district.latitude, district.longitude]}
                  icon={pinIcon(color, "F")}
                >
                  <Popup>{popContent}</Popup>
                </Marker>
              );
            }
            return null;
          })}

        {/* --- 7. RESOURCE & INCIDENT MARKERS --- */}
        {markers.map((m) => (
          <Marker key={m.key} position={[m.lat, m.lng]} icon={m.icon}>
            <Popup>
              <div className="map-popup">{m.render()}</div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map Legend */}
      <div className="disaster-map__legend">
        <div className="disaster-map__legend-title">GIS Disaster Intelligence</div>
        {(layer === "all" || layer === "floodRisk") && (
          <>
            <span><i style={{ background: TONE_COLOR.critical }} /> High Flood Risk District</span>
            <span><i style={{ background: TONE_COLOR.warning }} /> Medium Flood Risk District</span>
            <span><i style={{ background: TONE_COLOR.safe }} /> Low Flood Risk District</span>
          </>
        )}
        {(layer === "all" || layer === "incidents") && (
          <>
            <span><i style={{ background: TONE_COLOR.critical }} /> Critical / Active Incident</span>
            <span><i style={{ background: TONE_COLOR.warning }} /> Warning / Verified Incident</span>
          </>
        )}
        {(layer === "all" || layer === "hospitals") && (
          <span><i style={{ background: TONE_COLOR.info }} /> Hospital (Medical)</span>
        )}
        {(layer === "all" || layer === "shelters") && (
          <span><i style={{ background: TONE_COLOR.safe }} /> Relief Shelter</span>
        )}
        {(layer === "all" || layer === "rescueTeams") && (
          <span><i style={{ background: "#1c3b6b" }} /> Rescue Team</span>
        )}
        {(layer === "all" || layer === "volunteers") && (
          <span><i style={{ background: "#8a5cf6" }} /> Volunteer</span>
        )}
      </div>
    </div>
  );
}

export default DisasterMapPage;
