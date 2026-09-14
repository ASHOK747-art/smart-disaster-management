import { Construction } from "lucide-react";
import "./PlaceholderPage.css";

function PlaceholderPage({ title, phase }) {
  return (
    <div className="placeholder">
      <div className="placeholder__icon">
        <Construction size={22} />
      </div>
      <h1>{title}</h1>
      <p>This screen is scheduled for {phase}. Come back once that phase is built.</p>
    </div>
  );
}

export default PlaceholderPage;
