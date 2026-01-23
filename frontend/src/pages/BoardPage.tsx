import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useProjectStore } from "../stores/projectStore";
import { useColumnStore } from "../stores/columnStore";
import { useIssueStore } from "../stores/issueStore";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragEndEvent,
  DragStartEvent,
  UniqueIdentifier,
} from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { FaPlus } from "react-icons/fa";
import { KanbanColumn } from "../components/projects/board/kanbanColumn";
import NewColumnPlaceholder from "@/components/projects/board/newColumnPlaceholder";
import IssueCard from "@/components/projects/board/issueCard";
import type { IIssue } from "../types/issue";

export default function BoardPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { fetchProject, currentProject, isLoading: isProjectLoading } = useProjectStore();
  const { fetchColumns, columns, isLoading: isColumnsLoading, createColumn, reorderColumns, setColumns } = useColumnStore();
  const { fetchIssuesForBoard, issues: storeIssues, updateIssue } = useIssueStore();
  const [isCreatingColumn, setIsCreatingColumn] = useState(false);
  const [activeIssue, setActiveIssue] = useState<IIssue | null>(null);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [hasActiveSprint, setHasActiveSprint] = useState<boolean | null>(null);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const isPanningRef = useRef(false);
  const panStartXRef = useRef(0);
  const panScrollLeftRef = useRef(0);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Require a small horizontal movement before drag starts to avoid accidental drags
      activationConstraint: { distance: 10 },
    }),
  );

  useEffect(() => {
    if (!projectId) return;
    
    const load = async () => {
      try {
        // Only fetch project if not already loaded
        if (!currentProject || currentProject.id !== projectId) {
          await fetchProject(projectId).catch((err) => {
            console.error("Failed to fetch project:", err);
          });
        }
        await fetchColumns(projectId).catch((err) => {
          console.error("Failed to fetch columns:", err);
        });
        const meta = await fetchIssuesForBoard(projectId).catch((err) => {
          console.error("Failed to fetch issues:", err);
          // Return default meta if fetch fails
          return { hasActiveSprint: false, mode: "kanban" as const };
        });
        if (meta) {
          setHasActiveSprint(meta.hasActiveSprint);
        }
      } catch (error) {
        // Log error but don't throw - let component handle gracefully
        console.error("Failed to load board data:", error);
      }
    };
    load();
  }, [projectId, currentProject, fetchProject, fetchColumns, fetchIssuesForBoard]);

  const issues = storeIssues || [];

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id);
    const issue = issues.find((i) => i.id === active.id);
    if (issue) setActiveIssue(issue);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveIssue(null);
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id || !projectId) return;

    // Xác định loại drag: column hay issue
    const isDraggingColumn = columns.some((col) => col.id === active.id);

    if (isDraggingColumn) {
      // Xử lý drag column
      const activeColumnId = active.id as string;
      const overColumnId = over.id as string;

      const currentIndex = columns.findIndex((col) => col.id === activeColumnId);
      const overIndex = columns.findIndex((col) => col.id === overColumnId);

      if (currentIndex === -1 || overIndex === -1) return;

      // Update local state immediately for instant UI feedback
      const reorderedColumns = [...columns];
      const [movedColumn] = reorderedColumns.splice(currentIndex, 1);
      reorderedColumns.splice(overIndex, 0, movedColumn);

      // Update store synchronously
      setColumns(reorderedColumns.map((col, index) => ({ ...col, order: index + 1 })));

      // Persist to backend in background
      const newOrder = reorderedColumns.map((col) => col.id);
      handleReorderColumns(newOrder).catch((error) => {
        console.error("Failed to persist column order:", error);
        // Revert on error
        fetchColumns(projectId);
      });
    } else {
      // Xử lý drag issue
      const activeIssueId = active.id as string;
      const overColumnId = over.id as string;

      const issue = issues.find((i) => i.id === activeIssueId);
      if (!issue) return;

      if (issue.columnId !== overColumnId) {
        try {
          await updateIssue(projectId, activeIssueId, { columnId: overColumnId });
        } catch (error) {
          console.error("Failed to update issue:", error);
        }
      }
    }
  };

  const handleCreateColumn = async (name: string, description: string = "") => {
    if (!projectId || !name.trim()) return;

    try {
      await createColumn(projectId, {
        name: name.trim(),
        description: description.trim(),
        color: "#3B82F6",
      });
      setIsCreatingColumn(false);
    } catch (error) {
      console.error("Error creating column:", error);
      alert("Failed to create column. Please try again.");
    }
  };

  const handleCancelCreateColumn = () => {
    setIsCreatingColumn(false);
  };

  const handleReorderColumns = async (newColumnOrder: string[]) => {
    if (!projectId) return;

    const columnOrders = newColumnOrder.map((columnId, index) => ({
      columnId,
      order: index + 1,
    }));

    await reorderColumns(projectId, columnOrders);
  };

  // Global event listeners for pan cleanup
  useEffect(() => {
    const stopPan = () => {
      isPanningRef.current = false;
    };

    const handleMouseUpGlobal = () => stopPan();
    const handleMouseLeaveGlobal = () => stopPan();

    window.addEventListener("mouseup", handleMouseUpGlobal);
    window.addEventListener("mouseleave", handleMouseLeaveGlobal);

    return () => {
      window.removeEventListener("mouseup", handleMouseUpGlobal);
      window.removeEventListener("mouseleave", handleMouseLeaveGlobal);
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    // Only start panning when clicking on the board background (not on cards/columns)
    if (e.target !== e.currentTarget) return;
    if (!boardRef.current) return;

    isPanningRef.current = true;
    panStartXRef.current = e.clientX;
    panScrollLeftRef.current = boardRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPanningRef.current || !boardRef.current) return;
    const dx = e.clientX - panStartXRef.current;
    boardRef.current.scrollLeft = panScrollLeftRef.current - dx;
  };

  if (!projectId || isProjectLoading || isColumnsLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-slate-500">Đang tải bảng Kanban...</div>
      </div>
    );
  }

  const isScrumProject = currentProject?.type === "scrum";

  if (isScrumProject && hasActiveSprint === false) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-slate-600 text-sm">
          No active sprint. Go to <span className="font-semibold">Backlog</span> to start one.
        </div>
      </div>
    );
  }

  const columnsWithIssues = columns.map((column) => ({
    ...column,
    issues: (issues || []).filter((issue) => issue.columnId === column.id),
  }));

  return (
    <div className="h-full w-full overflow-y-auto">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={columns.map((c) => c.id)} strategy={horizontalListSortingStrategy}>
          <div
            ref={boardRef}
            className="h-full w-full overflow-x-auto overflow-y-hidden flex flex-row items-start gap-4 px-4 pb-6"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
          >
            {columnsWithIssues.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                columns={columns}
                projectId={projectId}
                isDragging={!!activeIssue}
                activeId={activeId as string | null}
              />
            ))}

            {isCreatingColumn && (
              <NewColumnPlaceholder onCancel={handleCancelCreateColumn} onSubmit={handleCreateColumn} />
            )}

            {!isCreatingColumn && (
              <div
                onClick={() => setIsCreatingColumn(true)}
                className="mx-2 w-72 min-w-[280px] flex-shrink-0 rounded-lg bg-gray-50 border-2 border-dashed border-gray-300 hover:border-blue-500 cursor-pointer transition-all flex items-center justify-center p-4"
              >
                <div className="text-center text-gray-500">
                  <div className="flex justify-center mb-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <FaPlus className="text-blue-600" />
                    </div>
                  </div>
                  <p className="font-medium">Add another column</p>
                  <p className="text-xs mt-1">Click to add a new column</p>
                </div>
              </div>
            )}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeIssue ? (
            <div className="rotate-3 opacity-90">
              <IssueCard issue={activeIssue} isDragging={true} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
