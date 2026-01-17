// src/routes/MainRoutes.tsx
import { BrowserRouter, Route, Routes, Outlet } from "react-router-dom";
import ThemeProvider from "../providers/ThemeProvider";
import PageNotFound from "../layouts/PageNotFound";
import AdminLayout from "../layouts/AdminLayout";
import DefaultLayout from "../layouts/DefaultLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminRoute from "./AdminRoute";
import ProjectLayoutWrapper from "../components/ProjectLayoutWrapper";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ProjectsPage from "../pages/ProjectsPage";
import BoardPage from "../pages/BoardPage";
import ProfilePage from "../pages/ProfilePage";
import UserManagementPage from "../pages/admin/UserManagementPage";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminProjectPage from "../pages/admin/AdminProjectPage";
import BacklogPage from "../pages/BacklogPage";

// Wrappers
function DefaultLayoutWrapper() {
  return (
    <DefaultLayout title="Project Manager">
      <Outlet />
    </DefaultLayout>
  );
}

function AdminLayoutWrapper() {
  return (
    <AdminLayout title="Admin Panel">
      <Outlet />
    </AdminLayout>
  );
}

// Admin Dashboard Placeholder (DEPRECATED - Now using real AdminDashboard component)
function AdminDashboardPlaceholder() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Admin Dashboard</h2>
        <p className="text-slate-600 mt-1">System overview and statistics</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stats Cards */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Users</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">--</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Projects</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">--</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Active Issues</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">--</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="font-medium">Admin Dashboard Coming Soon</p>
        </div>
        <p className="text-sm mt-1">This page will display system statistics, analytics, and monitoring tools.</p>
      </div>
    </div>
  );
}

export default function MainRoutes() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes - No Layout */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Protected Routes - Default Layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DefaultLayoutWrapper />
              </ProtectedRoute>
            }
          >
            <Route index element={<ProjectsPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="profile" element={<ProfilePage />} />

            {/* Project Board - Nested in Project Layout */}
            <Route path="projects/:projectId" element={<ProjectLayoutWrapper />}>
              <Route path="board" element={<BacklogPage />} />
            </Route>

            <Route path="*" element={<PageNotFound />} />
          </Route>

          {/* Admin Routes - Protected by AdminRoute (RBAC) */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayoutWrapper />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagementPage />} />
            <Route path="projects" element={<AdminProjectPage />} />
            <Route path="settings" element={<div className="text-slate-600">System Settings (Coming Soon)</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
