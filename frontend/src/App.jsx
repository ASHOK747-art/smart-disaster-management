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
import HospitalsPage from "./pages/citizen/HospitalsPage";
import SheltersPage from "./pages/citizen/SheltersPage";
import AlertsPage from "./pages/citizen/AlertsPage";
import ProfilePage from "./pages/citizen/ProfilePage";
import RescueDashboard from "./pages/rescue/RescueDashboard";
import VolunteerDashboard from "./pages/volunteer/VolunteerDashboard";
import HospitalDashboard from "./pages/hospital/HospitalDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import DisasterMapPage from "./pages/public/DisasterMapPage";
import PlaceholderPage from "./components/common/PlaceholderPage";
import ProtectedRoute from "./components/common/ProtectedRoute";

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
        <Route path="/disaster-map" element={<DisasterMapPage />} />
      </Route>

      {/* ---------------- Protected Dashboards ---------------- */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {/* Citizen routes */}
          <Route element={<ProtectedRoute allowedRoles={["citizen", "admin"]} />}>
            <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
            <Route path="/citizen/my-reports" element={<MyReportsPage />} />
            <Route path="/citizen/risk-prediction" element={<RiskPredictionPage />} />
            <Route path="/citizen/hospitals" element={<HospitalsPage />} />
            <Route path="/citizen/shelters" element={<SheltersPage />} />
            <Route path="/citizen/alerts" element={<AlertsPage />} />
            <Route path="/citizen/profile" element={<ProfilePage />} />
          </Route>

          {/* Rescue dashboard */}
          <Route element={<ProtectedRoute allowedRoles={["rescue", "admin"]} />}>
            <Route path="/rescue/dashboard" element={<RescueDashboard />} />
          </Route>

          {/* Volunteer dashboard */}
          <Route element={<ProtectedRoute allowedRoles={["volunteer", "admin"]} />}>
            <Route path="/volunteer/dashboard" element={<VolunteerDashboard />} />
          </Route>

          {/* Hospital dashboard */}
          <Route element={<ProtectedRoute allowedRoles={["hospital", "admin"]} />}>
            <Route path="/hospital/dashboard" element={<HospitalDashboard />} />
          </Route>

          {/* Admin dashboard */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<PlaceholderPage title="Page not found" phase="a future phase" />} />
    </Routes>
  );
}

export default App;
