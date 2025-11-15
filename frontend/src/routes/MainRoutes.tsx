import { BrowserRouter, Route, Routes, Outlet } from "react-router-dom";

import ThemeProvider from "../providers/ThemeProvider";
import MainLayout from "../layouts/MainLayout";
import PageNotFound from "../layouts/PageNotFound";

// Component wrapper cho MainLayout
function LayoutWrapper() {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}

export default function MainRoutes() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} /> */}
          <Route path="/" element={<LayoutWrapper />}>
            {/* <Route index element={<Home />} /> */}
            <Route path="*" element={<PageNotFound />} />
          </Route>
          {/* Admin routes */}
          {/* <Route
            path="/admin"
            element={
              <AdminLayout>
                <Outlet />
              </AdminLayout>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="company" element={<CompanyProfile />} />
          </Route> */}
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
