import { Routes, Route } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import LandingPage from "./pages/public/LandingPage";
import ReportEmergencyPage from "./pages/public/ReportEmergencyPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import CitizenDashboard from "./pages/citizen/CitizenDashboard";
import MyReportsPage from "./pages/citizen/MyReportsPage";
import RiskPredictionPage from "./pages/citizen/RiskPredictionPage";
import PlaceholderPage from "./components/common/PlaceholderPage";

function App() {
  return (
    <Routes>
      {/* ---------------- Public routes ---------------- */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<PlaceholderPage title="About" phase="Phase 1 polish" />} />
        <Route
          path="/emergency-info"
          element={<PlaceholderPage title="Emergency Information" phase="Phase 2" />}
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Linked from the landing page hero and the citizen dashboard quick actions */}
        <Route path="/report-emergency" element={<ReportEmergencyPage />} />
        <Route
          path="/disaster-map"
          element={<PlaceholderPage title="Disaster Map" phase="Phase 2" />}
        />
      </Route>

      {/* ---------------- Citizen dashboard (built) ---------------- */}
      <Route element={<DashboardLayout />}>
        <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
        <Route path="/citizen/my-reports" element={<MyReportsPage />} />
        <Route path="/citizen/risk-prediction" element={<RiskPredictionPage />} />
        <Route path="/citizen/hospitals" element={<PlaceholderPage title="Hospitals" phase="Phase 2" />} />
        <Route path="/citizen/shelters" element={<PlaceholderPage title="Shelters" phase="Phase 2" />} />
        <Route path="/citizen/alerts" element={<PlaceholderPage title="Alerts" phase="Phase 2" />} />
        <Route path="/citizen/profile" element={<PlaceholderPage title="Profile" phase="Phase 2" />} />

        {/* Other role dashboards — built in later phases */}
        <Route path="/rescue/dashboard" element={<PlaceholderPage title="Rescue Team Dashboard" phase="Phase 3" />} />
        <Route path="/volunteer/dashboard" element={<PlaceholderPage title="Volunteer Dashboard" phase="Phase 3" />} />
        <Route path="/hospital/dashboard" element={<PlaceholderPage title="Hospital Dashboard" phase="Phase 3" />} />
        <Route path="/admin/dashboard" element={<PlaceholderPage title="Admin Dashboard" phase="Phase 4" />} />
      </Route>

      <Route path="*" element={<PlaceholderPage title="Page not found" phase="a future phase" />} />
    </Routes>
  );
}

export default App;
