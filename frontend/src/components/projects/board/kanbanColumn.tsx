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
import { useDroppable } from "@dnd-kit/core";

const SortableIssue = ({
  issue,
  isDraggingPreview,
  columnId,
}: {
  issue: IIssue | IIssueWithoutColumn;
  isDraggingPreview?: boolean;
  columnId?: string;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: issue.id,
  });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: isDragging ? "grabbing" : "grab",
    touchAction: "none",
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <IssueCard
        issue={issue}
        isDragging={isDragging}
        isDraggingPreview={isDraggingPreview}
        defaultColumnId={columnId}
      />
    </div>
  );
};

export const KanbanColumn = ({
  columns,
  column,
  projectId,
  isDragging = false,
  activeId = null,
}: {
  columns: IColumn[];
  column: IColumn & { issues?: IIssue[] };
  projectId: string;
  isDragging?: boolean;
  activeId?: string | null;
}) => {
  const {
    setNodeRef: setSortableRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging: isColumnDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
  });

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: column.id,
  });

  const { updateOrderColumn } = useUpdateProjectOrderColumn();
  const { deleteColumn } = useDeleteColumn();
  const { updateColumn } = useUpdateColumn();

  const [showRenameColumnModal, setShowRenameColumnModal] = useState(false);
  const [showDeleteColumnModal, setShowDeleteColumnModal] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const columnIssues = column.issues || [];
  const issueCount = columnIssues.length;

  const columnStyle: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isColumnDragging ? 0.8 : 1,
    cursor: isColumnDragging ? "grabbing" : "grab",
    border: isOver || (activeId === column.id && isColumnDragging) ? "2px solid #3b82f6" : "1px solid #e5e7eb",
    backgroundColor: isOver ? "#eff6ff" : "#f9fafb",
  };

  const handleMove = useCallback(
    (direction: "left" | "right") => {
      const currentIndex = columns.findIndex((c) => c.id === column.id);
      const targetIndex = direction === "left" ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= columns.length) return;

      const newColumns = [...columns];
      [newColumns[currentIndex], newColumns[targetIndex]] = [newColumns[targetIndex], newColumns[currentIndex]];

      const reordered = newColumns.map((col, i) => ({ ...col, order: i + 1 }));
      updateOrderColumn({
        projectId,
        columns: reordered.map((col) => ({ id: col.id, order: col.order })),
      });

      setPopoverOpen(false);
    },
    [columns, column.id, projectId, updateOrderColumn],
  );

  const handleRenameColumn = useCallback(
    (newName: string) => {
      updateColumn({ projectId, columnId: column.id, data: { name: newName } });
      setShowRenameColumnModal(false);
    },
    [column.id, projectId, updateColumn],
  );

  const handleDeleteColumn = () => {
    if (issueCount > 0) {
      alert("Không thể xóa column đang chứa issue. Vui lòng di chuyển chúng trước.");
      return;
    }
    deleteColumn({ projectId, columnId: column.id });
    setShowDeleteColumnModal(false);
  };

  const content: ReactNode = (
    <div className="w-48">
      <div onClick={() => handleMove("left")} className="cursor-pointer rounded px-3 py-2 hover:bg-gray-100">
        Move left
      </div>
      <div onClick={() => handleMove("right")} className="cursor-pointer rounded px-3 py-2 hover:bg-gray-100">
        Move right
      </div>
      <div
        onClick={() => {
          setShowRenameColumnModal(true);
          setPopoverOpen(false);
        }}
        className="cursor-pointer rounded px-3 py-2 hover:bg-gray-100"
      >
        Rename column
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
    <div
      ref={(node) => {
        setSortableRef(node);
        setDroppableRef(node);
      }}
      style={columnStyle}
      {...attributes}
      {...listeners}
      className={`mx-2 w-80 flex-shrink-0 rounded-lg p-3 shadow-sm border transition-all duration-200 ${
        isColumnDragging || isDragging ? "shadow-lg scale-[1.01]" : ""
      }`}
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between px-2 py-1">
        <div>
          <h2 className="text-base font-semibold text-gray-800">{column.name}</h2>
          <span className="text-xs text-gray-500">{issueCount} issues</span>
        </div>
        <Popover
          content={content}
          trigger="click"
          placement="bottomRight"
          open={popoverOpen}
          onOpenChange={setPopoverOpen}
        >
          <button className="p-1.5 rounded hover:bg-gray-200 transition">
            <LuEllipsisVertical className="text-gray-500" />
          </button>
        </Popover>
      </div>

      {/* Issues List */}
      <SortableContext items={columnIssues.map((i) => i.id)}>
        <div className="flex min-h-[150px] max-h-[70vh] flex-col gap-2 overflow-y-auto pb-4 pr-1">
          {issueCount > 0 ? (
            columnIssues.map((issue) => (
              <SortableIssue key={issue.id} issue={issue} isDraggingPreview={isDragging} columnId={column.id} />
            ))
          ) : (
            <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-100 text-sm text-gray-500 p-4">
              <p>
                Drag issues here or <span className="text-blue-600 cursor-pointer">create new issue</span>
              </p>
            </div>
          )}
        </div>
      </SortableContext>

      {/* Footer với tổng số issues */}
      <div className="mt-3 pt-2 border-t border-gray-200 text-sm font-medium text-gray-600 text-center">
        {issueCount} issues
      </div>

      {/* Modals */}
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
          hasIssues={issueCount > 0}
        />
      )}
    </div>
  );
};
