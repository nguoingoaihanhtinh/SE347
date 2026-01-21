import { create } from "zustand";
import { projects } from "../apis/project";
import type { IColumn, CreateColumnProjectParams, UpdateColumnProjectParams } from "../types/project";
import { extractErrorMessage } from "../types/api";

interface ColumnState {
  columns: IColumn[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchColumns: (projectId: string) => Promise<void>;
  createColumn: (projectId: string, data: CreateColumnProjectParams) => Promise<IColumn>;
  updateColumn: (projectId: string, columnId: string, data: UpdateColumnProjectParams) => Promise<void>;
  deleteColumn: (projectId: string, columnId: string) => Promise<void>;
  reorderColumns: (projectId: string, columnOrders: { columnId: string; order: number }[]) => Promise<void>;
  clearColumns: () => void;
}

// Utility function để chuẩn hóa response từ backend
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalizeColumnResponse = (responseData: any): IColumn | null => {
  if (!responseData) return null;

  // Ưu tiên field `data` (định dạng chuẩn)
  if (responseData.data) {
    return responseData.data;
  }

  // Fallback sang field `column` (định dạng backend hiện tại)
  if (responseData.column) {
    return responseData.column;
  }

  // Fallback cho các trường hợp khác
  if (typeof responseData === "object" && !Array.isArray(responseData) && Object.keys(responseData).length > 0) {
    return responseData;
  }

  return null;
};

export const useColumnStore = create<ColumnState>((set) => ({
  columns: [],
  isLoading: false,
  error: null,

  fetchColumns: async (projectId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await projects.getColumns(projectId);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch columns");
      }

      // Chuẩn hóa response
      const columnsData = Array.isArray(response.data.data) ? response.data.data : response.data.data?.data || [];

      if (!columnsData || columnsData.length === 0) {
        set({ columns: [], isLoading: false });
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const normalizedColumns = columnsData.map((col: any) => {
        // Chuẩn hóa từng column
        if (col.column) return col.column;
        if (col.data) return col.data;
        return col;
      });

      set({
        columns: normalizedColumns,
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

      // Chuẩn hóa response cho createColumn
      const normalizedColumn = normalizeColumnResponse(response.data);

      if (!normalizedColumn) {
        throw new Error("Missing column data in response");
      }

      set((state) => ({
        columns: [...state.columns, normalizedColumn],
        isLoading: false,
      }));

      return normalizedColumn;
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

      // Chuẩn hóa response cho updateColumn
      const updatedColumn = normalizeColumnResponse(response.data);

      if (!updatedColumn) {
        throw new Error("Missing updated column data");
      }

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

  reorderColumns: async (projectId, columnOrders) => {
    try {
      set({ isLoading: true, error: null });

      // Chuẩn bị dữ liệu gửi đi
      const reorderData = {
        columnOrders: columnOrders.map((order) => ({
          columnId: order.columnId,
          order: order.order,
        })),
      };

      const response = await projects.reorderColumns(projectId, reorderData);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to reorder columns");
      }

      // Cập nhật state với thứ tự mới
      set((state) => {
        // Tạo bản sao của columns với thứ tự mới
        const newColumns = [...state.columns];

        // Cập nhật order cho từng column
        columnOrders.forEach((order) => {
          const index = newColumns.findIndex((col) => col.id === order.columnId);
          if (index !== -1) {
            newColumns[index] = { ...newColumns[index], order: order.order };
          }
        });

        // Sắp xếp theo thứ tự mới
        newColumns.sort((a, b) => a.order - b.order);

        return {
          columns: newColumns,
          isLoading: false,
        };
      });
    } catch (error) {
      const msg = extractErrorMessage(error);
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  clearColumns: () => set({ columns: [] }),
}));
