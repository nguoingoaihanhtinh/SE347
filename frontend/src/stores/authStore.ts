import { create } from "zustand";
import { authApi } from "../lib/api";
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
    otp: string
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
      const { data } = await authApi.login(email, password);
      set({
        user: data.data.user,
        isAuthenticated: true,
        isLoading: false,
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
      const { data } = await authApi.register({ firstName, lastName, email, password, confirmPassword, otp });
      set({
        user: data.data.user,
        isAuthenticated: true,
        isLoading: false,
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
    set({ user: null, isAuthenticated: false });
  },

  loadUser: async () => {
    try {
      set({ isLoading: true });

      // SECURITY: Check token exists before calling API
      const token = localStorage.getItem("token");
      if (!token) {
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      const { data } = await authApi.getCurrentUser();
      set({ user: data.data, isAuthenticated: true, isLoading: false });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // API call failed (token invalid/expired)
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),

  setAuth: (user, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },
}));
