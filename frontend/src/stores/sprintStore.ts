// src/stores/sprintStore.ts
import { create } from "zustand";
import { sprints } from "../apis/sprint";
import type { ISprint } from "../types/sprint";
import { extractErrorMessage } from "../types/api";

interface SprintState {
  sprints: ISprint[];
  currentSprint: ISprint | null;
  isLoading: boolean;
  error: string | null;

  fetchSprintsByProject: (projectId: string) => Promise<void>;
  fetchSprint: (projectId: string, sprintId: string) => Promise<void>;
  createSprint: (projectId: string, data: Omit<ISprint, "id" | "createdAt" | "updatedAt">) => Promise<ISprint>;
  updateSprint: (projectId: string, sprintId: string, data: Partial<ISprint>) => Promise<void>;
  deleteSprint: (projectId: string, sprintId: string) => Promise<void>;
  setCurrentSprint: (sprint: ISprint | null) => void;
  clearSprints: () => void;
}

export const useSprintStore = create<SprintState>((set) => ({
  sprints: [],
  currentSprint: null,
  isLoading: false,
  error: null,

  fetchSprintsByProject: async (projectId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await sprints.list(projectId);

      if (response.data.success && Array.isArray(response.data.data)) {
        set({
          sprints: response.data.data,
          isLoading: false,
        });
      } else {
        set({ sprints: [], isLoading: false });
        console.warn("Invalid sprint data format");
        return;
      }
    } catch (error) {
      const msg = extractErrorMessage(error);
      set({ error: msg, isLoading: false, sprints: [] });
      // Don't throw - let component handle the error gracefully
      console.error("Failed to fetch sprints:", msg);
    }
  },

  fetchSprint: async (projectId, sprintId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await sprints.getById(projectId, sprintId);
      if (response.data.success && response.data.data) {
        set({ currentSprint: response.data.data, isLoading: false });
      } else {
        throw new Error(response.data.message || "Failed to fetch sprint");
      }
    } catch (error) {
      const msg = extractErrorMessage(error);
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  createSprint: async (projectId, sprintData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await sprints.create(projectId, { ...sprintData, projectId });

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to create sprint");
      }
      if (!response.data.data) {
        throw new Error("Missing sprint data in response");
      }

      const newSprint = response.data.data;

      set((state) => ({
        sprints: [...state.sprints, newSprint],
        isLoading: false,
      }));

      return newSprint;
    } catch (error) {
      const msg = extractErrorMessage(error);
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  updateSprint: async (projectId, sprintId, sprintData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await sprints.update(projectId, sprintId, sprintData);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to update sprint");
      }

      let updatedSprint: ISprint;

      if (response.data.data) {
        updatedSprint = response.data.data;
      } else {
        const fetchResponse = await sprints.getById(projectId, sprintId);
        if (!fetchResponse.data.success || !fetchResponse.data.data) {
          throw new Error("Failed to fetch updated sprint");
        }
        updatedSprint = fetchResponse.data.data;
      }

      set((state) => ({
        sprints: state.sprints.map((s) => (s.id === sprintId ? updatedSprint : s)),
        currentSprint: state.currentSprint?.id === sprintId ? updatedSprint : state.currentSprint,
        isLoading: false,
      }));
    } catch (error) {
      const msg = extractErrorMessage(error);
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  deleteSprint: async (projectId, sprintId) => {
    try {
      set({ isLoading: true, error: null });
      await sprints.delete(projectId, sprintId);

      set((state) => ({
        sprints: state.sprints.filter((s) => s.id !== sprintId),
        currentSprint: state.currentSprint?.id === sprintId ? null : state.currentSprint,
        isLoading: false,
      }));
    } catch (error) {
      const msg = extractErrorMessage(error);
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  setCurrentSprint: (sprint) => set({ currentSprint: sprint }),
  clearSprints: () => set({ sprints: [], currentSprint: null }),
}));
