import { create } from "zustand";
import { projectApi } from "../lib/api";
import type { Project, Activity } from "../types";
import { extractErrorMessage } from "../types/api";

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  activities: Activity[];
  isLoading: boolean;
  error: string | null;

  fetchProjects: () => Promise<void>;
  fetchProject: (id: string) => Promise<void>;
  createProject: (data: Partial<Project>) => Promise<Project>;
  updateProject: (id: string, data: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  fetchActivities: (projectId: string) => Promise<void>;
  setCurrentProject: (project: Project | null) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  currentProject: null,
  activities: [],
  isLoading: false,
  error: null,

  fetchProjects: async () => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await projectApi.getAll();
      set({ projects: Array.isArray(data.data) ? data.data : [], isLoading: false });
    } catch (error) {
      set({ error: extractErrorMessage(error), isLoading: false });
    }
  },

  fetchProject: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await projectApi.getById(id);
      set({ currentProject: data.data, isLoading: false });
    } catch (error) {
      set({ error: extractErrorMessage(error), isLoading: false });
    }
  },

  createProject: async (projectData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await projectApi.create(projectData);
      const newProject = response.data.data;
      set((state) => ({
        projects: [...state.projects, newProject],
        isLoading: false,
      }));
      return newProject;
    } catch (error) {
      const msg = extractErrorMessage(error);
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  updateProject: async (id, projectData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await projectApi.update(id, projectData);
      const updatedProject = response.data.data;
      set((state) => ({
        projects: state.projects.map((p) => (p.id === id || p._id === id ? updatedProject : p)),
        currentProject:
          state.currentProject?.id === id || state.currentProject?._id === id ? updatedProject : state.currentProject,
        isLoading: false,
      }));
    } catch (error) {
      const msg = extractErrorMessage(error);
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  deleteProject: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await projectApi.delete(id);
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id && p._id !== id),
        currentProject:
          state.currentProject?.id === id || state.currentProject?._id === id ? null : state.currentProject,
        isLoading: false,
      }));
    } catch (error) {
      const msg = extractErrorMessage(error);
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  fetchActivities: async (projectId) => {
    try {
      const { data } = await projectApi.getActivities(projectId);
      set({ activities: Array.isArray(data.data) ? data.data : [] });
    } catch (error) {
      console.error("Failed to fetch activities:", extractErrorMessage(error));
    }
  },

  setCurrentProject: (project) => set({ currentProject: project }),
}));
