import { useEffect, useState } from "react";
import { adminApi, type SystemStats } from "../../lib/api";
import { AxiosError } from "axios";

export default function AdminDashboard() {
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalProjects: 0,
    totalIssues: 0,
    activeIssues: 0,
    totalSprints: 0,
    activeSprints: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load dashboard stats on mount
    loadDashboardStats();
  }, []); // Run once on mount

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch system stats from admin endpoint
      const response = await adminApi.getStats();
      
      if (response.data?.success && response.data.data) {
        setStats(response.data.data);
        console.log("Dashboard Stats:", response.data.data);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      
      // Handle 401 Unauthorized - redirect to login (don't show error box)
      if (error?.response?.status === 401) {
        console.warn("Unauthorized access - redirecting to login");
        setLoading(false);
        // The API interceptor will handle the redirect, but we can do it here too
        window.location.href = "/login";
        return;
      }
      
      // Only show error box for real errors (500, network errors, etc.)
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to load dashboard statistics";
      setError(errorMessage);
      console.error("Error loading dashboard stats:", err);
      console.error("Error details:", {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
      });
    } finally {
      setLoading(false);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-800">
        <p className="font-medium text-lg">Error loading dashboard</p>
        <p className="text-sm mt-2">{error}</p>
        <button
          onClick={loadDashboardStats}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
          <p className="text-slate-600 mt-1">System overview and key metrics</p>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Users</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalUsers}</p>
              <p className="text-xs text-slate-500 mt-1">Registered accounts</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Projects Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Projects</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalProjects}</p>
              <p className="text-xs text-slate-500 mt-1">Active projects</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Active Issues Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Active Issues</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats.activeIssues || "--"}</p>
              <p className="text-xs text-slate-500 mt-1">In progress</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Active Sprints Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Active Sprints</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats.activeSprints || "--"}</p>
              <p className="text-xs text-slate-500 mt-1">Currently running</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">System Status</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-b-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-slate-700">API Server</span>
            </div>
            <span className="text-sm font-medium text-green-600">Online</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-b-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-slate-700">Database</span>
            </div>
            <span className="text-sm font-medium text-green-600">Connected</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-slate-700">Last Updated</span>
            </div>
            <span className="text-sm font-medium text-slate-600">{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
