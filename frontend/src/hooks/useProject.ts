// src/hooks/useProject.ts
import { projects } from "../apis/project";
import { toast } from "react-toastify";
import { useColumnStore } from "../stores/columnStore";

export const useUpdateProjectOrderColumn = () => {
  const { fetchColumns } = useColumnStore();

  const updateOrderColumn = async ({
    projectId,
    columns,
  }: {
    projectId: string;
    columns: { id: string; order: number }[];
  }) => {
    try {
      // ✅ CHUYỂN ĐỔI ĐỊNH DẠNG CHUẨN
      const columnOrders = columns.map((col) => ({
        columnId: col.id,
        order: col.order,
      }));

      // ✅ GỬI ĐÚNG CẤU TRÚC
      const response = await projects.reorderColumns(projectId, { columnOrders });

      if (response.data.success) {
        toast.success("Column order updated!");
        await fetchColumns(projectId);
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
  const { fetchColumns } = useColumnStore();

  const updateColumn = async ({
    projectId,
    columnId,
    data,
  }: {
    projectId: string;
    columnId: string;
    data: Partial<{ name: string; description: string | null; color: string | null }>;
  }) => {
    try {
      const response = await projects.updateColumn(projectId, columnId, data);
      if (response.data.success) {
        toast.success("Column updated!");
        await fetchColumns(projectId);
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
  const { fetchColumns } = useColumnStore();

  const deleteColumn = async ({ projectId, columnId }: { projectId: string; columnId: string }) => {
    try {
      const response = await projects.deleteColumn(projectId, columnId);
      if (response.data.success) {
        toast.success("Column deleted!");
        await fetchColumns(projectId);
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
