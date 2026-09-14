import "./StatusBadge.css";

/**
 * StatusBadge
 * Renders a severity/status pill with a pulsing dot for active-critical states.
 *
 * tone: "critical" | "warning" | "safe" | "info" | "neutral"
 * pulse: shows a live pulsing dot (use for ACTIVE/CRITICAL states only)
 */
function StatusBadge({ tone = "neutral", pulse = false, children }) {
  return (
    <span className={`status-badge status-badge--${tone}`}>
      <span className={`status-badge__dot ${pulse ? "status-badge__dot--pulse" : ""}`} />
      {children}
    </span>
  );
}

export default StatusBadge;
