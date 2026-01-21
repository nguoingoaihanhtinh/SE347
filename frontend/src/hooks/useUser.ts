// src/hooks/useUser.ts
import { useEffect } from "react";
import { useUserStore } from "../stores/userStore";

export const useUserById = (userId?: string) => {
  const { users, fetchUserById, isLoading, error } = useUserStore();

  useEffect(() => {
    if (userId && !users[userId]) {
      fetchUserById(userId).catch(console.error);
    }
  }, [fetchUserById, userId, users]);

  return {
    user: userId ? users[userId] : undefined,
    isLoading,
    error,
  };
};
