// src/hooks/useProject.ts
import { projects } from "../apis/project";
import { data } from "react-router-dom";
import { toast } from "react-toastify";

// Hook để cập nhật thứ tự column
export const useUpdateProjectOrderColumn = () => {
  const updateOrderColumn = async ({
    projectId,
    columns,
  }: {
    projectId: string;
    columns: { id: string; order: number }[];
  }) => {
    try {
      const response = await projects.reorderColumns(projectId, { columnIds: columns.map((c) => c.id) });
      if (response.data.success) {
        toast.success("Column order updated!");
      } else {
        throw new Error(response.data.message || "Failed to update column order");
      }
    } catch (error) {
      console.error("Update column order error:", error);
      toast.error("Failed to update column order");
      throw error;
    }
  };

  return { updateOrderColumn };
};

export const useUpdateColumn = () => {
  const updateColumn = async ({
    projectId,
    columnId,
  }: {
    projectId: string;
    columnId: string;
    data: Partial<{
      name: string;
      description: string | null;
      color: string | null;
    }>;
  }) => {
    try {
      const response = await projects.updateColumn(projectId, columnId, data);
      if (response.data.success) {
        toast.success("Column updated!");
      } else {
        throw new Error(response.data.message || "Failed to update column");
      }
    } catch (error) {
      console.error("Update column error:", error);
      toast.error("Failed to update column");
      throw error;
    }
  };

  return { updateColumn };
};

export const useDeleteColumn = (onDeleteSuccess?: (deletedColumnId: string) => void) => {
  const deleteColumn = async ({ projectId, columnId }: { projectId: string; columnId: string }) => {
    try {
      const response = await projects.deleteColumn(projectId, columnId);
      if (response.data.success) {
        toast.success("Column deleted!");
        onDeleteSuccess?.(columnId);
      } else {
        throw new Error(response.data.message || "Failed to delete column");
      }
    } catch (error) {
      console.error("Delete column error:", error);
      toast.error("Failed to delete column");
      throw error;
    }
  };

  return { deleteColumn };
};
