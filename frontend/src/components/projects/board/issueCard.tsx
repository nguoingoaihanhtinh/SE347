import { useState } from "react";

import { FaBars } from "react-icons/fa";

import type { IIssue } from "../../../types/issue";
import TypeBadge from "../../ui/badge/typeBadge";
import PriorityBadge from "../../ui/badge/priorityBadge";
import UserAvatar from "../../ui/user/userAvatar";
import { useIssueStore } from "../../../stores/issueStore";

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
};

const IssueCard = ({ issue, projectId, isDragging }: { issue: IIssue; projectId: string; isDragging?: boolean }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { openIssueDetail } = useIssueStore();

  if (isDragging) {
    return (
      <div className="z-50 min-h-40 w-full truncate rounded-md border-2 border-dashed border-gray-300 bg-gray-200"></div>
    );
  }
  return (
    <div
      className={`cursor-pointer rounded-md border border-gray-200 bg-white p-3 shadow-sm transition-all hover:bg-gray-200 hover:shadow-md ${
        isDragging ? "opacity-90" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        openIssueDetail(issue.id, projectId);
      }}
    >
      {/* Header with issue key and menu */}
      <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <TypeBadge type={issue.type} isShowLabel={false} />
          <span className="">{issue.key}</span>
        </div>
        {isHovered && (
          <div
            onClick={() => {
              openIssueDetail(issue.id, projectId);
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaBars />
          </div>
        )}
      </div>

      {/* Issue title */}
      <h3 className={`mb-2 line-clamp-2 text-sm font-medium`}>{issue.summary}</h3>

      {/* Issue metadata */}
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <PriorityBadge priority={issue.priority} isShowLabel={false} />
        {issue.storyPoint > 0 && (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
            {issue.storyPoint} {issue.storyPoint === 1 ? "point" : "points"}
          </span>
        )}

        {/* Attachments indicator */}
        {issue.attachments.length > 0 && (
          <div className={`text-xs text-gray-500`}>
            <span className="flex items-center">
              <span className="mr-1">📎</span>
              {issue.attachments.length}
            </span>
          </div>
        )}
      </div>

      {/* Footer with assignee and date */}
      <div className={`mt-3 flex items-center justify-between text-xs text-gray-500`}>
        <UserAvatar userId={issue.assigneeId ?? undefined} />
        <span title={issue.createdAt}>Created {formatDate(issue.createdAt)}</span>
      </div>
    </div>
  );
};
export default IssueCard;
