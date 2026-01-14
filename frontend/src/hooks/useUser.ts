import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { IUser } from "../types/user";
import { users } from "../apis/user";

export function useUserById(userId: string) {
  const {
    data: userData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");
      const { data } = await users.getById(userId);
      return data;
    },
    enabled: !!userId,
  });
  return {
    user: userData?.data,
    isLoading,
    error,
  };
}

export function useListUser(keyword?: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["users", keyword],
    queryFn: async () => {
      const { data } = await users.list(keyword);
      return data;
    },
  });
  return {
    users: data?.data,
    isLoading,
    error,
  };
}

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await users.getMe();
      return data;
    },
  });
}

export function useChangePassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { user_id: string; old_password: string; new_password: string }) => {
      const response = await users.changePassword(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

export function useGetUserStats(id: string, isSprintId: boolean) {
  const { data, isLoading, isError, error, isSuccess, refetch } = useQuery({
    queryKey: ["userStats", id],
    queryFn: async () => {
      if (!id) throw new Error("Project/Sprint ID is required");
      const response = await users.getUserStats({
        id: id,
        is_sprintId: isSprintId,
      });
      return response.data;
    },
    enabled: !!id,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
  });

  return {
    stats: data,
    isLoading,
    isSuccess,
    isError,
    error,
    refetch,
  };
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: {
        user_id: string;
      } & Partial<IUser>
    ) => {
      const response = await users.updateUser(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}
