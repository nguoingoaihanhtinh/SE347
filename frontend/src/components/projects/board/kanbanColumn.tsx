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
import CreateIssueModal from "../../modals/CreateIssueModal";
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

// Helper to compute header color classes based on column name (ClickUp-style)
const getHeaderColorClass = (name: string): string => {
  const normalized = name.trim().toLowerCase();

  if (normalized === "to do" || normalized === "todo") {
    return "bg-slate-200 text-slate-700";
  }

  if (normalized === "in progress") {
    return "bg-blue-500 text-white";
  }

  if (normalized === "review") {
    return "bg-orange-500 text-white";
  }

  if (normalized === "done" || normalized === "complete" || normalized === "completed") {
    return "bg-green-500 text-white";
  }

  return "bg-slate-300 text-slate-800";
};

// Helper to compute a very light background tint for the empty state area,
// matching the header color but much softer
const getEmptyStateBgClass = (name: string): string => {
  const normalized = name.trim().toLowerCase();

  if (normalized === "to do" || normalized === "todo") {
    return "bg-slate-100";
  }

  if (normalized === "in progress") {
    return "bg-blue-50";
  }

  if (normalized === "review") {
    return "bg-orange-50";
  }

  if (normalized === "done" || normalized === "complete" || normalized === "completed") {
    return "bg-emerald-50";
  }

  return "bg-slate-100";
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
  const [showCreateIssueModal, setShowCreateIssueModal] = useState(false);

  const columnIssues = column.issues || [];
  const issueCount = columnIssues.length;

  const columnStyle: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isColumnDragging ? 0.8 : 1,
    cursor: isColumnDragging ? "grabbing" : "grab",
    border: isOver || (activeId === column.id && isColumnDragging) ? "2px solid #3b82f6" : "1px solid transparent",
    // Only set a background color while an item is dragged over this column.
    // When not over, leave it undefined so Tailwind bg-* classes can control the background.
    backgroundColor: isOver ? "#e5edff" : undefined,
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
      className={`mx-2 w-80 min-w-[320px] max-h-[calc(100%-20px)] flex flex-col shrink-0 rounded-xl p-3 shadow-sm transition-all duration-200 ${getEmptyStateBgClass(column.name)} ${
        isColumnDragging || isDragging ? "shadow-lg scale-[1.01]" : ""
      }`}
    >
      {/* Header */}
      <div className="mb-2 flex items-center justify-between px-1 py-1">
        <div className="flex flex-col gap-1">
          <div
            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase ${getHeaderColorClass(column.name)}`}
          >
            <span>{column.name}</span>
            <span className="ml-2 text-[10px] opacity-80">{issueCount}</span>
          </div>
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
        <div className="flex-1 min-h-0 flex flex-col gap-2 overflow-y-auto pb-3 pr-1 rounded-lg bg-slate-50 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {issueCount > 0 ? (
            columnIssues.map((issue) => (
              <SortableIssue
                key={issue.id}
                issue={issue}
                isDraggingPreview={activeId === issue.id && !!isDragging}
                columnId={column.id}
              />
            ))
          ) : (
            <div className="flex h-full items-center justify-center rounded-lg text-xs text-gray-500 p-3 bg-white/70">
              <p>No tasks yet. Use the button below to add one.</p>
            </div>
          )}
        </div>
      </SortableContext>

      {/* Footer: quick create + count */}
      <div className="mt-2 pt-2 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600">
        <button
          type="button"
          onClick={() => setShowCreateIssueModal(true)}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-200/60 transition-colors"
        >
          <span className="text-sm">+</span>
          Add Issue
        </button>
        <span>{issueCount} issues</span>
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

      {showCreateIssueModal && (
        <CreateIssueModal
          isOpen={showCreateIssueModal}
          onClose={() => setShowCreateIssueModal(false)}
          projectId={projectId}
          defaultColumnId={column.id}
        />
      )}
    </div>
  );
};
