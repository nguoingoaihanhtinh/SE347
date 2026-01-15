// src/stores/issueStore.ts
import { create } from "zustand";
import { issues } from "../apis/issue";
import { extractErrorMessage } from "../types/api";
import type { IIssue, CreateIssueParams, UpdateIssueParams } from "../types/issue";

interface IssueState {
  issues: IIssue[];
  currentIssue: IIssue | null;
  isLoading: boolean;
  error: string | null;

  fetchIssuesByProject: (projectId: string) => Promise<void>;
  fetchIssuesByColumn: (columnId: string, projectId: string) => Promise<void>;
  fetchIssue: (projectId: string, issueId: string) => Promise<void>;
  createIssue: (data: CreateIssueParams) => Promise<IIssue>;
  updateIssue: (projectId: string, issueId: string, data: UpdateIssueParams) => Promise<void>;
  deleteIssue: (projectId: string, issueId: string) => Promise<void>;
  setCurrentIssue: (issue: IIssue | null) => void;
  clearIssues: () => void;
  openIssueDetail: (projectId: string, issueId: string) => Promise<void>;
}

export const useIssueStore = create<IssueState>()((set, get) => ({
  issues: [],
  currentIssue: null,
  isLoading: false,
  error: null,

  fetchIssuesByProject: async (projectId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await issues.list({ projectId, page: 1, limit: 50 });

      if (response.data.success && Array.isArray(response.data.data)) {
        set({
          issues: response.data.data,
          isLoading: false,
        });
      } else {
        throw new Error("Invalid issues data format");
      }
    } catch (error) {
      const msg = extractErrorMessage(error);
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },
  fetchIssuesByColumn: async (columnId, projectId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await issues.list({ projectId, columnId, page: 1, limit: 50 });
      if (response.data.success && response.data.data?.data) {
        set({
          issues: Array.isArray(response.data.data.data) ? response.data.data.data : [],
          isLoading: false,
        });
      } else {
        throw new Error(response.data.message || "Failed to fetch issues");
      }
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  fetchIssue: async (projectId, issueId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await issues.getById(projectId, issueId);
      if (response.data.success && response.data.data) {
        set({ currentIssue: response.data.data, isLoading: false });
      } else {
        throw new Error(response.data.message || "Failed to fetch issue");
      }
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  createIssue: async (issueData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await issues.create(issueData.projectId, issueData);
      if (response.data.success && response.data.data) {
        const newIssue = response.data.data;
        set((state) => ({
          issues: [...state.issues, newIssue],
          isLoading: false,
        }));
        return newIssue;
      } else {
        throw new Error(response.data.message || "Failed to create issue");
      }
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  updateIssue: async (projectId, issueId, issueData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await issues.update(projectId, issueId, issueData);
      if (response.data.success && response.data.data) {
        const updatedIssue = response.data.data;
        set((state) => ({
          issues: state.issues.map((i) => (i.id === issueId ? updatedIssue : i)),
          currentIssue: state.currentIssue?.id === issueId ? updatedIssue : state.currentIssue,
          isLoading: false,
        }));
      } else {
        throw new Error(response.data.message || "Failed to update issue");
      }
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  deleteIssue: async (projectId, issueId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await issues.delete(projectId, issueId);
      if (response.data.success) {
        set((state) => ({
          issues: state.issues.filter((i) => i.id !== issueId),
          currentIssue: state.currentIssue?.id === issueId ? null : state.currentIssue,
          isLoading: false,
        }));
      } else {
        throw new Error(response.data.message || "Failed to delete issue");
      }
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  setCurrentIssue: (issue) => set({ currentIssue: issue }),
  clearIssues: () => set({ issues: [], currentIssue: null }),

  openIssueDetail: async (projectId, issueId) => {
    try {
      await get().fetchIssue(projectId, issueId);
    } catch (error) {
      console.error("Failed to open issue detail:", error);
    }
  },
}));
