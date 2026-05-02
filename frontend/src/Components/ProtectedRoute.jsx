import { Navigate } from "react-router-dom";
import { getStoredToken } from "../api/auth";

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const token = getStoredToken();

  if (!token) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}
