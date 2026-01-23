import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { useAutoLogout } from "../hooks/useAutoLogout";

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * AdminRoute - Role-Based Access Control Protector
 * 
 * Ensures only authenticated users with 'admin' or 'super_admin' roles can access admin routes.
 * 
 * Flow:
 * 1. Check authentication (same as ProtectedRoute)
 * 2. Check if user.role is 'admin' or 'super_admin'
 * 3. If not authorized, redirect to /dashboard (or show 403)
 * 4. If authorized, render children
 */
export default function AdminRoute({ children }: AdminRouteProps) {
  const { user, isAuthenticated, isLoading, loadUser } = useAuthStore();
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
    // If we have user data and authenticated, check admin role immediately
    if (user && isAuthenticated) {
      // Check admin role - if not admin, redirect to user dashboard
      if (user.role !== "admin" && user.role !== "super_admin") {
        // Automatically redirect non-admin users to user dashboard
        return <Navigate to="/dashboard" replace />;
      }
      // Authorized admin - render children
      return <>{children}</>;
    }
    
    // If loading and no user yet, show loading spinner
    if (isLoading && !user) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-400">Verifying admin access...</p>
          </div>
        </div>
      );
    }
    
    // Token exists, not loading, but no user yet - show loading (wait for user data)
    if (!user) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-400">Loading user data...</p>
          </div>
        </div>
      );
    }
    
    // Fallback: If we have user but not authenticated yet, wait for authentication
    // This should rarely happen, but handle it gracefully
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // No token in localStorage - redirect to login
  return <Navigate to="/login" state={{ from: location }} replace />;
}
