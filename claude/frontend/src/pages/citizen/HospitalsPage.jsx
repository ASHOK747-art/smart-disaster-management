import { useEffect, useState } from "react";
import { Building2, MapPin, BedDouble, Navigation, Phone } from "lucide-react";
import StatusBadge from "../../components/common/StatusBadge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import { getNearbyHospitals } from "../../services/hospitalService";
import { statusTone } from "../../utils/severity";
import "./HospitalsPage.css";

const FILTERS = ["All", "OPEN", "LIMITED", "FULL"];

function HospitalsPage() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    let cancelled = false;
    getNearbyHospitals().then((res) => {
      if (cancelled) return;
      setHospitals(res);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <LoadingSpinner label="Finding nearby hospitals…" />;

  const sorted = [...hospitals].sort((a, b) => a.distanceKm - b.distanceKm);
  const filtered = filter === "All" ? sorted : sorted.filter((h) => h.status === filter);
  const openCount = hospitals.filter((h) => h.status === "OPEN").length;

  return (
    <div className="hospitals-page">
      <div className="hospitals-page__head">
        <h1>Nearby Hospitals</h1>
        <p>
          {openCount} of {hospitals.length} hospitals near you are currently accepting patients.
        </p>
      </div>

      <div className="hospitals-page__filters">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`hospitals-page__filter ${filter === f ? "hospitals-page__filter--active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No hospitals match this filter"
          message="Try a different status filter to see more hospitals."
        />
      ) : (
        <div className="hospitals-page__list">
          {filtered.map((h) => (
            <HospitalCard key={h.id} hospital={h} />
          ))}
        </div>
      )}
    </div>
  );
}

function HospitalCard({ hospital }) {
  const { name, location, status, availableBeds, icuBeds, distanceKm, latitude, longitude } = hospital;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

  return (
    <article className="hospital-card">
      <div className="hospital-card__icon">
        <Building2 size={20} />
      </div>

      <div className="hospital-card__body">
        <div className="hospital-card__head">
          <h3>{name}</h3>
          <StatusBadge tone={statusTone(status)}>{status}</StatusBadge>
        </div>

        <span className="hospital-card__location">
          <MapPin size={13} /> {location} · {distanceKm} km away
        </span>

        <div className="hospital-card__stats">
          <span>
            <BedDouble size={14} /> {availableBeds} beds available
          </span>
          <span>
            <BedDouble size={14} /> {icuBeds} ICU beds
          </span>
        </div>
      </div>

      <div className="hospital-card__actions">
        <a href={directionsUrl} target="_blank" rel="noreferrer" className="hospital-card__action">
          <Navigation size={14} /> Directions
        </a>
        <a href="tel:112" className="hospital-card__action">
          <Phone size={14} /> Call
        </a>
      </div>
    </article>
  );
}

export default HospitalsPage;
