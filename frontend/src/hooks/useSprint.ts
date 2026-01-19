// src/hooks/useSprint.ts
import { toast } from "react-toastify";
import { useSprintStore } from "../stores/sprintStore";
import type { ISprint } from "../types/sprint";

export const useCreateSprint = () => {
  const { createSprint, fetchSprintsByProject } = useSprintStore();

  const create = async (projectId: string, data: Omit<ISprint, "id" | "createdAt" | "updatedAt">) => {
    try {
      const newSprint = await createSprint(projectId, data);
      toast.success(`Sprint "${newSprint.name}" created successfully!`);

      await fetchSprintsByProject(projectId);
      return newSprint;
    } catch (error) {
      console.error("Create sprint error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create sprint");
      throw error;
    }
  };

  return { createSprint: create };
};

export const useUpdateSprint = () => {
  const { updateSprint, fetchSprintsByProject } = useSprintStore();

  const update = async (projectId: string, sprintId: string, data: Partial<ISprint>) => {
    try {
      await updateSprint(projectId, sprintId, data);
      toast.success("Sprint updated successfully!");

      await fetchSprintsByProject(projectId);
    } catch (error) {
      console.error("Update sprint error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update sprint");
      throw error;
    }
  };

  return { updateSprint: update };
};

export const useDeleteSprint = (onDeleteSuccess?: (deletedSprintId: string) => void) => {
  const { deleteSprint, fetchSprintsByProject } = useSprintStore();

  const deleteSpr = async (projectId: string, sprintId: string) => {
    try {
      await deleteSprint(projectId, sprintId);
      toast.success("Sprint deleted successfully!");

      await fetchSprintsByProject(projectId);
      onDeleteSuccess?.(sprintId);
    } catch (error) {
      console.error("Delete sprint error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete sprint");
      throw error;
    }
  };

  return { deleteSprint: deleteSpr };
};

export const useFetchSprints = () => {
  const { fetchSprintsByProject, sprints, isLoading, error } = useSprintStore();

  const fetchSprints = async (projectId: string) => {
    try {
      await fetchSprintsByProject(projectId);
    } catch (error) {
      console.error("Fetch sprints error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to fetch sprints");
      throw error;
    }
  };

  return { fetchSprints, sprints, isLoading, error };
};

export const useFetchSprint = () => {
  const { fetchSprint, currentSprint, isLoading, error } = useSprintStore();

  const fetch = async (projectId: string, sprintId: string) => {
    try {
      await fetchSprint(projectId, sprintId);
    } catch (error) {
      console.error("Fetch sprint error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to fetch sprint");
      throw error;
    }
  };

  return { fetchSprint: fetch, currentSprint, isLoading, error };
};
