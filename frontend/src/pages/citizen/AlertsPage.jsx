import { useEffect, useState } from "react";
import { Bell, Siren, Ambulance, Home as HomeIcon, Building2, Settings, Clock, CheckCheck } from "lucide-react";
import StatusBadge from "../../components/common/StatusBadge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import { getNotifications } from "../../services/notificationService";
import { NOTIFICATION_CATEGORIES } from "../../data/mockNotifications";
import { severityTone, shouldPulse } from "../../utils/severity";
import { timeAgo } from "../../utils/formatTime";
import "./AlertsPage.css";

const CATEGORY_ICON = {
  "Disaster Alert": Siren,
  "Rescue Update": Ambulance,
  Shelter: HomeIcon,
  Hospital: Building2,
  System: Settings,
};

const FILTERS = ["All", "Unread", ...NOTIFICATION_CATEGORIES];

function AlertsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    let cancelled = false;
    getNotifications().then((res) => {
      if (cancelled) return;
      setNotifications(res);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <LoadingSpinner label="Loading alerts…" />;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = notifications.filter((n) => {
    if (filter === "All") return true;
    if (filter === "Unread") return !n.read;
    return n.category === filter;
  });

  function markAsRead(id) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  function markAllAsRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  return (
    <div className="alerts-page">
      <div className="alerts-page__head">
        <div>
          <h1>Alerts &amp; Notifications</h1>
          <p>{unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "You're all caught up."}</p>
        </div>
        {unreadCount > 0 && (
          <button className="alerts-page__mark-all" onClick={markAllAsRead}>
            <CheckCheck size={15} /> Mark all as read
          </button>
        )}
      </div>

      <div className="alerts-page__filters">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`alerts-page__filter ${filter === f ? "alerts-page__filter--active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Bell} title="Nothing here" message="No notifications match this filter." />
      ) : (
        <div className="alerts-page__list">
          {filtered.map((n) => (
            <NotificationCard key={n.id} notification={n} onRead={markAsRead} />
          ))}
        </div>
      )}
    </div>
  );
}

function NotificationCard({ notification, onRead }) {
  const { id, category, title, message, severity, read, createdAt } = notification;
  const Icon = CATEGORY_ICON[category] || Bell;

  return (
    <article
      className={`notification-card ${read ? "" : "notification-card--unread"}`}
      onClick={() => !read && onRead(id)}
      role={read ? undefined : "button"}
    >
      <span className={`notification-card__icon notification-card__icon--${severityTone(severity)}`}>
        <Icon size={18} />
      </span>

      <div className="notification-card__body">
        <div className="notification-card__head">
          <h3>{title}</h3>
          <StatusBadge tone={severityTone(severity)} pulse={shouldPulse(severity)}>
            {severity}
          </StatusBadge>
        </div>
        <p>{message}</p>
        <div className="notification-card__meta">
          <span className="notification-card__category">{category}</span>
          <span><Clock size={12} /> {timeAgo(createdAt)}</span>
        </div>
      </div>

      {!read && <span className="notification-card__dot" aria-label="Unread" />}
    </article>
  );
}

export default AlertsPage;
