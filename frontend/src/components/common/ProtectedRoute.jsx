import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import LoadingSpinner from "./LoadingSpinner";
import { DASHBOARD_ROUTE_BY_ROLE } from "../../data/roles";

export default function ProtectedRoute({ allowedRoles }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner label="Verifying session…" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    const fallback = DASHBOARD_ROUTE_BY_ROLE[user?.role] || "/";
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}

