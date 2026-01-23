import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useIssueStore } from "../../stores/issueStore";
import { useColumnStore } from "../../stores/columnStore";
import { useSprintStore } from "../../stores/sprintStore";
import { useProjectStore } from "../../stores/projectStore";
import { useActivityStore } from "../../stores/activityStore";
import { useUpdateIssueFull } from "../../hooks/useIssue";
import { extractErrorMessage } from "../../types/api";
import IconRenderer from "../ui/IconRenderer";
import UserAvatar from "../ui/user/userAvatar";
import type { IIssue, IssueType } from "../../types/issue";
import type { IColumn } from "../../types/project";
import type { ISprint } from "../../types/sprint";
import type { IActivity, IActivityChange } from "../../types/activity";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { X, Archive, Trash2, MessageSquare } from "lucide-react";

const ISSUE_TYPES = ["task", "story", "bug", "epic"] as const;
const ISSUE_PRIORITIES = ["low", "medium", "high", "critical"] as const;

interface IssueDetailDrawerProps {
  issueId: string | null;
  onClose: () => void;
  projectId?: string;
}

// Format activity changes to readable text
const formatActivityChange = (
  change: IActivityChange,
  columns: IColumn[],
  sprints: ISprint[],
): { text: string; field: string } => {
  const field = change.field || "";
  const oldValue = change.old_value || "";
  const newValue = change.new_value || "";

  // Map columnId to column name
  if (field === "columnId" || field === "status") {
    const oldColumn = columns.find((c) => c.id === oldValue);
    const newColumn = columns.find((c) => c.id === newValue);
    if (oldColumn && newColumn && oldColumn.id !== newColumn.id) {
      return { text: `Moved from **${oldColumn.name}** to **${newColumn.name}**`, field: "status" };
    }
    return { text: `Moved to **${newColumn?.name || newValue}**`, field: "status" };
  }

  // Map sprintId to sprint name
  if (field === "sprintId") {
    if (!newValue || newValue === "null" || newValue === "") {
      const oldSprint = sprints.find((s) => s.id === oldValue);
      return { text: `Removed from **${oldSprint?.name || "sprint"}**`, field: "sprint" };
    }
    const sprint = sprints.find((s) => s.id === newValue);
    return { text: `Added to **${sprint?.name || "Sprint"}**`, field: "sprint" };
  }

  // Map assigneeId
  if (field === "assigneeId") {
    if (!newValue || newValue === "null" || newValue === "") {
      return { text: "Unassigned", field: "assignee" };
    }
    return { text: `Assigned to **${newValue}**`, field: "assignee" }; // UserAvatar will show the name
  }

  // Map priority
  if (field === "priority") {
    const priorityMap: Record<string, string> = {
      low: "Low",
      medium: "Medium",
      high: "High",
      critical: "Critical",
    };
    return {
      text: `Changed priority to **${priorityMap[newValue.toLowerCase()] || newValue}**`,
      field: "priority",
    };
  }

  // Map type
  if (field === "type") {
    return { text: `Changed type to **${newValue.charAt(0).toUpperCase() + newValue.slice(1)}**`, field: "type" };
  }

  // Map storyPoint
  if (field === "storyPoint") {
    return { text: `Set story points to **${newValue}**`, field: "storyPoint" };
  }

  // Map title/summary
  if (field === "title" || field === "summary") {
    return { text: `Updated ${field}`, field: "title" };
  }

  // Map description
  if (field === "description") {
    return { text: "Updated description", field: "description" };
  }

  // Default: show field name and values
  const fieldLabel = field.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());
  return { text: `Changed ${fieldLabel.toLowerCase()}`, field };
};

const ActivityItem = ({
  activity,
  columns,
  sprints,
}: {
  activity: IActivity;
  columns: IColumn[];
  sprints: ISprint[];
}) => {
  const getActionText = () => {
    const actionMap: Record<string, string> = {
      ISSUE_CREATED: "created this issue",
      ISSUE_UPDATED: "updated",
      ISSUE_MOVED: "moved",
      ISSUE_DELETED: "deleted",
    };

    return actionMap[activity.action_type] || activity.action_type.replace(/_/g, " ").toLowerCase();
  };

  return (
    <div className="flex gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="flex-shrink-0">
        <UserAvatar userId={activity.user_id || "unknown"} size={32} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <div className="flex items-center gap-1 flex-wrap">
            <span className="font-medium text-gray-900">{activity.user_name || "User"}</span>
            <span className="text-gray-500">{getActionText()}</span>
            {activity.changes && activity.changes.length > 0 && (
              <span className="text-gray-600 text-sm">
                {activity.changes.map((change, idx) => {
                  const formatted = formatActivityChange(change, columns, sprints);
                  // Parse markdown-style bold (**text**) to JSX
                  const parts = formatted.text.split(/(\*\*.*?\*\*)/g);
                  return (
                    <span key={idx} className="inline">
                      {parts.map((part, partIdx) => {
                        if (part.startsWith("**") && part.endsWith("**")) {
                          return <strong key={partIdx}>{part.slice(2, -2)}</strong>;
                        }
                        return <span key={partIdx}>{part}</span>;
                      })}
                      {idx < activity.changes.length - 1 && ", "}
                    </span>
                  );
                })}
              </span>
            )}
          </div>

          <span className="text-xs text-gray-400 whitespace-nowrap">
            {formatDistanceToNow(new Date(activity.created_at), {
              addSuffix: true,
              locale: vi,
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default function IssueDetailDrawer({ issueId, onClose, projectId: propProjectId }: IssueDetailDrawerProps) {
  const { projectId: paramProjectId } = useParams<{ projectId: string }>();
  const { currentProject } = useProjectStore();
  const effectiveProjectId = propProjectId || paramProjectId || currentProject?.id;

  const { columns } = useColumnStore();
  const { sprints } = useSprintStore();
  const { getIssueById, fetchIssuesByProject } = useIssueStore();
  const { fetchProjectActivities, activities } = useActivityStore();
  const { updateIssueFull } = useUpdateIssueFull();

  const selectedIssue = issueId ? getIssueById(issueId) : null;
  const [localIssue, setLocalIssue] = useState<IIssue | null>(selectedIssue || null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<"activity" | "comments">("activity");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState("");

  useEffect(() => {
    if (selectedIssue) {
      setLocalIssue(selectedIssue);
      setTitleValue(selectedIssue.title || selectedIssue.summary || "");
    }
  }, [selectedIssue]);

  useEffect(() => {
    if (effectiveProjectId && issueId) {
      fetchProjectActivities(effectiveProjectId);
    }
  }, [effectiveProjectId, issueId, fetchProjectActivities]);

  // Filter activities for this issue
  const issueActivities = useMemo(() => {
    if (!issueId) return [];
    return activities
      .filter((activity) => activity.issue_id === issueId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [activities, issueId]);

  const handleUpdate = useCallback(
    async (updates: Partial<IIssue>) => {
      if (!effectiveProjectId || !issueId || !localIssue) {
        toast.error("Cannot update: missing required information");
        return;
      }

      const oldIssue = { ...localIssue };
      setLocalIssue((prev) => (prev ? { ...prev, ...updates } : prev));
      setIsUpdating(true);

      try {
        await updateIssueFull({
          issueId,
          projectId: effectiveProjectId,
          data: updates,
        });

        toast.success("Updated successfully!");
        await fetchIssuesByProject(effectiveProjectId);
        await fetchProjectActivities(effectiveProjectId);
      } catch (error: unknown) {
        const errorMessage = extractErrorMessage(error);
        toast.error(`Update failed: ${errorMessage}`);
        setLocalIssue(oldIssue);
      } finally {
        setIsUpdating(false);
      }
    },
    [effectiveProjectId, issueId, localIssue, updateIssueFull, fetchIssuesByProject, fetchProjectActivities],
  );

  const handleTitleSave = async () => {
    if (titleValue !== localIssue?.title && titleValue !== localIssue?.summary) {
      await handleUpdate({ title: titleValue, summary: titleValue });
    }
    setIsEditingTitle(false);
  };

  if (!issueId || !localIssue) {
    return null;
  }

  const currentColumn = columns.find((c) => c.id === localIssue.columnId);
  const currentSprint = sprints.find((s) => s.id === localIssue.sprintId);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-500 font-mono mb-1">{localIssue.key}</div>
              {isEditingTitle ? (
                <input
                  type="text"
                  value={titleValue}
                  onChange={(e) => setTitleValue(e.target.value)}
                  onBlur={handleTitleSave}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleTitleSave();
                    } else if (e.key === "Escape") {
                      setTitleValue(localIssue.title || localIssue.summary || "");
                      setIsEditingTitle(false);
                    }
                  }}
                  className="w-full text-xl font-semibold text-gray-900 border-none outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                  autoFocus
                />
              ) : (
                <h1
                  className="text-xl font-semibold text-gray-900 cursor-text hover:bg-gray-50 rounded px-2 py-1 -mx-2 -my-1"
                  onClick={() => setIsEditingTitle(true)}
                >
                  {localIssue.title || localIssue.summary || "Untitled"}
                </h1>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
              title="Archive"
              aria-label="Archive"
            >
              <Archive className="h-5 w-5 text-gray-500" />
            </button>
            <button
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
              title="Delete"
              aria-label="Delete"
            >
              <Trash2 className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Content (70%) */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={localIssue.description || ""}
                onChange={(e) => setLocalIssue((prev) => (prev ? { ...prev, description: e.target.value } : null))}
                onBlur={() => {
                  if (localIssue?.description !== selectedIssue?.description) {
                    handleUpdate({ description: localIssue?.description || null });
                  }
                }}
                placeholder="Add a description..."
                className="w-full min-h-[120px] p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                disabled={isUpdating}
              />
            </div>

            {/* Tabs */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex gap-4 mb-4">
                <button
                  onClick={() => setActiveTab("activity")}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "activity"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Activity
                </button>
                <button
                  onClick={() => setActiveTab("comments")}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "comments"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <MessageSquare className="h-4 w-4 inline mr-1" />
                  Comments
                </button>
              </div>

              {/* Activity Tab */}
              {activeTab === "activity" && (
                <div className="space-y-2">
                  {issueActivities.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm">No activity yet</p>
                    </div>
                  ) : (
                    issueActivities.map((activity) => (
                      <ActivityItem key={activity.id} activity={activity} columns={columns} sprints={sprints} />
                    ))
                  )}
                </div>
              )}

              {/* Comments Tab */}
              {activeTab === "comments" && (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">Comments coming soon</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar (30% - Gray Background) */}
          <div className="w-[30%] bg-gray-50 border-l border-gray-200 p-6 overflow-y-auto">
            <div className="space-y-4">
              {/* Status */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={localIssue.columnId || ""}
                  onChange={(e) => {
                    setLocalIssue((prev) => (prev ? { ...prev, columnId: e.target.value } : null));
                    handleUpdate({ columnId: e.target.value });
                  }}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  disabled={isUpdating}
                >
                  {columns.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={localIssue.priority || "medium"}
                  onChange={(e) => {
                    setLocalIssue((prev) => (prev ? { ...prev, priority: e.target.value as any } : null));
                    handleUpdate({ priority: e.target.value as any });
                  }}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  disabled={isUpdating}
                >
                  {ISSUE_PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Assignee */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Assignee</label>
                {localIssue.assigneeId ? (
                  <div className="p-2 bg-white border border-gray-300 rounded-md">
                    <UserAvatar userId={localIssue.assigneeId} size={24} isDisplayName={true} />
                  </div>
                ) : (
                  <div className="p-2 bg-white border border-gray-300 rounded-md">
                    <span className="text-sm text-gray-400 italic">Unassigned</span>
                  </div>
                )}
              </div>

              {/* Sprint */}
              {currentProject?.type === "scrum" && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Sprint</label>
                  <select
                    value={localIssue.sprintId || ""}
                    onChange={(e) => {
                      setLocalIssue((prev) => (prev ? { ...prev, sprintId: e.target.value || null } : null));
                      handleUpdate({ sprintId: e.target.value || null });
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    disabled={isUpdating}
                  >
                    <option value="">Backlog</option>
                    {sprints.map((sprint) => (
                      <option key={sprint.id} value={sprint.id}>
                        {sprint.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Type */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Type</label>
                <div className="flex items-center gap-2 p-2 bg-white border border-gray-300 rounded-md">
                  <IconRenderer type={localIssue.type} className="h-4 w-4" />
                  <select
                    value={localIssue.type || "task"}
                    onChange={(e) => {
                      setLocalIssue((prev) => (prev ? { ...prev, type: e.target.value as IssueType } : null));
                      handleUpdate({ type: e.target.value as IssueType });
                    }}
                    className="flex-1 text-sm border-none outline-none focus:ring-0 bg-transparent"
                    disabled={isUpdating}
                  >
                    {ISSUE_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Story Points */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Story Points</label>
                <input
                  type="number"
                  value={localIssue.storyPoint || 0}
                  onChange={(e) => {
                    setLocalIssue((prev) => (prev ? { ...prev, storyPoint: Number(e.target.value) } : null));
                  }}
                  onBlur={() => {
                    if (localIssue?.storyPoint !== selectedIssue?.storyPoint) {
                      handleUpdate({ storyPoint: localIssue?.storyPoint || 0 });
                    }
                  }}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  disabled={isUpdating}
                  min="0"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
