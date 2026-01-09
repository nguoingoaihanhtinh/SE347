// src/routes/MainRoutes.tsx
import { BrowserRouter, Route, Routes, Outlet } from "react-router-dom";
import ThemeProvider from "../providers/ThemeProvider";
import PageNotFound from "../layouts/PageNotFound";
import AdminLayout from "../layouts/AdminLayout";
import DefaultLayout from "../layouts/DefaultLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import ProjectLayoutWrapper from "../components/ProjectLayoutWrapper";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ProjectsPage from "../pages/ProjectsPage";
import BoardPage from "../pages/BoardPage";
import ProfilePage from "../pages/ProfilePage";

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
              <Route path="board" element={<BoardPage />} />
            </Route>

            <Route path="*" element={<PageNotFound />} />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayoutWrapper />
              </ProtectedRoute>
            }
          >
            <Route index element={<div>Admin Dashboard</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
