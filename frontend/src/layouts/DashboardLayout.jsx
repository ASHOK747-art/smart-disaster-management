import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import { NAV_BY_ROLE, ROLE_LABEL } from "../data/navigation";
import "./DashboardLayout.css";

function roleFromPath(pathname) {
  const first = pathname.split("/").filter(Boolean)[0];
  return NAV_BY_ROLE[first] ? first : "citizen";
}

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const role = roleFromPath(location.pathname);

  return (
    <div className="dashboard-shell">
      <Sidebar items={NAV_BY_ROLE[role]} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="dashboard-shell__main">
        <Topbar roleLabel={`${ROLE_LABEL[role]} Dashboard`} onMenuClick={() => setSidebarOpen(true)} />
        <main className="dashboard-shell__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
