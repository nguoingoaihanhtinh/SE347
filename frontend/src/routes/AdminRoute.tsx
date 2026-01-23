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
      // Check admin role
      if (user.role !== "admin" && user.role !== "super_admin") {
        return (
          <div className="min-h-screen flex items-center justify-center bg-slate-900">
            <div className="max-w-md w-full bg-slate-800 rounded-lg shadow-xl p-8 text-center">
              <div className="mb-6">
                <div className="mx-auto h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center">
                  <svg
                    className="h-8 w-8 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">403 - Access Forbidden</h1>
              <p className="text-slate-400 mb-6">
                You do not have administrator privileges to access this area.
              </p>
              <button
                onClick={() => (window.location.href = "/")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-md transition"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        );
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
