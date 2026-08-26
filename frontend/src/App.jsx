import { Routes, Route } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import LandingPage from "./pages/public/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import PlaceholderPage from "./components/common/PlaceholderPage";

function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<PlaceholderPage title="About" phase="Phase 1 polish" />} />
        <Route
          path="/emergency-info"
          element={<PlaceholderPage title="Emergency Information" phase="Phase 2" />}
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Linked from the landing page hero; built out in Phase 2 */}
        <Route
          path="/report-emergency"
          element={<PlaceholderPage title="Report an Emergency" phase="Phase 2" />}
        />
        <Route
          path="/disaster-map"
          element={<PlaceholderPage title="Disaster Map" phase="Phase 2" />}
        />

        {/* Role dashboards — redirected to after login/register, built in later phases */}
        <Route path="/citizen/dashboard" element={<PlaceholderPage title="Citizen Dashboard" phase="Phase 2" />} />
        <Route path="/rescue/dashboard" element={<PlaceholderPage title="Rescue Team Dashboard" phase="Phase 3" />} />
        <Route path="/volunteer/dashboard" element={<PlaceholderPage title="Volunteer Dashboard" phase="Phase 3" />} />
        <Route path="/hospital/dashboard" element={<PlaceholderPage title="Hospital Dashboard" phase="Phase 3" />} />
        <Route path="/admin/dashboard" element={<PlaceholderPage title="Admin Dashboard" phase="Phase 4" />} />

        <Route path="*" element={<PlaceholderPage title="Page not found" phase="a future phase" />} />
      </Route>
    </Routes>
  );
}

export default App;
