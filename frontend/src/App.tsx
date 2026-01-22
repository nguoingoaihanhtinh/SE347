import { useEffect } from "react";
import "./App.css";
import MainRoutes from "./routes/MainRoutes";
import { useAuthStore } from "./stores/authStore";

function App() {
  const { loadUser } = useAuthStore();

  // CRITICAL: Load user on app initialization (top-level)
  // This ensures token is verified with server on every page load/F5
  useEffect(() => {
    // Check both localStorage (remember me) and sessionStorage (session only)
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      // Only call loadUser if token exists
      // If loadUser fails with 401, it will clear storage automatically
      loadUser().catch((error) => {
        // Error is already handled in loadUser (401 clears storage)
        console.error("Failed to load user on app init:", error);
      });
    }
  }, [loadUser]);

  return <MainRoutes />;
}

export default App;
