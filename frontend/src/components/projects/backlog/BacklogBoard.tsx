// src/components/projects/backlog/BacklogBoard.tsx
import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
  DragOverlay,
} from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { IColumn } from "../../../types/project";
import type { ISprint } from "../../../types/sprint";
import type { IIssue } from "../../../types/issue";
import BacklogSprint from "./BacklogSprint";
import CreateSprintButton from "./CreateSprintButton";
import IssueCardOverlay from "./IssueCardOverlay";
import IssueDetail from "../IssueDetail";
import IssueDetailSkeleton from "../IssueDetailSkeleton";
import { useIssueStore } from "../../../stores/issueStore";
import { useColumnStore } from "../../../stores/columnStore";
import { useSprintStore } from "../../../stores/sprintStore";
import { useProjectStore } from "../../../stores/projectStore";
import { statusOptions, renderIcon } from "../../../constants/list"; // ✅ Import từ file đã sửa

// ✅ TẠO COMPONENT PAGE FILTER ĐƠN GIẢN
const PageFilter = ({ onFiltersChange, currentProject }) => (
  <div className="bg-white rounded-lg shadow p-4 mb-4">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
        <select className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
          <option>All Types</option>
          {["Bug", "Task", "Story", "Epic"].map((type) => (
            <option key={type}>{type}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
          <option>All Status</option>
          {statusOptions.map((status) => (
            <option key={status.key}>{status.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
        <select className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
          <option>All Assignees</option>
          <option>Unassigned</option>
          <option>Me</option>
        </select>
      </div>
    </div>
  </div>
);

const BacklogBoard = () => {
  const { projectId = "" } = useParams();
  const { selectedIssueId, setSelectedIssueId } = useIssueStore();
  const { columns, fetchColumns } = useColumnStore();
  const { sprints, fetchSprintsByProject } = useSprintStore();
  const { issues, fetchIssuesByProject } = useIssueStore();
  const { currentProject } = useProjectStore();

  const [activeIssue, setActiveIssue] = useState<IIssue | null>(null);
  const [overItemId, setOverItemId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localSprints, setLocalSprints] = useState<Array<ISprint & { issues: IIssue[] }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({ projectId });

  // Tạo sprint "Backlog" ảo
  const backlogSprint = useMemo(
    () => ({
      id: "backlog",
      name: "Backlog",
      goal: "",
      dateStarted: new Date().toISOString(),
      dateEnded: new Date().toISOString(),
      duration: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      projectId,
      issues: [] as IIssue[],
    }),
    [projectId]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        await Promise.all([fetchColumns(projectId), fetchSprintsByProject(projectId), fetchIssuesByProject(projectId)]);
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId) {
      loadData();
      setFilters({ projectId });
    }
  }, [projectId]);

  useEffect(() => {
    if (isLoading || !sprints.length || !issues.length) {
      setLocalSprints([backlogSprint]);
      return;
    }

    const allSprints = [backlogSprint, ...sprints];
    const sprintsWithIssues = allSprints.map((sprint) => ({
      ...sprint,
      issues: issues.filter((issue) =>
        sprint.id === "backlog"
          ? !issue.sprintId || issue.sprintId === null || issue.sprintId === ""
          : issue.sprintId === sprint.id
      ),
    }));

    setLocalSprints(sprintsWithIssues);
  }, [sprints, issues, backlogSprint, isLoading]);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const issueId = active.id as string;

      for (const sprint of localSprints) {
        const issue = sprint.issues.find((i) => i.id === issueId);
        if (issue) {
          setActiveIssue(issue);
          break;
        }
      }
      setIsDragging(true);
    },
    [localSprints]
  );

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event;
    setOverItemId((over?.id as string) || null);
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setIsDragging(false);
      setActiveIssue(null);
      setOverItemId(null);

      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      const isOverSprint = !localSprints.some((sprint) => sprint.issues.some((issue) => issue.id === overId));

      const targetSprint = localSprints.find(
        (sprint) => sprint.issues.some((issue) => issue.id === overId) || sprint.id === overId
      );

      const activeSprint = localSprints.find((sprint) => sprint.issues.some((issue) => issue.id === activeId));

      if (!targetSprint || !activeSprint) return;

      // Cùng sprint - đổi thứ tự
      if (targetSprint.id === activeSprint.id) {
        if (targetSprint.id === overId) return;

        setLocalSprints((prev) => {
          const newSprints = [...prev];
          const targetIndex = newSprints.findIndex((s) => s.id === targetSprint.id);
          if (targetIndex === -1) return prev;

          const activeIndex = newSprints[targetIndex].issues.findIndex((i) => i.id === activeId);
          const overIndex = newSprints[targetIndex].issues.findIndex((i) => i.id === overId);

          if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) return prev;

          const newIssues = [...newSprints[targetIndex].issues];
          const [movedItem] = newIssues.splice(activeIndex, 1);
          newIssues.splice(overIndex, 0, movedItem);

          newSprints[targetIndex] = {
            ...newSprints[targetIndex],
            issues: newIssues,
          };

          return newSprints;
        });
        return;
      }

      // Khác sprint - di chuyển issue
      setLocalSprints((prev) => {
        const newSprints = [...prev];

        // Xóa issue khỏi sprint nguồn
        const activeIndex = newSprints.findIndex((s) => s.id === activeSprint.id);
        if (activeIndex !== -1) {
          const activeIssueIndex = newSprints[activeIndex].issues.findIndex((i) => i.id === activeId);
          if (activeIssueIndex !== -1) {
            const [issue] = newSprints[activeIndex].issues.splice(activeIssueIndex, 1);

            // Thêm vào sprint đích
            const targetIndex = newSprints.findIndex((s) => s.id === targetSprint.id);
            if (targetIndex !== -1) {
              if (isOverSprint) {
                newSprints[targetIndex].issues.push(issue);
              } else {
                const overIssueIndex = newSprints[targetIndex].issues.findIndex((i) => i.id === overId);
                if (overIssueIndex !== -1) {
                  newSprints[targetIndex].issues.splice(overIssueIndex, 0, issue);
                } else {
                  newSprints[targetIndex].issues.push(issue);
                }
              }
            }
          }
        }

        return newSprints;
      });

      // Cập nhật backend
      const newSprintId = targetSprint.id === "backlog" ? null : targetSprint.id;
      const { updateIssue } = useIssueStore.getState();
      try {
        await updateIssue(projectId, activeId, { sprintId: newSprintId });
        toast.success("Issue moved successfully!");
      } catch (error) {
        console.error("Failed to update issue sprint:", error);
      }
    },
    [localSprints, projectId]
  );

  if (isLoading) {
    return <div className="flex h-full items-center justify-center">Loading...</div>;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full flex-col gap-4 p-4 pb-28">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="p-2 text-2xl font-bold text-gray-700">{currentProject?.name} Backlog</h1>
            <p className="px-2 text-sm text-gray-500">Manage your project backlog and sprints</p>
          </div>
          <CreateSprintButton projectId={projectId} />
        </div>

        {/* ✅ SỬ DỤNG COMPONENT MỚI */}
        <PageFilter onFiltersChange={(filter) => setFilters(filter as any)} currentProject={currentProject} />

        <div className="flex min-w-[650px] flex-col gap-2 overflow-x-auto">
          {localSprints.map((sprint) => (
            <BacklogSprint
              key={sprint.id}
              sprint={sprint}
              projectId={projectId}
              columns={columns}
              overItemId={overItemId}
              isDragging={isDragging}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={null}>{activeIssue ? <IssueCardOverlay issue={activeIssue} /> : null}</DragOverlay>
      </div>
    </DndContext>
  );
};

export default BacklogBoard;
