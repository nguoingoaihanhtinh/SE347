import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useProjectStore } from "../stores/projectStore";
import { useColumnStore } from "../stores/columnStore";
import { useIssueStore } from "../stores/issueStore";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragOverlay } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { FaPlus, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { KanbanColumn } from "../components/projects/board/kanbanColumn";
import { useUpdateProjectOrderColumn } from "../hooks/useProject";
import NewColumnPlaceholder from "@/components/projects/board/newColumnPlaceholder";
import IssueCard from "@/components/projects/board/issueCard";

export default function BoardPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { fetchProject, currentProject, isLoading: isProjectLoading } = useProjectStore();
  const { fetchColumns, columns, isLoading: isColumnsLoading, createColumn } = useColumnStore();
  const { fetchIssuesByProject, issues, updateIssue } = useIssueStore();
  const { updateOrderColumn } = useUpdateProjectOrderColumn();
  const [isCreatingColumn, setIsCreatingColumn] = useState(false);
  const [activeIssue, setActiveIssue] = useState(null);
  const [currentColumnIndex, setCurrentColumnIndex] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  useEffect(() => {
    if (!projectId) return;
    fetchProject(projectId);
    fetchColumns(projectId);
    fetchIssuesByProject(projectId);
  }, [projectId, fetchProject, fetchColumns, fetchIssuesByProject]);

  const handleDragStart = (event) => {
    const { active } = event;
    const issue = issues.find((i) => i.id === active.id);
    setActiveIssue(issue);
  };

  const handleDragEnd = async (event) => {
    setActiveIssue(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeIssueId = active.id as string;
    const overColumnId = over.id as string;

    // Tìm issue
    const issue = issues.find((i) => i.id === activeIssueId);
    if (!issue || !projectId) return;

    // Nếu drop vào column khác → update columnId
    if (issue.columnId !== overColumnId) {
      try {
        await updateIssue(projectId, activeIssueId, { columnId: overColumnId });
      } catch (error) {
        console.error("Failed to update issue:", error);
      }
    }
  };

  const handleCreateColumn = async (name: string, description: string = "") => {
    if (!name.trim()) return;

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
    const newColumns = columns
      .map((col) => ({
        ...col,
        order: newColumnOrder.indexOf(col.id) + 1,
      }))
      .sort((a, b) => a.order - b.order);

    // Cập nhật thứ tự column trên backend
    await updateOrderColumn({
      projectId,
      columns: newColumns.map((col) => ({ id: col.id, order: col.order })),
    });
  };

  const handleNavigateColumns = (direction: "left" | "right") => {
    const totalColumns = columns.length + (isCreatingColumn ? 1 : 0);
    if (totalColumns <= 1) return;

    if (direction === "left") {
      setCurrentColumnIndex((prev) => (prev > 0 ? prev - 1 : totalColumns - 1));
    } else {
      setCurrentColumnIndex((prev) => (prev < totalColumns - 1 ? prev + 1 : 0));
    }
  };

  const visibleColumns = () => {
    const totalColumns = columns.length + (isCreatingColumn ? 1 : 0);
    if (totalColumns <= 1) return totalColumns;

    // Hiển thị tối đa 4 columns trên màn hình cùng lúc
    return Math.min(4, totalColumns);
  };

  if (!projectId || isProjectLoading || isColumnsLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-slate-500">Đang tải bảng Kanban...</div>
      </div>
    );
  }

  // Filter issues theo columnId
  const columnsWithIssues = columns.map((column) => ({
    ...column,
    issues: issues.filter((issue) => issue.columnId === column.id),
  }));

  return (
    <div className="h-full w-full p-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{currentProject?.name || "Kanban Board"}</h1>
          <p className="text-sm text-slate-600">{currentProject?.key}</p>
        </div>
      </div>

      {/* Navigation controls for column navigation */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => handleNavigateColumns("left")}
            className={`p-2 rounded-lg transition-all ${
              currentColumnIndex > 0
                ? "bg-white text-gray-700 shadow-md hover:bg-gray-50"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
            disabled={currentColumnIndex === 0}
            aria-label="Previous column"
          >
            <FaChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleNavigateColumns("right")}
            className={`p-2 rounded-lg transition-all ${
              currentColumnIndex < columns.length + (isCreatingColumn ? 1 : 0) - visibleColumns()
                ? "bg-white text-gray-700 shadow-md hover:bg-gray-50"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
            disabled={currentColumnIndex >= columns.length + (isCreatingColumn ? 1 : 0) - visibleColumns()}
            aria-label="Next column"
          >
            <FaChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="text-sm text-gray-500">
          Column {currentColumnIndex + 1} of {columns.length + (isCreatingColumn ? 1 : 0)}
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={columns.map((c) => c.id)}
          strategy={horizontalListSortingStrategy}
          onDragEnd={(event) => {
            const { active, over } = event;
            if (!over || active.id === over.id) return;

            const activeColumnId = active.id as string;
            const overColumnId = over.id as string;

            const currentIndex = columns.findIndex((col) => col.id === activeColumnId);
            const overIndex = columns.findIndex((col) => col.id === overColumnId);

            if (currentIndex === -1 || overIndex === -1) return;

            const newOrder = [...columns.map((col) => col.id)];
            const [movedItem] = newOrder.splice(currentIndex, 1);
            newOrder.splice(overIndex, 0, movedItem);

            handleReorderColumns(newOrder);
          }}
        >
          {/* Container bình thường không có scroll */}
          <div className="flex gap-4">
            {columnsWithIssues.slice(currentColumnIndex, currentColumnIndex + visibleColumns()).map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                columns={columns}
                projectId={projectId}
                isDragging={!!activeIssue}
              />
            ))}

            {isCreatingColumn && currentColumnIndex <= columns.length && (
              <NewColumnPlaceholder onCancel={handleCancelCreateColumn} onSubmit={handleCreateColumn} />
            )}

            {!isCreatingColumn && currentColumnIndex + visibleColumns() > columns.length && (
              <div
                onClick={() => setIsCreatingColumn(true)}
                className="mx-2 w-80 flex-shrink-0 rounded-lg bg-gray-50 border-2 border-dashed border-gray-300 hover:border-blue-500 cursor-pointer transition-all flex items-center justify-center p-4 min-w-[320px]"
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

          {/* Thông báo khi có nhiều columns */}
          {columns.length + (isCreatingColumn ? 1 : 0) > visibleColumns() && (
            <div className="mt-4 text-center text-sm text-gray-500">Use the navigation buttons to see more columns</div>
          )}
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
