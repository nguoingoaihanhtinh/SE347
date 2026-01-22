import { create } from "zustand";
import { authApi } from "../lib/api";
import type { User } from "../types";
import { extractErrorMessage } from "../types/api";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  register: (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    confirmPassword: string,
    otp: string,
  ) => Promise<void>;

  logout: () => void;
  loadUser: () => Promise<void>;
  clearError: () => void;

  // ✅ dùng cho forgot-password / social-login
  setAuth: (user: User, token: string) => void;
}

// Helper function to get token from storage (checks both localStorage and sessionStorage)
const getTokenFromStorage = (): string | null => {
  if (typeof window === "undefined") return null;
  // Prioritize localStorage (remember me), then sessionStorage (session only)
  return localStorage.getItem("token") || sessionStorage.getItem("token");
};

// Helper function to get user from storage
const getUserFromStorage = (): User | null => {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

// Helper function to save to storage based on remember flag
const saveToStorage = (key: string, value: string, remember: boolean) => {
  if (remember) {
    localStorage.setItem(key, value);
    // Clear from sessionStorage if exists
    sessionStorage.removeItem(key);
  } else {
    sessionStorage.setItem(key, value);
    // Clear from localStorage if exists
    localStorage.removeItem(key);
  }
};

// Helper function to clear from both storages
const clearFromStorage = (key: string) => {
  localStorage.removeItem(key);
  sessionStorage.removeItem(key);
};

// Restore user from storage on store initialization (for F5 refresh)
// CRITICAL: This runs synchronously when the store is created
const getInitialState = () => {
  // Check if we're in a browser environment
  if (typeof window === "undefined") {
    return {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    };
  }

  const token = getTokenFromStorage();
  const user = getUserFromStorage();
  
  // If token exists, set isAuthenticated to true immediately (optimistic restore)
  // This prevents redirect to login on F5 refresh
  if (token) {
    return {
      user,
      isAuthenticated: true, // CRITICAL: Set to true if token exists
      isLoading: false,
      error: null,
    };
  }
  
  return {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  };
};

export const useAuthStore = create<AuthState>((set) => ({
  ...getInitialState(),

  // ================= LOGIN =================
  login: async (email, password, remember = false) => {
    try {
      set({ isLoading: true, error: null });

      const res = await authApi.login(email, password);

      // CRITICAL: Extract user from response IMMEDIATELY
      // Backend returns: { success: true, data: { user } }
      // Token is set in httpOnly cookie, NOT in response body
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const responseData = (res as any)?.data;
      console.log("🔍 Login Response Structure:", JSON.stringify(responseData, null, 2));
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userFromLogin = responseData?.data?.user;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const token = responseData?.data?.token; // May not exist - backend uses cookie-based auth

      // CRITICAL: Backend uses cookie-based auth (httpOnly cookie)
      // Token is automatically sent via cookies, we can't access it from JS
      // We save a flag to storage to track authentication state
      const storageFlag = token || "cookie-auth-flag";
      
      // Save token flag to appropriate storage based on remember me
      saveToStorage("token", storageFlag, remember);
      console.log(`✅ Login Success - Token Saved to ${remember ? "localStorage" : "sessionStorage"}:`, storageFlag.substring(0, 20) + "...");

      if (!userFromLogin) {
        console.error("❌ Login Failed - No user in response:", responseData);
        throw new Error("No user received from server");
      }

      // Save user to appropriate storage based on remember me
      saveToStorage("user", JSON.stringify(userFromLogin), remember);
      console.log(`✅ Login Success - User Saved to ${remember ? "localStorage" : "sessionStorage"}:`, userFromLogin.email);

      // CRITICAL: Update state IMMEDIATELY with token and user (synchronous)
      // This ensures isAuthenticated is true before any navigation logic
      set({
        user: userFromLogin || null,
        isAuthenticated: true, // Set to true immediately if token exists
        isLoading: false,
        error: null,
      });

      // Optional: Verify token with /me endpoint (runs in background)
      // If this fails, the error handler will catch it
      try {
        const { data } = await authApi.getCurrentUser();
        // Update with fresh user data from server
        set({
          user: data.data,
          isAuthenticated: true,
        });
        console.log("✅ Login Success - User verified from /me endpoint");
      } catch (verifyError) {
        // If /me fails but we have token, still consider user authenticated
        // The token might be valid but /me endpoint might have issues
        console.warn("⚠️ Login Warning - /me verification failed, but token is saved:", verifyError);
        // Keep the user from login response
      }
    } catch (error) {
      const msg = extractErrorMessage(error);
      console.error("❌ Login Failed:", msg);
      // Clear storage on error (both localStorage and sessionStorage)
      clearFromStorage("token");
      clearFromStorage("user");
      set({ error: msg, isLoading: false, isAuthenticated: false, user: null });
      throw new Error(msg);
    }
  },

  // ================= REGISTER =================
  register: async (firstName, lastName, email, password, confirmPassword, otp) => {
    try {
      set({ isLoading: true, error: null });

      const res = await authApi.register({
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        otp,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const token = (res as any)?.data?.data?.token;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userFromRegister = (res as any)?.data?.data?.user;

      if (token) localStorage.setItem("token", token);
      if (userFromRegister) localStorage.setItem("user", JSON.stringify(userFromRegister));

      const { data } = await authApi.getCurrentUser();

      set({
        user: data.data,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      const msg = extractErrorMessage(error);
      set({ error: msg, isLoading: false, isAuthenticated: false });
      throw new Error(msg);
    }
  },

  // ================= LOGOUT =================
  logout: () => {
    authApi.logout().catch(console.error);
    // CRITICAL: Clear from BOTH localStorage and sessionStorage
    // This ensures user is logged out even if they had "Remember Me" checked
    clearFromStorage("token");
    clearFromStorage("user");
    console.log("✅ Logout - Cleared all storage (localStorage + sessionStorage)");
    set({ user: null, isAuthenticated: false });
  },

  // ================= LOAD USER =================
  loadUser: async () => {
    try {
      set({ isLoading: true });

      // Check for token in both localStorage and sessionStorage
      const token = getTokenFromStorage();
      if (!token) {
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      const { data } = await authApi.getCurrentUser();

      set({
        user: data.data,
        isAuthenticated: true,
        isLoading: false,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Only logout if it's a 401 (unauthorized) - token expired or invalid
      // Don't logout on network errors or other errors (preserve session on F5)
      const apiError = error as { response?: { status?: number } };
      if (apiError?.response?.status === 401) {
        // Token expired or invalid - clear session from both storages
        clearFromStorage("token");
        clearFromStorage("user");
        set({ user: null, isAuthenticated: false, isLoading: false });
      } else {
        // Network error or other error - keep session, just set loading to false
        // User can still use the app if token is valid
        set({ isLoading: false });
      }
    }
  },

  clearError: () => set({ error: null }),

  // ================= SET AUTH (FORGOT PASSWORD, OAUTH...) =================
  setAuth: (user, token, remember = false) => {
    saveToStorage("token", token, remember);
    saveToStorage("user", JSON.stringify(user), remember);
    set({ user, isAuthenticated: true });
  },
}));
