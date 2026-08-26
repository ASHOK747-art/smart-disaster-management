import { Link } from "react-router-dom";
import {
  Siren,
  Map as MapIcon,
  BrainCircuit,
  Users,
  Building2,
  Home as HomeIcon,
  Radio,
  ClipboardList,
  Ambulance,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import Button from "../../components/common/Button";
import "./LandingPage.css";

const FEATURES = [
  {
    icon: BrainCircuit,
    title: "AI Risk Prediction",
    text: "Rainfall, water level, wind speed and historical incident data are combined into a live risk score for every zone.",
  },
  {
    icon: Siren,
    title: "Emergency Reporting",
    text: "Citizens report an incident in under a minute with GPS location, photos, and severity — no account friction in a crisis.",
  },
  {
    icon: MapIcon,
    title: "GIS Mapping",
    text: "One live map layers incidents, hospitals, shelters and rescue teams so responders see the whole district at a glance.",
  },
  {
    icon: Ambulance,
    title: "Rescue Coordination",
    text: "Incidents route to the nearest available rescue team, with status tracked from assigned through resolved.",
  },
  {
    icon: Building2,
    title: "Hospital Management",
    text: "Hospitals publish real-time bed and capacity data so incoming patients are directed where they can be treated.",
  },
  {
    icon: HomeIcon,
    title: "Shelter Management",
    text: "Shelter occupancy, food, water and medical support are tracked live, keeping displaced residents accounted for.",
  },
];

const STEPS = [
  { icon: Radio, title: "Detect", text: "Sensor, weather and historical data are continuously scored for disaster risk." },
  { icon: ClipboardList, title: "Report", text: "Citizens or systems file an incident with location, photos and severity." },
  { icon: Users, title: "Coordinate", text: "Rescue teams, hospitals and shelters are matched to the incident automatically." },
  { icon: CheckCircle2, title: "Respond", text: "Status is tracked end-to-end, from dispatch through resolution." },
];

function LandingPage() {
  return (
    <>
      {/* ---------------- HERO ---------------- */}
      <section className="hero">
        <div className="hero__contours" aria-hidden="true">
          <svg viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice">
            <g fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="1.5">
              <path d="M -50 620 C 250 560, 350 500, 300 400 C 250 300, 450 260, 600 320 C 750 380, 900 340, 950 250 C 1000 160, 1150 140, 1250 180" />
              <path d="M -50 560 C 220 500, 320 460, 280 380 C 240 300, 430 270, 580 320 C 730 370, 870 330, 920 250 C 970 170, 1120 150, 1250 190" />
              <path d="M -50 500 C 190 450, 290 420, 260 360 C 230 300, 410 280, 560 320 C 710 360, 840 320, 890 250 C 940 180, 1090 160, 1250 200" />
              <path d="M -50 440 C 160 400, 260 380, 240 340 C 220 300, 390 290, 540 320 C 690 350, 810 310, 860 250 C 910 190, 1060 170, 1250 210" />
            </g>
          </svg>
        </div>

        <div className="container hero__inner">
          <div className="hero__copy">
            <span className="hero__eyebrow">District Emergency Response Network</span>
            <h1>
              Smart Disaster Management.
              <br />
              Faster Response. <span className="hero__accent">Safer Communities.</span>
            </h1>
            <p>
              Suraksha combines AI risk prediction, GIS mapping, and citizen reporting with
              live coordination between rescue teams, hospitals, and shelters — so a report
              becomes a response in minutes, not hours.
            </p>
            <div className="hero__actions">
              <Button as={Link} to="/report-emergency" variant="critical" size="lg" icon={Siren}>
                Report an Emergency
              </Button>
              <Button as={Link} to="/disaster-map" variant="outline" size="lg" icon={ArrowRight} iconPosition="right">
                View Disaster Alerts
              </Button>
            </div>
          </div>

          <div className="hero__panel" role="img" aria-label="Live district risk overview, demo data">
            <div className="hero__panel-head">
              <span>LIVE DISTRICT OVERVIEW</span>
              <span className="hero__panel-dot" />
            </div>
            <div className="hero__panel-risk">
              <span className="hero__panel-risk-label">Overall Risk — Chennai District</span>
              <span className="hero__panel-risk-value data-text">HIGH · 74%</span>
            </div>
            <ul className="hero__panel-list">
              <li><span>Active Incidents</span><strong className="data-text">12</strong></li>
              <li><span>Rescue Teams Deployed</span><strong className="data-text">7</strong></li>
              <li><span>Shelters Open</span><strong className="data-text">5</strong></li>
              <li><span>Hospitals On Standby</span><strong className="data-text">9</strong></li>
            </ul>
          </div>
        </div>
      </section>

      {/* ---------------- FEATURES ---------------- */}
      <section className="section" id="features">
        <div className="container">
          <span className="section__eyebrow">Platform Capabilities</span>
          <h2 className="section__title">One system, every responder</h2>
          <div className="feature-grid">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <div className="feature-card" key={title}>
                <div className="feature-card__icon">
                  <Icon size={22} strokeWidth={2} />
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- HOW IT WORKS ---------------- */}
      <section className="section section--muted">
        <div className="container">
          <span className="section__eyebrow">Workflow</span>
          <h2 className="section__title">How it works</h2>
          <div className="steps">
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <div className="steps__item" key={title}>
                <div className="steps__marker">
                  <span className="steps__index data-text">0{i + 1}</span>
                  <Icon size={20} />
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
                {i < STEPS.length - 1 && <span className="steps__connector" aria-hidden="true" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- EMERGENCY CTA ---------------- */}
      <section className="emergency-cta">
        <div className="container emergency-cta__inner">
          <div>
            <h2>Are you in immediate danger?</h2>
            <p>Report your emergency now with your location — response teams are dispatched immediately.</p>
          </div>
          <Button as={Link} to="/report-emergency" variant="critical" size="lg" icon={Siren}>
            Report Emergency
          </Button>
        </div>
      </section>
    </>
  );
}

export default LandingPage;
