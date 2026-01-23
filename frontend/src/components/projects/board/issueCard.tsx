import { useState } from "react";
import { FaBars } from "react-icons/fa";
import type { IIssue, IIssueWithoutColumn } from "../../../types/issue";
import TypeBadge from "../../ui/badge/typeBadge";
import PriorityBadge from "../../ui/badge/priorityBadge";
import UserAvatar from "../../ui/user/userAvatar";
import { useIssueStore } from "../../../stores/issueStore";

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date);
  } catch {
    return "";
  }
};

const ensureIssueHasColumnId = (issue: IIssue | IIssueWithoutColumn, defaultColumnId?: string): IIssue => {
  if ("columnId" in issue && issue.columnId) {
    return issue as IIssue;
  }

  // Ensure all date fields are valid ISO strings or null
  const normalizeDate = (date: string | null | undefined): string | null => {
    if (!date) return null;
    try {
      const d = new Date(date);
      return isNaN(d.getTime()) ? null : d.toISOString();
    } catch {
      return null;
    }
  };

  return {
    ...issue,
    columnId: defaultColumnId || "unassigned",
    createdAt: normalizeDate(issue.createdAt) || new Date().toISOString(),
    updatedAt: normalizeDate(issue.updatedAt) || new Date().toISOString(),
    attachments: issue.attachments || [],
    dueDateFrom: normalizeDate(issue.dueDateFrom),
    dueDateTo: normalizeDate(issue.dueDateTo),
    completedAt: normalizeDate(issue.completedAt),
    reporterId: issue.reporterId || "unknown",
  } as IIssue;
};

const IssueCard = ({
  issue: rawIssue,
  isDragging,
  isDraggingPreview = false,
  defaultColumnId,
}: {
  issue: IIssue | IIssueWithoutColumn;
  isDragging?: boolean;
  isDraggingPreview?: boolean;
  defaultColumnId?: string;
}) => {
  const issue = ensureIssueHasColumnId(rawIssue, defaultColumnId);

  const [isHovered, setIsHovered] = useState(false);
  const { openIssueDetail } = useIssueStore();

  if (isDraggingPreview) {
    return (
      <div className="min-h-40 w-full truncate rounded-md border-2 border-dashed border-blue-400 bg-blue-50 opacity-70">
        <div className="flex justify-center items-center h-full">
          <div className="text-blue-600 font-medium">Moving to this column...</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`cursor-grab rounded-md bg-white p-2.5 shadow-sm transition-all duration-200 ${
        isDragging
          ? "opacity-50"
          : isDraggingPreview
          ? "opacity-0"
          : isHovered
          ? "shadow-md z-10 ring-1 ring-blue-200"
          : "hover:shadow-md"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => openIssueDetail(issue.id)}
    >
      {/* Header */}
      <div className="mb-1.5 flex items-center justify-between text-[11px] text-gray-500">
        <div className="flex items-center gap-2">
          <TypeBadge type={issue.type} isShowLabel={false} />
          <span className="font-medium">{issue.key}</span>
        </div>
        {isHovered && (
          <div className="text-gray-400 hover:text-gray-600 transition-colors">
            <FaBars />
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="mb-1.5 line-clamp-2 text-sm font-medium text-gray-800 hover:text-blue-600 transition-colors">
        {issue.summary}
      </h3>

      {/* Metadata */}
      <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
        <PriorityBadge priority={issue.priority} isShowLabel={false} />
        {issue.storyPoint > 0 && (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
            {issue.storyPoint} {issue.storyPoint === 1 ? "point" : "points"}
          </span>
        )}
        {issue.attachments?.length > 0 && (
          <div className="text-xs text-gray-500">
            <span className="flex items-center">
              <span className="mr-1">📎</span>
              {issue.attachments.length}
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2">
          {issue.assigneeId ? (
            <UserAvatar userId={issue.assigneeId} size={20} isDisplayName={false} />
          ) : (
            <span className="italic text-gray-400 text-xs">Unassigned</span>
          )}
        </div>
        {issue.createdAt && (
          <span title={issue.createdAt} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-gray-300"></span>
            Created {formatDate(issue.createdAt)}
          </span>
        )}
      </div>
    </div>
  );
};

export default IssueCard;
