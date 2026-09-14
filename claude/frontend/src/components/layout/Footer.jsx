import { Link } from "react-router-dom";
import { ShieldAlert, Phone } from "lucide-react";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__col footer__brand">
          <div className="footer__brand-row">
            <ShieldAlert size={20} />
            <span>Suraksha</span>
          </div>
          <p>
            A district-level platform connecting citizens, rescue teams, hospitals and
            shelters through AI-assisted risk prediction and coordinated response.
          </p>
        </div>

        <div className="footer__col">
          <h4>Platform</h4>
          <Link to="/about">About</Link>
          <Link to="/#features">Features</Link>
          <Link to="/emergency-info">Emergency Information</Link>
        </div>

        <div className="footer__col">
          <h4>Legal</h4>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
        </div>

        <div className="footer__col">
          <h4>Emergency Numbers</h4>
          <p className="footer__emergency">
            <Phone size={14} /> National Emergency: <span className="data-text">112</span>
          </p>
          <p className="footer__emergency">
            <Phone size={14} /> Disaster Helpline: <span className="data-text">108</span>
          </p>
        </div>
      </div>

      <div className="container footer__bottom">
        <span>© {new Date().getFullYear()} Suraksha. Academic prototype — not for live emergency use.</span>
      </div>
    </footer>
  );
}

export default Footer;
