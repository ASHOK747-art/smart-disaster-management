import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
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
} from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import StatusBadge from "../../components/common/StatusBadge";
import { getMapData } from "../../services/mapService";
import { severityTone, statusTone, shouldPulse } from "../../utils/severity";
import { timeAgo } from "../../utils/formatTime";
import "leaflet/dist/leaflet.css";
import "./DisasterMapPage.css";

const DISTRICT_CENTER = [13.0475, 80.2340]; // Chennai District

const TONE_COLOR = {
  critical: "#e4402c",
  warning: "#f0a202",
  safe: "#1e9e6b",
  info: "#2f6690",
  neutral: "#98a2b3",
};

const LAYERS = [
  { id: "all", label: "All" },
  { id: "incidents", label: "Incidents", icon: Siren },
  { id: "hospitals", label: "Hospitals", icon: Building2 },
  { id: "shelters", label: "Shelters", icon: HomeIcon },
  { id: "rescueTeams", label: "Rescue Teams", icon: Ambulance },
  { id: "volunteers", label: "Volunteers", icon: HeartHandshake },
];

// Builds a small colored SVG pin as a Leaflet divIcon — avoids bundler issues
// with Leaflet's default marker image paths and lets us color-code by status.
function pinIcon(color, glyph) {
  const html = `
    <div style="
      width: 30px; height: 30px; border-radius: 50% 50% 50% 0;
      background: ${color}; transform: rotate(-45deg);
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 6px rgba(16,24,40,0.35); border: 2px solid white;
    ">
      <span style="transform: rotate(45deg); color: white; font-size: 13px; font-weight: 700; font-family: system-ui;">${glyph}</span>
    </div>`;
  return L.divIcon({ html, className: "map-pin", iconSize: [30, 30], iconAnchor: [15, 30], popupAnchor: [0, -28] });
}

function DisasterMapPage() {
  const [data, setData] = useState(null);
  const [layer, setLayer] = useState("all");

  useEffect(() => {
    let cancelled = false;
    getMapData().then((res) => {
      if (!cancelled) setData(res);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const markers = useMemo(() => {
    if (!data) return [];
    const list = [];

    if (layer === "all" || layer === "incidents") {
      data.incidents.forEach((i) =>
        list.push({
          key: `incident-${i.id}`,
          lat: i.latitude,
          lng: i.longitude,
          icon: pinIcon(TONE_COLOR[severityTone(i.severity)], "!"),
          render: () => (
            <>
              <div className="map-popup__head">
                <h4>{i.type} Incident</h4>
                <StatusBadge tone={statusTone(i.status)} pulse={shouldPulse(i.status)}>
                  {i.status}
                </StatusBadge>
              </div>
              <p>{i.description}</p>
              <div className="map-popup__meta">
                <span><MapPin size={12} /> {i.location}</span>
                <span><Clock size={12} /> {timeAgo(i.reportedAt)}</span>
              </div>
              <StatusBadge tone={severityTone(i.severity)}>{i.severity}</StatusBadge>
            </>
          ),
        })
      );
    }

    if (layer === "all" || layer === "hospitals") {
      data.hospitals.forEach((h) =>
        list.push({
          key: `hospital-${h.id}`,
          lat: h.latitude,
          lng: h.longitude,
          icon: pinIcon(TONE_COLOR.info, "H"),
          render: () => (
            <>
              <div className="map-popup__head">
                <h4>{h.name}</h4>
                <StatusBadge tone={statusTone(h.status)}>{h.status}</StatusBadge>
              </div>
              <div className="map-popup__meta">
                <span><MapPin size={12} /> {h.location}</span>
              </div>
              <div className="map-popup__stats">
                <span>{h.availableBeds} beds free</span>
                <span>{h.icuBeds} ICU</span>
              </div>
            </>
          ),
        })
      );
    }

    if (layer === "all" || layer === "shelters") {
      data.shelters.forEach((s) =>
        list.push({
          key: `shelter-${s.id}`,
          lat: s.latitude,
          lng: s.longitude,
          icon: pinIcon(TONE_COLOR.safe, "S"),
          render: () => (
            <>
              <div className="map-popup__head">
                <h4>{s.name}</h4>
              </div>
              <div className="map-popup__meta">
                <span><MapPin size={12} /> {s.location}</span>
              </div>
              <div className="map-popup__stats">
                <span>{s.capacity - s.occupied} spaces free</span>
                <span>{s.occupied}/{s.capacity} occupied</span>
              </div>
            </>
          ),
        })
      );
    }

    if (layer === "all" || layer === "rescueTeams") {
      data.rescueTeams.forEach((r) =>
        list.push({
          key: `rescue-${r.id}`,
          lat: r.latitude,
          lng: r.longitude,
          icon: pinIcon("#1c3b6b", "R"),
          render: () => (
            <>
              <div className="map-popup__head">
                <h4>{r.name}</h4>
                <StatusBadge tone="info">{r.status}</StatusBadge>
              </div>
              <div className="map-popup__meta">
                <span><MapPin size={12} /> {r.location}</span>
                <span><Users size={12} /> {r.membersCount} members</span>
              </div>
            </>
          ),
        })
      );
    }

    if (layer === "all" || layer === "volunteers") {
      data.volunteers.forEach((v) =>
        list.push({
          key: `volunteer-${v.id}`,
          lat: v.latitude,
          lng: v.longitude,
          icon: pinIcon("#8a5cf6", "V"),
          render: () => (
            <>
              <div className="map-popup__head">
                <h4>{v.name}</h4>
              </div>
              <div className="map-popup__meta">
                <span><MapPin size={12} /> {v.location}</span>
                <span><Users size={12} /> {v.availableCount} available</span>
              </div>
            </>
          ),
        })
      );
    }

    return list;
  }, [data, layer]);

  if (!data) return <LoadingSpinner label="Loading district map…" />;

  return (
    <div className="disaster-map">
      <div className="disaster-map__controls">
        {LAYERS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`disaster-map__filter ${layer === id ? "disaster-map__filter--active" : ""}`}
            onClick={() => setLayer(id)}
          >
            {Icon && <Icon size={14} />}
            {label}
          </button>
        ))}
      </div>

      <MapContainer center={DISTRICT_CENTER} zoom={12} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((m) => (
          <Marker key={m.key} position={[m.lat, m.lng]} icon={m.icon}>
            <Popup>
              <div className="map-popup">{m.render()}</div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="disaster-map__legend">
        <span><i style={{ background: TONE_COLOR.critical }} /> Critical / High severity</span>
        <span><i style={{ background: TONE_COLOR.warning }} /> Medium severity</span>
        <span><i style={{ background: TONE_COLOR.info }} /> Hospital</span>
        <span><i style={{ background: TONE_COLOR.safe }} /> Shelter</span>
        <span><i style={{ background: "#1c3b6b" }} /> Rescue team</span>
        <span><i style={{ background: "#8a5cf6" }} /> Volunteers</span>
      </div>
    </div>
  );
}

export default DisasterMapPage;
