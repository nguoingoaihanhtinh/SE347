import { create } from "zustand";
import type { Issue } from "../types";
import { issueApi } from "../lib/api";
import { extractErrorMessage } from "../types/api";

interface IssueState {
  issues: Issue[];
  currentIssue: Issue | null;
  isLoading: boolean;
  error: string | null;

  fetchIssuesByProject: (projectId: string) => Promise<void>;
  fetchIssuesByColumn: (columnId: string) => Promise<void>;
  fetchIssue: (id: string) => Promise<void>;
  createIssue: (data: Partial<Issue>) => Promise<Issue>;
  updateIssue: (id: string, data: Partial<Issue>) => Promise<void>;
  deleteIssue: (id: string) => Promise<void>;
  setCurrentIssue: (issue: Issue | null) => void;
  clearIssues: () => void;
}

export const useIssueStore = create<IssueState>((set) => ({
  issues: [],
  currentIssue: null,
  isLoading: false,
  error: null,

  fetchIssuesByProject: async (projectId) => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await issueApi.getByProject(projectId);
      // ✅ Đảm bảo luôn là mảng
      set({ issues: Array.isArray(data.data) ? data.data : [], isLoading: false });
    } catch (error) {
      set({ error: extractErrorMessage(error), isLoading: false });
    }
  },

  fetchIssuesByColumn: async (columnId) => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await issueApi.getByColumn(columnId);
      set({ issues: Array.isArray(data.data) ? data.data : [], isLoading: false });
    } catch (error) {
      set({ error: extractErrorMessage(error), isLoading: false });
    }
  },

  fetchIssue: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await issueApi.getById(id);
      set({ currentIssue: data.data, isLoading: false });
    } catch (error) {
      set({ error: extractErrorMessage(error), isLoading: false });
    }
  },

  createIssue: async (issueData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await issueApi.create(issueData);
      const newIssue = response.data.data;
      set((state) => ({
        issues: [...state.issues, newIssue],
        isLoading: false,
      }));
      return newIssue;
    } catch (error) {
      const msg = extractErrorMessage(error);
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  updateIssue: async (id, issueData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await issueApi.update(id, issueData);
      const updatedIssue = response.data.data;
      set((state) => ({
        issues: state.issues.map((i) => (i.id === id || i._id === id ? updatedIssue : i)),
        currentIssue:
          state.currentIssue?.id === id || state.currentIssue?._id === id ? updatedIssue : state.currentIssue,
        isLoading: false,
      }));
    } catch (error) {
      const msg = extractErrorMessage(error);
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  deleteIssue: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await issueApi.delete(id);
      set((state) => ({
        issues: state.issues.filter((i) => i.id !== id && i._id !== id),
        currentIssue: state.currentIssue?.id === id || state.currentIssue?._id === id ? null : state.currentIssue,
        isLoading: false,
      }));
    } catch (error) {
      const msg = extractErrorMessage(error);
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  setCurrentIssue: (issue) => set({ currentIssue: issue }),
  clearIssues: () => set({ issues: [], currentIssue: null }),
}));
