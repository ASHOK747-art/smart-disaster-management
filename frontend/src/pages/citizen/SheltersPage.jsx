import { useEffect, useState } from "react";
import { Home as HomeIcon, MapPin, Navigation, Phone, Utensils, Droplet, Stethoscope } from "lucide-react";
import StatusBadge from "../../components/common/StatusBadge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import { getNearbyShelters } from "../../services/shelterService";
import "./SheltersPage.css";

function occupancyTone(pct) {
  if (pct >= 90) return "critical";
  if (pct >= 70) return "warning";
  return "safe";
}

function occupancyLabel(pct) {
  if (pct >= 90) return "NEARLY FULL";
  if (pct >= 70) return "FILLING UP";
  return "AVAILABLE";
}

function SheltersPage() {
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getNearbyShelters().then((res) => {
      if (cancelled) return;
      setShelters(res);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <LoadingSpinner label="Finding nearby shelters…" />;

  const totalAvailable = shelters.reduce((sum, s) => sum + (s.capacity - s.occupied), 0);

  return (
    <div className="shelters-page">
      <div className="shelters-page__head">
        <h1>Nearby Shelters</h1>
        <p>{totalAvailable} spaces available across {shelters.length} shelters near you.</p>
      </div>

      {shelters.length === 0 ? (
        <EmptyState
          icon={HomeIcon}
          title="No shelters found"
          message="There are no emergency shelters listed for your area yet."
        />
      ) : (
        <div className="shelters-page__list">
          {shelters.map((s) => (
            <ShelterCard key={s.id} shelter={s} />
          ))}
        </div>
      )}
    </div>
  );
}

function ShelterCard({ shelter }) {
  const { name, location, capacity, occupied, food, water, medical, contact, latitude, longitude } = shelter;
  const available = capacity - occupied;
  const pct = Math.round((occupied / capacity) * 100);
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

  return (
    <article className="shelter-card">
      <div className="shelter-card__icon">
        <HomeIcon size={20} />
      </div>

      <div className="shelter-card__body">
        <div className="shelter-card__head">
          <h3>{name}</h3>
          <StatusBadge tone={occupancyTone(pct)}>{occupancyLabel(pct)}</StatusBadge>
        </div>

        <span className="shelter-card__location">
          <MapPin size={13} /> {location}
        </span>

        <div className="shelter-card__occupancy">
          <div className="shelter-card__track">
            <span className="shelter-card__fill" style={{ width: `${pct}%` }} data-tone={occupancyTone(pct)} />
          </div>
          <span className="shelter-card__occupancy-label data-text">
            {occupied}/{capacity} occupied &middot; {available} spaces free
          </span>
        </div>

        <div className="shelter-card__facilities">
          <span className={food ? "" : "shelter-card__facility--off"}>
            <Utensils size={13} /> Food {food ? "available" : "unavailable"}
          </span>
          <span className={water ? "" : "shelter-card__facility--off"}>
            <Droplet size={13} /> Water {water ? "available" : "unavailable"}
          </span>
          <span className={medical ? "" : "shelter-card__facility--off"}>
            <Stethoscope size={13} /> Medical {medical ? "support" : "unavailable"}
          </span>
        </div>
      </div>

      <div className="shelter-card__actions">
        <a href={directionsUrl} target="_blank" rel="noreferrer" className="shelter-card__action">
          <Navigation size={14} /> Directions
        </a>
        <a href={`tel:${contact.replace(/\s+/g, "")}`} className="shelter-card__action">
          <Phone size={14} /> Call
        </a>
      </div>
    </article>
  );
}

export default SheltersPage;
