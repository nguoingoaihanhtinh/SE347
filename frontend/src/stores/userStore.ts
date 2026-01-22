import { create } from "zustand";
import { users } from "../apis/user";
import { extractErrorMessage } from "../types/api";

interface UserState {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  users: Record<string, any>;
  isLoading: boolean;
  error: string | null;
  fetchUserById: (userId: string) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: {},
  isLoading: false,
  error: null,

  fetchUserById: async (userId: string) => {
    if (!userId) return;

    const { users: existingUsers } = get();
    if (existingUsers[userId]) return; // Đã có data

    try {
      set({ isLoading: true, error: null });
      const response = await users.getById(userId);

      if (response.data.success && response.data.data) {
        set((state) => ({
          users: {
            ...state.users,
            [userId]: response.data.data,
          },
          isLoading: false,
        }));
      } else {
        throw new Error(response.data.message || "Failed to fetch user");
      }
    } catch (error) {
      const msg = extractErrorMessage(error);
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },
}));
