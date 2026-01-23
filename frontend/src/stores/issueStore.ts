import { create } from "zustand";
import { issues } from "../apis/issue";
import { extractErrorMessage } from "../types/api";
import type { IIssue, CreateIssueParams, UpdateIssueParams } from "../types/issue";

interface IssueState {
  issues: IIssue[];
  currentIssue: IIssue | null;
  isLoading: boolean;
  error: string | null;
  selectedIssues: Record<string, IIssue[]>;
  selectedIssueId: string | null;
  fetchIssuesByProject: (projectId: string) => Promise<void>;
  fetchIssuesForBoard: (projectId: string) => Promise<{
    hasActiveSprint: boolean;
    mode: "kanban" | "scrum";
    activeSprintName?: string;
  }>;
  fetchIssuesByColumn: (columnId: string, projectId: string) => Promise<void>;
  fetchIssue: (projectId: string, issueId: string) => Promise<void>;
  createIssue: (data: CreateIssueParams) => Promise<IIssue>;
  updateIssue: (projectId: string, issueId: string, data: UpdateIssueParams) => Promise<void>;
  deleteIssue: (projectId: string, issueId: string) => Promise<void>;

  setCurrentIssue: (issue: IIssue | null) => void;
  clearIssues: () => void;
  openIssueDetail: (issueId: string) => void;
  closeIssueDetail: () => void;
  getIssueById: (issueId: string) => IIssue | undefined;

  setSelectedIssues: (sprintId: string, issues: IIssue[]) => void;
  toggleIssueSelection: (sprintId: string, issue: IIssue) => void;
  clearSelectedIssues: (sprintId: string) => void;
  getSelectedIssues: (sprintId: string) => IIssue[];
  isIssueSelected: (sprintId: string, issueId: string) => boolean;
}

export const useIssueStore = create<IssueState>()((set, get) => ({
  issues: [],
  currentIssue: null,
  isLoading: false,
  error: null,
  selectedIssues: {},
  selectedIssueId: null,

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
        set({ issues: [], isLoading: false });
        console.warn("Invalid issues data format");
        return;
      }
    } catch (error) {
      const msg = extractErrorMessage(error);
      set({ error: msg, isLoading: false, issues: [] });
      // Don't throw - let component handle the error gracefully
      console.error("Failed to fetch issues:", msg);
    }
  },

  fetchIssuesForBoard: async (projectId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await issues.board(projectId, { page: 1, limit: 50 });
      const payload = response.data as {
        success: boolean;
        data: IIssue[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          total_pages: number;
        };
        meta?: {
          mode: "kanban" | "scrum";
          hasActiveSprint: boolean;
          activeSprintId?: string;
          activeSprintName?: string;
        };
      };

      if (payload.success && Array.isArray(payload.data)) {
        set({
          issues: payload.data,
          isLoading: false,
        });
      } else {
        throw new Error("Invalid issues data format");
      }

      const meta = payload.meta || {
        hasActiveSprint: true,
        mode: "kanban" as const,
      };

      return {
        hasActiveSprint: meta.hasActiveSprint,
        mode: meta.mode,
        activeSprintName: meta.activeSprintName,
      };
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
      if (response.data.success) {
        const issuesData = Array.isArray(response.data.data) ? response.data.data : response.data.data?.data || [];
        set({
          issues: issuesData,
          isLoading: false,
        });
      } else {
        set({ issues: [], isLoading: false });
        console.warn("Failed to fetch issues:", response.data.message);
        return;
      }
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      set({ error: errorMessage, isLoading: false, issues: [] });
      // Don't throw - let component handle the error gracefully
      console.error("Failed to fetch issues by column:", errorMessage);
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
      
      // Backend returns { success: true, issue } (not wrapped in data property)
      // Axios wraps it in response.data, so response.data = { success: true, issue }
      const newIssue = response.data.issue || response.data.data;
      
      if (response.data.success && newIssue) {
        // Normalize date fields to ensure they're valid ISO strings
        const normalizeDate = (date: string | null | undefined): string | null => {
          if (!date) return null;
          try {
            const d = new Date(date);
            return isNaN(d.getTime()) ? null : d.toISOString();
          } catch {
            return null;
          }
        };

        // Ensure the issue has all required fields with defaults
        const normalizedIssue: IIssue = {
          ...newIssue,
          id: newIssue.id || newIssue._id || "",
          createdAt: normalizeDate(newIssue.createdAt) || new Date().toISOString(),
          updatedAt: normalizeDate(newIssue.updatedAt) || new Date().toISOString(),
          attachments: newIssue.attachments || [],
          dueDateFrom: normalizeDate(newIssue.dueDateFrom),
          dueDateTo: normalizeDate(newIssue.dueDateTo),
          completedAt: normalizeDate(newIssue.completedAt),
        };
        
        set((state) => ({
          issues: [...state.issues, normalizedIssue],
          isLoading: false,
        }));
        return normalizedIssue;
      } else {
        // Log the actual response for debugging
        console.error("Create issue response:", JSON.stringify(response.data, null, 2));
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

      if (response.data.success) {
        // Lấy issue data từ response hoặc fallback về issueData nếu backend không trả về data
        const updatedData = response.data.data || issueData;

        set((state) => ({
          issues: state.issues.map((i) =>
            i.id === issueId ? { ...i, ...updatedData, updatedAt: new Date().toISOString() } : i,
          ),
          currentIssue:
            state.currentIssue?.id === issueId
              ? { ...state.currentIssue, ...updatedData, updatedAt: new Date().toISOString() }
              : state.currentIssue,
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
  openIssueDetail: (issueId) => set({ selectedIssueId: issueId }),
  closeIssueDetail: () => set({ selectedIssueId: null }),
  getIssueById: (issueId) => {
    const { issues } = get();
    return issues.find((issue) => issue.id === issueId);
  },
  setSelectedIssues: (sprintId: string, issues: IIssue[]) => {
    set((state) => {
      const newSelectedIssues = { ...state.selectedIssues };
      newSelectedIssues[sprintId] = issues;
      return { selectedIssues: newSelectedIssues };
    });
  },
  toggleIssueSelection: (sprintId: string, issue: IIssue) => {
    set((state) => {
      const currentIssues = state.selectedIssues[sprintId] || [];
      const issueIndex = currentIssues.findIndex((i) => i.id === issue.id);
      let newIssues = [];
      if (issueIndex === -1) {
        newIssues = [...currentIssues, issue];
      } else {
        newIssues = currentIssues.filter((i) => i.id !== issue.id);
      }
      const newSelectedIssues = { ...state.selectedIssues };
      newSelectedIssues[sprintId] = newIssues;
      return { selectedIssues: newSelectedIssues };
    });
  },
  clearSelectedIssues: (sprintId: string) => {
    set((state) => {
      const newSelectedIssues = { ...state.selectedIssues };
      delete newSelectedIssues[sprintId];
      return { selectedIssues: newSelectedIssues };
    });
  },
  getSelectedIssues: (sprintId: string) => {
    return get().selectedIssues[sprintId] || [];
  },
  isIssueSelected: (sprintId: string, issueId: string) => {
    const selectedIssues = get().selectedIssues[sprintId] || [];
    return selectedIssues.some((issue) => issue.id === issueId);
  },
}));
