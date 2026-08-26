import "./LoadingSpinner.css";

function LoadingSpinner({ label = "Loading…" }) {
  return (
    <div className="loading-spinner">
      <span className="loading-spinner__ring" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export default LoadingSpinner;
