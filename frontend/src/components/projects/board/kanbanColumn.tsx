// src/components/projects/board/kanbanColumn.tsx
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { Popover } from "antd";
import { type ReactNode, useCallback, useState } from "react";
import { LuEllipsisVertical } from "react-icons/lu";
import type { CSSProperties } from "react";
import { CSS } from "@dnd-kit/utilities";
import type { IIssue } from "../../../types/issue";
import IssueCard from "./issueCard";
import type { IColumn } from "../../../types/project";
import RenameColumnModal from "../modals/renameColumnModal";
import DeleteColumnModal from "../modals/deleteColumnModal";
import { useDeleteColumn, useUpdateColumn, useUpdateProjectOrderColumn } from "../../../hooks/useProject";

const SortableIssue = ({ issue }: { issue: IIssue }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: issue.id,
  });
  const isDragging = attributes["aria-pressed"];
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: isDragging ? "grabbing" : "default",
    touchAction: "none",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="cursor-grab">
      <IssueCard issue={issue} isDragging={isDragging} />
    </div>
  );
};

export const KanbanColumn = ({
  columns,
  column,
  projectId,
  setColumns,
}: {
  columns: IColumn[];
  column: IColumn;
  projectId: string;
  setColumns: React.Dispatch<React.SetStateAction<IColumn[]>>;
}) => {
  const { setNodeRef } = useSortable({
    id: column.id,
    data: { type: "Column", column },
  });

  const { updateOrderColumn } = useUpdateProjectOrderColumn();
  const [showRenameColumnModal, setShowRenameColumnModal] = useState(false);
  const [showDeleteColumnModal, setShowDeleteColumnModal] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const { deleteColumn } = useDeleteColumn((deletedColumnId) => {
    const newColumns = columns
      .filter((col) => col.id !== deletedColumnId)
      .map((col, index) => ({ ...col, order: index }));
    setColumns(newColumns);
  });

  const { updateColumn } = useUpdateColumn();

  const handleMove = useCallback(
    (direction: "left" | "right") => {
      const currentIndex = columns.findIndex((c) => c.id === column.id);
      const targetIndex = direction === "left" ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= columns.length) return;

      const newOrder = [...columns];
      [newOrder[currentIndex], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[currentIndex]];
      setColumns(newOrder.map((col, i) => ({ ...col, order: i })));

      updateOrderColumn({
        projectId,
        columns: newOrder.map((col, i) => ({ id: col.id, order: i + 1 })),
      });
      setPopoverOpen(false);
    },
    [columns, column.id, projectId, setColumns, updateOrderColumn]
  );

  const handleRenameColumn = useCallback(
    (newName: string) => {
      setColumns((cols) => cols.map((col) => (col.id === column.id ? { ...col, name: newName } : col)));
      setShowRenameColumnModal(false);
      // ✅ FIX LỖI: THÊM 'data' VÀO ĐÂY
      updateColumn({ projectId, columnId: column.id, data: { name: newName } });
    },
    [column.id, projectId, updateColumn, setColumns]
  );

  const handleDeleteColumn = () => {
    const hasIssues = Array.isArray(column.issues) && column.issues.length > 0;
    if (hasIssues) {
      alert("Cannot delete column with issues. Please move them first.");
      return;
    }
    deleteColumn({ projectId, columnId: column.id });
    setShowDeleteColumnModal(false);
  };

  const safeIssues = Array.isArray(column.issues) ? column.issues : [];

  const content: ReactNode = (
    <div className="w-48">
      <div onClick={() => handleMove("left")} className="cursor-pointer rounded px-3 py-2 hover:bg-gray-100">
        Move to left
      </div>
      <div onClick={() => handleMove("right")} className="cursor-pointer rounded px-3 py-2 hover:bg-gray-100">
        Move to right
      </div>
      <div
        onClick={() => {
          setShowRenameColumnModal(true);
          setPopoverOpen(false);
        }}
        className="cursor-pointer rounded px-3 py-2 hover:bg-gray-100"
      >
        Change column name
      </div>
      <div
        onClick={() => {
          setShowDeleteColumnModal(true);
          setPopoverOpen(false);
        }}
        className="cursor-pointer rounded px-3 py-2 hover:bg-gray-100 text-red-600"
      >
        Delete column
      </div>
    </div>
  );

  return (
    <div ref={setNodeRef} className="mx-2 w-80 flex-shrink-0 rounded bg-gray-100 p-2">
      <div className="mb-3 flex items-center justify-between p-2">
        <h2 className="text-base font-medium text-gray-700">{column.name}</h2>
        <Popover
          content={content}
          trigger="click"
          placement="bottomRight"
          open={popoverOpen}
          onOpenChange={setPopoverOpen}
        >
          <div className="cursor-pointer rounded p-1.5 hover:bg-gray-200">
            <LuEllipsisVertical className="text-gray-500" />
          </div>
        </Popover>
      </div>

      <SortableContext items={safeIssues.map((issue) => issue.id)}>
        <div className="flex max-h-[600px] min-h-40 flex-col gap-2 overflow-auto pb-2">
          {safeIssues.map((issue) => (
            <SortableIssue key={issue.id} issue={issue} />
          ))}
        </div>
      </SortableContext>

      {showRenameColumnModal && (
        <RenameColumnModal
          currentName={column.name}
          onClose={() => setShowRenameColumnModal(false)}
          onSubmit={handleRenameColumn}
        />
      )}

      {showDeleteColumnModal && (
        <DeleteColumnModal
          onClose={() => setShowDeleteColumnModal(false)}
          onSubmit={handleDeleteColumn}
          hasIssues={safeIssues.length > 0}
        />
      )}
    </div>
  );
};
