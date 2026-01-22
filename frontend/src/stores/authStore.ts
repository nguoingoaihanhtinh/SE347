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
    otp: string,
  ) => Promise<void>;

  logout: () => void;
  loadUser: () => Promise<void>;
  clearError: () => void;

  // ✅ dùng cho forgot-password / social-login
  setAuth: (user: User, token: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // ================= LOGIN =================
  login: async (email, password) => {
    try {
      set({ isLoading: true, error: null });

      const res = await authApi.login(email, password);

      // nếu backend trả token thì lưu
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const token = (res as any)?.data?.data?.token;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userFromLogin = (res as any)?.data?.data?.user;

      if (token) localStorage.setItem("token", token);
      if (userFromLogin) localStorage.setItem("user", JSON.stringify(userFromLogin));

      // fallback: gọi /me (cookie-based)
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
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null, isAuthenticated: false });
  },

  // ================= LOAD USER =================
  loadUser: async () => {
    try {
      set({ isLoading: true });

      // nếu không có token + cookie hết hạn → khỏi gọi API
      const token = localStorage.getItem("token");
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
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),

  // ================= SET AUTH (FORGOT PASSWORD, OAUTH...) =================
  setAuth: (user, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },
}));
