import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { useAutoLogout } from "../hooks/useAutoLogout";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user, loadUser } = useAuthStore();
  const location = useLocation();

  // Auto-logout after 15 minutes of inactivity (only when authenticated)
  useAutoLogout();

  // CRITICAL: Check token in storage FIRST before any other logic
  // Check both localStorage (remember me) and sessionStorage (session only)
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  useEffect(() => {
    // Only load user if:
    // 1. Token exists
    // 2. User is not already loaded (to avoid unnecessary API calls after login)
    if (token && !user && !isLoading) {
      loadUser().catch((error) => {
        console.error("Failed to load user:", error);
      });
    }
  }, [loadUser, token, user, isLoading]);

  // CRITICAL LOGIC: If token exists in localStorage, DO NOT redirect to login
  // Show loading spinner only if we're actively loading AND don't have user yet
  if (token) {
    // If we have user data and authenticated, allow access immediately
    if (user && isAuthenticated) {
      return <>{children}</>;
    }
    
    // If loading and no user yet, show loading spinner
    if (isLoading && !user) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }
    
    // Token exists, not loading, but no user yet - allow access (optimistic)
    // loadUser() will update user in the background
    return <>{children}</>;
  }

  // No token in localStorage - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
