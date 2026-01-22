// src/components/projects/board/kanbanColumn.tsx
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { Popover } from "antd";
import { type ReactNode, useCallback, useState } from "react";
import { LuEllipsisVertical } from "react-icons/lu";
import type { CSSProperties } from "react";
import { CSS } from "@dnd-kit/utilities";
import type { IIssue, IIssueWithoutColumn } from "../../../types/issue";
import IssueCard from "./issueCard";
import type { IColumn } from "../../../types/project";
import RenameColumnModal from "../modals/renameColumnModal";
import DeleteColumnModal from "../modals/deleteColumnModal";
import { useDeleteColumn, useUpdateColumn, useUpdateProjectOrderColumn } from "../../../hooks/useProject";

const SortableIssue = ({ issue, projectId, columnId }: { issue: IIssueWithoutColumn; projectId: string; columnId: string }) => {
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

  const normalizedIssue: IIssue = { ...issue, columnId };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="cursor-grab">
      <IssueCard issue={normalizedIssue} projectId={projectId} isDragging={isDragging} />
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
    data: {
      type: "Column",
      column,
    },
  });

  const { updateOrderColumn } = useUpdateProjectOrderColumn();
  const [showRenameColumnModal, setShowRenameColumnModal] = useState(false);
  const [showDeleteColumnModal, setShowDeleteColumnModal] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const { updateColumn } = useUpdateColumn();
  const { deleteColumn } = useDeleteColumn((deletedColumnId) => {
    const newColumns = columns
      .filter((col) => col.id !== deletedColumnId)
      .map((col, index) => ({ ...col, order: index }));
    setColumns(newColumns);
  });

  const handleMove = useCallback(
    (direction: "left" | "right") => {
      const currentIndex = columns.findIndex((c) => c.id === column.id);
      const targetIndex = direction === "left" ? currentIndex - 1 : currentIndex + 1;

      if (targetIndex < 0 || targetIndex >= columns.length) return;

      const newColumns = [...columns];
      [newColumns[currentIndex], newColumns[targetIndex]] = [newColumns[targetIndex], newColumns[currentIndex]];
      const reordered = newColumns.map((col, index) => ({ ...col, order: index }));
      setColumns(reordered);

      updateOrderColumn({
        projectId,
        columns: reordered.map((col) => ({ id: col.id, order: col.order + 1 })),
      });
      setPopoverOpen(false);
    },
    [columns, column.id, projectId, setColumns, updateOrderColumn]
  );

  const handleRenameColumn = useCallback(
    (newName: string) => {
      const updatedColumns = columns.map((col) => (col.id === column.id ? { ...col, name: newName } : col));
      setColumns(updatedColumns);
      setShowRenameColumnModal(false);

      updateColumn({
        projectId,
        columnId: column.id,
        data: { name: newName },
      });
    },
    [columns, column.id, projectId, setColumns, updateColumn]
  );

  const handleDeleteColumn = () => {
    if (column.issues.length > 0) {
      alert("Cannot delete column with issues. Please move them first.");
      return;
    }
    deleteColumn({ projectId, columnId: column.id });
    setShowDeleteColumnModal(false);
  };

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

      <SortableContext items={column.issues.map((issue) => issue.id)}>
        <div className="flex max-h-[600px] min-h-40 flex-col gap-2 overflow-auto pb-2">
          {column.issues.map((issue) => (
            <SortableIssue key={issue.id} issue={issue} projectId={projectId} columnId={column.id} />
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
          hasIssues={column.issues.length > 0}
        />
      )}
    </div>
  );
};