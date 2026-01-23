import { create } from "zustand";
import { extractErrorMessage } from "../types/api";
import { projects } from "../apis/project";
import type { IProject, CreateProjectParams } from "../types/project";
import type { Activity } from "../types";

interface ProjectState {
  projects: IProject[];
  currentProject: IProject | null;
  activities: Activity[];
  isLoading: boolean;
  error: string | null;

  fetchProjects: () => Promise<void>;
  fetchProject: (id: string) => Promise<void>;
  createProject: (data: CreateProjectParams) => Promise<IProject>;
  updateProject: (id: string, data: Partial<IProject>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  fetchActivities: (projectId: string) => Promise<void>;
  setCurrentProject: (project: IProject | null) => void;
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
      const response = await projects.list();

      // console.log("Projects API Response:", response);

      // Backend returns: { success: true, data: [...projects], pagination: {...} }
      // Axios wraps it: response.data = { success: true, data: [...projects], pagination: {...} }
      let projectsData: IProject[] = [];
      
      if (response.data) {
        const responseData = response.data;
        
        // Check if response.data.data is an array (standard format)
        if (responseData.success && Array.isArray(responseData.data)) {
          projectsData = responseData.data;
        }
        // Fallback: check if response.data is already an array
        else if (Array.isArray(responseData)) {
          projectsData = responseData;
        }
        // Fallback: check if response.data.data exists and is array
        else if (responseData.data && Array.isArray(responseData.data)) {
          projectsData = responseData.data;
        }
        else {
          // console.warn("Unexpected response format:", responseData);
          projectsData = [];
        }
      }

      // console.log("✅ Parsed projects:", projectsData.length, "projects");

      set({
        projects: projectsData,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const msg = extractErrorMessage(error);
      console.error("Error fetching projects:", error);
      set({ error: msg, isLoading: false, projects: [] });
      // Don't throw - just set error state so UI can show error message
    }
  },

  fetchProject: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const response = await projects.getById(id);
      if (response.data.success && response.data.data) {
        set({ currentProject: response.data.data, isLoading: false });
      } else {
        throw new Error(response.data.message || "Failed to fetch project");
      }
    } catch (error) {
      const msg = extractErrorMessage(error);
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  createProject: async (projectData) => {
    try {
      // console.log("🔵 [projectStore] createProject called with:", projectData);
      set({ isLoading: true, error: null });
      
      // console.log("🔵 [projectStore] Calling projects.create API...");
      const response = await projects.create(projectData);
      // console.log("🔵 [projectStore] API Response received:", response);

      if (!response.data.success) {
        console.error("❌ [projectStore] API returned success: false", response.data);
        throw new Error(response.data.message || "Failed to create project");
      }
      if (!response.data.data) {
        console.error("❌ [projectStore] Missing project data in response", response.data);
        throw new Error("Missing project data in response");
      }

      const newProject = response.data.data;
      // console.log("✅ [projectStore] Project created successfully:", newProject);
      set((state) => ({
        projects: [...state.projects, newProject],
        isLoading: false,
      }));
      return newProject;
    } catch (error) {
      console.error("❌ [projectStore] Error in createProject:", error);
      const msg = extractErrorMessage(error);
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  updateProject: async (id, projectData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await projects.update(id, projectData);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to update project");
      }
      if (!response.data.data) {
        throw new Error("Missing updated project data");
      }

      const updatedProject = response.data.data;
      set((state) => ({
        projects: state.projects.map((p) => (p.id === id ? updatedProject : p)),
        currentProject: state.currentProject?.id === id ? updatedProject : state.currentProject,
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
      await projects.delete(id);
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        currentProject: state.currentProject?.id === id ? null : state.currentProject,
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
      set({ isLoading: true, error: null });
      const response = await projects.getActivities(projectId);
      if (response.data.success && Array.isArray(response.data.data)) {
        set({ activities: response.data.data, isLoading: false });
      } else {
        set({ activities: [], isLoading: false });
      }
    } catch (error) {
      console.error("Failed to fetch activities:", extractErrorMessage(error));
      set({ activities: [], isLoading: false });
    }
  },

  setCurrentProject: (project) => set({ currentProject: project }),
}));
