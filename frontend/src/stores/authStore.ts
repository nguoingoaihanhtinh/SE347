import { create } from "zustand";
import { authApi } from "../lib/api";
import { memberApi } from "../apis/member";
import type { User } from "../types";
import { extractErrorMessage } from "../types/api";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
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
  setAuth: (user: User, token: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      const res = await authApi.login(email, password);
      const token = (res as any)?.data?.data?.token;
      const userFromLogin = (res as any)?.data?.data?.user;

      if (token) localStorage.setItem("token", token);
      if (userFromLogin) localStorage.setItem("user", JSON.stringify(userFromLogin));

      const { data } = await authApi.getCurrentUser();
      set({
        user: data.data,
        isAuthenticated: true,
        isLoading: false,
      });

      // Check pending invitation sau login (không throw error nếu fail)
      await handlePendingInvitation().catch((err) => {
        console.warn("Failed to handle pending invitation:", err);
      });
    } catch (error) {
      const msg = extractErrorMessage(error);
      set({ error: msg, isLoading: false, isAuthenticated: false });
      throw new Error(msg);
    }
  },

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

      const token = (res as any)?.data?.data?.token;
      const userFromRegister = (res as any)?.data?.data?.user;

      if (token) localStorage.setItem("token", token);
      if (userFromRegister) localStorage.setItem("user", JSON.stringify(userFromRegister));

      const { data } = await authApi.getCurrentUser();
      set({
        user: data.data,
        isAuthenticated: true,
        isLoading: false,
      });

      // Check pending invitation sau register (không throw error nếu fail)
      await handlePendingInvitation().catch((err) => {
        console.warn("Failed to handle pending invitation:", err);
      });
    } catch (error) {
      const msg = extractErrorMessage(error);
      set({ error: msg, isLoading: false, isAuthenticated: false });
      throw new Error(msg);
    }
  },

  logout: () => {
    authApi.logout().catch(console.error);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("pendingInvitation");
    localStorage.removeItem("pendingProjectId");
    set({ user: null, isAuthenticated: false });
  },

  loadUser: async () => {
    try {
      set({ isLoading: true });
      const token = localStorage.getItem("token");

      if (!token) {
        console.log("No token found in localStorage");
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      console.log("Token found, fetching current user...");
      const { data } = await authApi.getCurrentUser();

      console.log("User loaded successfully:", data.data);
      set({
        user: data.data,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to load user:", error);

      // CRITICAL FIX: Only clear auth if error is 401 (unauthorized)
      // Don't clear on network errors or other issues
      const errorMessage = extractErrorMessage(error);
      const isUnauthorized =
        errorMessage.includes("401") || errorMessage.includes("Unauthorized") || errorMessage.includes("Token expired");

      if (isUnauthorized) {
        console.log("Token invalid/expired, clearing auth");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        set({ user: null, isAuthenticated: false, isLoading: false });
      } else {
        console.warn("Non-auth error during loadUser, keeping auth state");
        // Keep existing auth state, just stop loading
        set({ isLoading: false });
      }
    }
  },

  clearError: () => set({ error: null }),

  setAuth: (user, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },
}));

async function handlePendingInvitation() {
  const pendingToken = localStorage.getItem("pendingInvitation");

  if (pendingToken) {
    try {
      console.log("DEBUG: Gửi accept invitation với token:", pendingToken);
      await memberApi.acceptInvitation(pendingToken);
      localStorage.removeItem("pendingInvitation");
      console.log("✅ Accept invitation thành công!");
    } catch (error) {
      console.error("❌ Accept invitation fail:", error);
      // Don't throw error, just log it
    }
  }
}
