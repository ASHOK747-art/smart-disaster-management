import "./StatCard.css";

/**
 * StatCard — a single summary metric with icon, used across every dashboard.
 * tone tints the icon chip only, so it stays a data indicator, not decoration.
 */
function StatCard({ icon: Icon, label, value, tone = "neutral", onClick }) {
  const Component = onClick ? "button" : "div";
  return (
    <Component className={`stat-card ${onClick ? "stat-card--clickable" : ""}`} onClick={onClick}>
      <span className={`stat-card__icon stat-card__icon--${tone}`}>
        <Icon size={20} />
      </span>
      <div className="stat-card__body">
        <span className="stat-card__value data-text">{value}</span>
        <span className="stat-card__label">{label}</span>
      </div>
    </Component>
  );
}

export default StatCard;
