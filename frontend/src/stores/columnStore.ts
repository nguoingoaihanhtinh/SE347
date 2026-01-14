// src/stores/columnStore.ts
import { create } from "zustand";
import { projects } from "../apis/project";
import type { IColumn, CreateColumnProjectParams, UpdateColumnProjectParams } from "../types/project";
import { extractErrorMessage } from "../types/api";

interface ColumnState {
  columns: IColumn[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchColumns: (projectId: string, withStats?: boolean) => Promise<void>;
  createColumn: (projectId: string, data: CreateColumnProjectParams) => Promise<IColumn>;
  updateColumn: (projectId: string, columnId: string, data: UpdateColumnProjectParams) => Promise<void>;
  deleteColumn: (projectId: string, columnId: string) => Promise<void>;
  reorderColumns: (projectId: string, columnIds: string[]) => Promise<void>;
  initializeDefaultColumns: (projectId: string) => Promise<IColumn[]>;
  clearColumns: () => void;
}

export const useColumnStore = create<ColumnState>((set) => ({
  columns: [],
  isLoading: false,
  error: null,

  fetchColumns: async (projectId, withStats = false) => {
    try {
      set({ isLoading: true, error: null });
      const response = await projects.getColumns(projectId, { withStats });

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch columns");
      }
      if (!response.data.data) {
        throw new Error("Missing columns data");
      }

      set({
        columns: Array.isArray(response.data.data) ? response.data.data : [],
        isLoading: false,
      });
    } catch (error) {
      const msg = extractErrorMessage(error);
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  createColumn: async (projectId, data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await projects.createColumn(projectId, data);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to create column");
      }
      if (!response.data.data) {
        throw new Error("Missing column data in response");
      }

      const newColumn = response.data.data;
      set((state) => ({
        columns: [...state.columns, newColumn],
        isLoading: false,
      }));
      return newColumn;
    } catch (error) {
      const msg = extractErrorMessage(error);
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  updateColumn: async (projectId, columnId, data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await projects.updateColumn(projectId, columnId, data);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to update column");
      }
      if (!response.data.data) {
        throw new Error("Missing updated column data");
      }

      const updatedColumn = response.data.data;
      set((state) => ({
        columns: state.columns.map((col) => (col.id === columnId ? updatedColumn : col)),
        isLoading: false,
      }));
    } catch (error) {
      const msg = extractErrorMessage(error);
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  deleteColumn: async (projectId, columnId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await projects.deleteColumn(projectId, columnId);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete column");
      }

      set((state) => ({
        columns: state.columns.filter((col) => col.id !== columnId),
        isLoading: false,
      }));
    } catch (error) {
      const msg = extractErrorMessage(error);
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  reorderColumns: async (projectId, columnIds) => {
    try {
      set({ isLoading: true, error: null });
      const response = await projects.reorderColumns(projectId, { columnIds });

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to reorder columns");
      }

      await useColumnStore.getState().fetchColumns(projectId);
    } catch (error) {
      const msg = extractErrorMessage(error);
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  initializeDefaultColumns: async (projectId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await projects.initializeColumns(projectId);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to initialize columns");
      }
      if (!Array.isArray(response.data.data)) {
        throw new Error("Invalid response format for initialized columns");
      }

      const newColumns = response.data.data;
      set({ columns: newColumns, isLoading: false });
      return newColumns;
    } catch (error) {
      const msg = extractErrorMessage(error);
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  clearColumns: () => set({ columns: [] }),
}));
