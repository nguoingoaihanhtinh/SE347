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
