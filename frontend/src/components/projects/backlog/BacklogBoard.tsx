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
import { CSS } from "@dnd-kit/utilities";
import type { IColumn } from "../../../types/project";
import type { ISprint } from "../../../types/sprint";
import type { IIssue } from "../../../types/issue";
import BacklogSprint from "./BacklogSprint";
import CreateSprintButton from "./CreateSprintButton";
import IssueCardOverlay from "./IssueCardOverlay";
import IssueDetail from "../IssueDetail";
import { useIssueStore } from "../../../stores/issueStore";
import { useColumnStore } from "../../../stores/columnStore";
import { useSprintStore } from "../../../stores/sprintStore";
import { useProjectStore } from "../../../stores/projectStore";
import { statusOptions } from "../../../constants/list";
import { toast } from "react-toastify";

const PageFilter = ({ onFiltersChange, currentProject }) => {
  const [filters, setFilters] = useState({
    type: "all",
    status: "all",
    assignee: "all",
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);

    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            {["Bug", "Task", "Story", "Epic"].map((type) => (
              <option key={type} value={type.toLowerCase()}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            {statusOptions.map((status) => (
              <option key={status.key} value={status.key.toLowerCase()}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
          <select
            name="assignee"
            value={filters.assignee}
            onChange={handleFilterChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">All Assignees</option>
            <option value="unassigned">Unassigned</option>
            <option value="me">Me</option>
          </select>
        </div>
      </div>
    </div>
  );
};

const BacklogBoard = ({ projectId }) => {
  const { selectedIssueId } = useIssueStore();
  const { columns } = useColumnStore();
  const { sprints } = useSprintStore();
  const { issues } = useIssueStore();
  const { currentProject } = useProjectStore();

  const [activeIssue, setActiveIssue] = useState<IIssue | null>(null);
  const [overItemId, setOverItemId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localSprints, setLocalSprints] = useState<Array<ISprint & { issues: IIssue[] }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [appliedFilters, setAppliedFilters] = useState({ projectId });

  const backlogSprint = useMemo(() => {
    if (!projectId) return null;

    return {
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
    };
  }, [projectId]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Thêm useEffect để cập nhật localSprints khi issues thay đổi
  useEffect(() => {
    if (isLoading || !projectId || !backlogSprint) return;

    const validSprints = sprints.filter(
      (sprint) =>
        sprint.projectId === projectId && !["completed", "archived"].includes(sprint.status?.toLowerCase() || "")
    );

    const allSprints = [backlogSprint, ...validSprints];
    const sprintsWithIssues = allSprints.map((sprint) => {
      if (sprint.id === "backlog") {
        return {
          ...sprint,
          issues: issues.filter((issue) => !issue.sprintId || issue.sprintId === null || issue.sprintId === ""),
        };
      }

      return {
        ...sprint,
        issues: issues.filter((issue) => issue.sprintId === sprint.id),
      };
    });

    setLocalSprints(sprintsWithIssues);
  }, [sprints, issues, backlogSprint, projectId, isLoading]); // QUAN TRỌNG: Theo dõi sự thay đổi của issues

  useEffect(() => {
    // Cài đặt ban đầu khi component mount
    setIsLoading(false);
  }, []);

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

      if (!targetSprint || !activeSprint) {
        console.warn("Could not find target or active sprint");
        return;
      }

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

        const activeIndex = newSprints.findIndex((s) => s.id === activeSprint.id);
        if (activeIndex !== -1) {
          const activeIssueIndex = newSprints[activeIndex].issues.findIndex((i) => i.id === activeId);
          if (activeIssueIndex !== -1) {
            const [issue] = newSprints[activeIndex].issues.splice(activeIssueIndex, 1);

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
      if (activeId && activeId !== "undefined") {
        const newSprintId = targetSprint.id === "backlog" ? null : targetSprint.id;
        const { updateIssue } = useIssueStore.getState();
        try {
          await updateIssue(projectId, activeId, { sprintId: newSprintId });
          toast.success("Issue moved successfully!");
        } catch (error) {
          console.error("Failed to update issue sprint:", error);
          toast.error("Failed to move issue. Please try again.");

          // Rollback UI khi có lỗi
          setLocalSprints((prev) => {
            const newSprints = [...prev];
            return newSprints;
          });
        }
      }
    },
    [localSprints, projectId]
  );

  const handleFilterChange = useCallback(
    (filters) => {
      const newFilters = { projectId, ...filters };
      setAppliedFilters(newFilters);
    },
    [projectId]
  );

  if (!projectId) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-500">No project selected</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="p-2 text-2xl font-bold text-gray-700">{currentProject?.name || "Project"} Backlog</h1>
            <p className="px-2 text-sm text-gray-500">Manage your project backlog and sprints</p>
          </div>
          <CreateSprintButton projectId={projectId} />
        </div>

        <PageFilter onFiltersChange={handleFilterChange} currentProject={currentProject} />

        {localSprints.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <span className="text-blue-600 text-2xl">📋</span>
              </div>
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No sprints found</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new sprint</p>
              <div className="mt-6">
                <CreateSprintButton projectId={projectId} />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex min-w-[650px] flex-col gap-2 overflow-x-auto">
            {localSprints.map(
              (sprint) =>
                sprint && (
                  <BacklogSprint
                    key={sprint.id}
                    sprint={sprint}
                    projectId={projectId}
                    columns={columns}
                    overItemId={overItemId}
                    isDragging={isDragging}
                  />
                )
            )}
          </div>
        )}

        <DragOverlay dropAnimation={null}>{activeIssue ? <IssueCardOverlay issue={activeIssue} /> : null}</DragOverlay>

        {selectedIssueId && selectedIssueId !== "undefined" && <IssueDetail selectedIssueId={selectedIssueId} />}
      </div>
    </DndContext>
  );
};

export default BacklogBoard;
