import { BrowserRouter, Route, Routes, Outlet } from "react-router-dom";

import ThemeProvider from "../providers/ThemeProvider";
import PageNotFound from "../layouts/PageNotFound";
import AdminLayout from "../layouts/AdminLayout";
import DefaultLayout from "../layouts/DefaultLayout";
import ProjectLayout from "../layouts/ProjectLayout";

// Inline sample pages (replace with real pages later)
const Home = () => <div>Home</div>;
const AdminDashboard = () => <div>Admin Dashboard</div>;
const ProjectBoard = () => <div>Project Board</div>;

// Wrappers
function DefaultLayoutWrapper() {
  return (
    <DefaultLayout title="SEJobs">
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

function ProjectLayoutWrapper() {
  return (
    <ProjectLayout
      projectName="Sample Project"
      projectCode="PRJ-001"
      breadcrumb={[{ label: "Projects", path: "/projects" }, { label: "Board" }]}
    >
      <Outlet />
    </ProjectLayout>
  );
}

export default function MainRoutes() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Public / Default layout */}
          <Route path="/" element={<DefaultLayoutWrapper />}>
            <Route index element={<Home />} />
            {/* Example nested project layout */}
            <Route path="projects/:id" element={<ProjectLayoutWrapper />}>
              <Route index element={<ProjectBoard />} />
            </Route>
            <Route path="*" element={<PageNotFound />} />
          </Route>

          {/* Admin layout */}
          <Route path="/admin" element={<AdminLayoutWrapper />}>
            <Route index element={<AdminDashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
