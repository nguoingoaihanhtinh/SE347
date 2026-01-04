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
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  clearError: () => void;
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

  register: async (firstName, lastName, email, password) => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await authApi.register({ firstName, lastName, email, password });
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
    set({ user: null, isAuthenticated: false });
  },

  loadUser: async () => {
    try {
      set({ isLoading: true });
      const { data } = await authApi.getCurrentUser();
      set({ user: data.data, isAuthenticated: true, isLoading: false });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
