// src/routes/MainRoutes.tsx
import { BrowserRouter, Route, Routes, Outlet, Navigate } from "react-router-dom";
import ThemeProvider from "../providers/ThemeProvider";
import PageNotFound from "../layouts/PageNotFound";
import AdminLayout from "../layouts/AdminLayout";
import UserLayout from "../layouts/UserLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminRoute from "./AdminRoute";
import ProjectLayout from "../layouts/ProjectLayout";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ProjectsPage from "../pages/ProjectsPage";
import ProfilePage from "../pages/ProfilePage";
import MyTasksPage from "../pages/MyTasksPage";
import ManagerDashboard from "../pages/ManagerDashboard";
import ProjectMembersPage from "../pages/ProjectMembersPage";
import ProjectSettingsPage from "../pages/ProjectSettingsPage";
import UserManagementPage from "../pages/admin/UserManagementPage";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminProjectPage from "../pages/admin/AdminProjectPage";
import BacklogPage from "../pages/BacklogPage";
import BoardPage from "@/pages/BoardPage";
import ProjectOverviewPage from "../pages/ProjectOverviewPage";

// Wrappers
function UserLayoutWrapper() {
  return (
    <UserLayout>
      <Outlet />
    </UserLayout>
  );
}

function AdminLayoutWrapper() {
  return (
    <AdminLayout>
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

          {/* Protected Routes - User Layout (Dashboard) */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <UserLayoutWrapper />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<ManagerDashboard />} />
            <Route path="project" element={<Navigate to="/projects" replace />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="my-tasks" element={<MyTasksPage />} />
            <Route path="profile" element={<ProfilePage />} />

            {/* Project Board - Nested in Project Layout */}
            <Route path="project/:projectId" element={<ProjectLayout />}>
              <Route index element={<Navigate to="board" replace />} />
              <Route path="overview" element={<ProjectOverviewPage />} />
              <Route path="board" element={<BoardPage />} />
              <Route path="backlog" element={<BacklogPage />} />
              <Route path="members" element={<ProjectMembersPage />} />
              <Route path="settings" element={<ProjectSettingsPage />} />
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
