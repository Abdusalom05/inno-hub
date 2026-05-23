import type { ReactElement } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/types/api";

type ProtectedRouteProps = {
  children: ReactElement;
  requiredRole?: UserRole;
};

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole === "ADMIN") {
    const hasAdminAccess = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
    if (!hasAdminAccess) {
      console.warn(`[Auth] Access denied. User role '${user.role}' does not meet requiredRole 'ADMIN'`);
      return <Navigate to="/dashboard" replace />;
    }
  } else if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;

