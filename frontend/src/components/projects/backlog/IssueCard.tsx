import { memo, useContext } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { IIssue } from "../../../types/issue";
import type { IColumn } from "../../../types/project";
import { useIssueStore } from "../../../stores/issueStore";
import UserAvatar from "../../ui/user/userAvatar";
import { statusOptions, typeOptions, priorityOptions } from "../../../constants/list";
import IconRenderer from "../../ui/IconRenderer";
import { LayoutContext } from "../../../layouts/ProjectLayout";

interface IssueCardProps {
  issue: IIssue;
  projectId: string;
  columns: IColumn[];
  isDragging: boolean;
  overItemId: string | null;
}

const IssueCard = memo(({ issue, projectId, columns, isDragging, overItemId }: IssueCardProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useDraggable({
    id: issue.id,
    data: {
      type: "Issue",
      issue,
    },
  });

  const { openIssueDetail } = useContext(LayoutContext);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab",
  };

  // Get type and priority info
  const typeInfo = typeOptions.find((opt) => opt.id === issue.type);
  const priorityInfo = priorityOptions.find((opt) => opt.name === issue.priority);
  const status = statusOptions.find((opt) => opt.key === columns.find((c) => c.id === issue.columnId)?.name);

  const handleClick = () => {
    openIssueDetail(issue.id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      className={`group bg-white px-2 py-1 shadow-sm transition-all duration-200 border border-gray-200 cursor-pointer hover:border-blue-400 hover:shadow-md ${
        isDragging && issue.id === overItemId ? "border-emerald-500 bg-emerald-50" : "hover:bg-gray-50"
      }`}
    >
      <div className="flex items-center">
        <div className="w-full flex flex-row items-center justify-start gap-4">
          <div className="flex flex-row items-center gap-2">
            <div className={`rounded-sm p-0.5 ${typeInfo?.bgColor}`}>
              <IconRenderer type={issue.type} className="h-3 w-3" />
            </div>

            <div
              className={`block text-sm font-light ${
                issue.columnId === "DONE" ? "line-through text-gray-400" : "underline text-gray-700"
              }`}
            >
              {issue.key}
            </div>
          </div>
          {/* ISSUE SUMMARY */}
          <div className="relative flex max-w-[300px] items-center gap-2 text-clip">
            <div className="flex items-center gap-1">
              <div className={`rounded-sm p-0.5 ${priorityInfo?.bgColor}`}>
                <IconRenderer type={issue.priority} className="h-3 w-3" />
              </div>
              <span className="truncate text-sm font-medium text-gray-800">{issue.summary}</span>
              {issue.storyPoint > 0 && (
                <span className="ml-2 text-xs font-medium text-blue-600">{issue.storyPoint} pts</span>
              )}
            </div>
          </div>
        </div>
        {/* IssueCardRight */}
        <div className="flex flex-row items-center gap-3 min-w-[120px]">
          <div className="flex flex-row items-center gap-2">
            {/* status indicator */}
            <div className={`rounded-full w-2 h-2 ${status?.bgColor}`}></div>

            {/* status text */}
            <span className={`text-xs font-medium ${status?.textColor}`}>
              {columns.find((c) => c.id === issue.columnId)?.name || "Unknown"}
            </span>
          </div>

          {/* assignee */}
          <div className="flex items-center">
            {issue.assigneeId ? (
              <UserAvatar userId={issue.assigneeId} size={20} isDisplayName={false} />
            ) : (
              <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-xs text-gray-500">U</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default IssueCard;
