import { create } from "zustand";
import { sprintApi } from "../lib/api";
import type { Sprint } from "../types";
import { extractErrorMessage } from "../types/api";

interface SprintState {
  sprints: Sprint[];
  currentSprint: Sprint | null;
  isLoading: boolean;
  error: string | null;

  fetchSprintsByProject: (projectId: string) => Promise<void>;
  fetchSprint: (id: string) => Promise<void>;
  createSprint: (data: Partial<Sprint>) => Promise<Sprint>;
  updateSprint: (id: string, data: Partial<Sprint>) => Promise<void>;
  deleteSprint: (id: string) => Promise<void>;
  setCurrentSprint: (sprint: Sprint | null) => void;
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
      const { data } = await sprintApi.getByProject(projectId);
      set({ sprints: Array.isArray(data.data) ? data.data : [], isLoading: false });
    } catch (error) {
      set({ error: extractErrorMessage(error), isLoading: false });
    }
  },

  fetchSprint: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await sprintApi.getById(id);
      set({ currentSprint: data.data, isLoading: false });
    } catch (error) {
      set({ error: extractErrorMessage(error), isLoading: false });
    }
  },

  createSprint: async (sprintData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await sprintApi.create(sprintData);
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

  updateSprint: async (id, sprintData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await sprintApi.update(id, sprintData);
      const updatedSprint = response.data.data;
      set((state) => ({
        sprints: state.sprints.map((s) => (s.id === id || s._id === id ? updatedSprint : s)),
        currentSprint:
          state.currentSprint?.id === id || state.currentSprint?._id === id ? updatedSprint : state.currentSprint,
        isLoading: false,
      }));
    } catch (error) {
      const msg = extractErrorMessage(error);
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  deleteSprint: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await sprintApi.delete(id);
      set((state) => ({
        sprints: state.sprints.filter((s) => s.id !== id && s._id !== id),
        currentSprint: state.currentSprint?.id === id || state.currentSprint?._id === id ? null : state.currentSprint,
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
