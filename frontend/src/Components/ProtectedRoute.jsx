import { Navigate } from "react-router-dom";
import { getStoredToken, getStoredUser } from "../api/auth";
import { markAdminForbidden, isAdminUser } from "../api/guards";

export default function ProtectedRoute({
  children,
  requireAdmin = false,
  userFeedOnly = false,
}) {
  const token = getStoredToken();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !getStoredUser()?.is_admin) {
    markAdminForbidden();
    return <Navigate to="/" replace />;
  }

  if (userFeedOnly && isAdminUser()) {
    return <Navigate to="/settings" replace />;
  }

  return children;
}
