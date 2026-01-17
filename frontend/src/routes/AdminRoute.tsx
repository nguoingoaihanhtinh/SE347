import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

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

  useEffect(() => {
    // SECURITY: Check token exists first
    const token = localStorage.getItem("token");
    if (!token) {
      // No token, don't even try to load user
      return;
    }
    loadUser();
  }, [loadUser]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authenticated but not admin/super_admin - show 403 Forbidden
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
