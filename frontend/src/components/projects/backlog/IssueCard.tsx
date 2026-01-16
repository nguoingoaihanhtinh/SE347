// src/components/projects/backlog/IssueCard.tsx
import { memo } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { IIssue } from "../../../types/issue";
import type { IColumn } from "../../../types/project";
import { useIssueStore } from "../../../stores/issueStore";
import UserAvatar from "../../ui/user/userAvatar";
// Cập nhật import - lấy constants từ file .ts, component từ file .tsx
import { statusOptions, typeOptions, priorityOptions } from "../../../constants/list";
import IconRenderer from "../../../components/ui/IconRenderer";

interface IssueCardProps {
  issue: IIssue;
  projectId: string;
  columns: IColumn[];
  isDragging: boolean;
  overItemId: string | null;
  setIsSprintIssuesChecked: (checked: boolean) => void;
}

const IssueCard = memo(
  ({ issue, projectId, columns, isDragging, overItemId, setIsSprintIssuesChecked }: IssueCardProps) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useDraggable({
      id: issue.id,
      data: {
        // Đã sửa lỗi cú pháp bằng cách thêm "data"
        type: "Issue",
        issue,
      },
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      cursor: "grab",
    };

    const { selectedIssues, setSelectedIssues } = useIssueStore();
    const isSelected = selectedIssues[issue.sprintId || ""]?.some((i) => i.id === issue.id);

    const handleCardClick = () => {
      const { openIssueDetail } = useIssueStore.getState();
      openIssueDetail(issue.id);
    };

    // Get type and priority info
    const typeInfo = typeOptions.find((opt) => opt.id === issue.type);
    const priorityInfo = priorityOptions.find((opt) => opt.name === issue.priority);
    const status = statusOptions.find((opt) => opt.key === columns.find((c) => c.id === issue.columnId)?.name);

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={handleCardClick}
        className={`group bg-white px-2 py-1 shadow-sm transition-all duration-200 ${
          isDragging && issue.id === overItemId
            ? "border-emerald-500 bg-emerald-50"
            : "border border-gray-200 hover:bg-gray-100"
        }`}
      >
        <div className="flex items-center">
          <div className="w-full cursor-pointer flex flex-row items-center justify-start gap-4">
            {/* ISSUE TITLE AND CHECKBOX */}
            <div className="flex flex-row items-center gap-2">
              <input
                aria-label="Select Issue"
                type="checkbox"
                checked={isSelected}
                onChange={(e) => {
                  e.stopPropagation();
                  if (isSelected) {
                    const filtered = selectedIssues[issue.sprintId || ""]?.filter((i) => i.id !== issue.id) || [];
                    setSelectedIssues({ [issue.sprintId || ""]: filtered });
                    if (filtered.length === 0) setIsSprintIssuesChecked(false);
                  } else {
                    const existing = selectedIssues[issue.sprintId || ""] || [];
                    setSelectedIssues({ [issue.sprintId || ""]: [...existing, issue] });
                    setIsSprintIssuesChecked(true);
                  }
                }}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 opacity-0 group-hover:opacity-100 focus:ring-blue-500"
              />

              <div className={`rounded-sm p-0.5 ${typeInfo?.bgColor}`}>
                <IconRenderer type={issue.type} className="h-3 w-3" />
              </div>

              <div
                className={`block text-sm font-light ${
                  issue.columnId === "DONE" ? "line-through" : "underline"
                } text-gray-500`}
              >
                {issue.key}
              </div>
            </div>
            {/* ISSUE SUMMARY */}
            <div className="relative flex max-w-40 items-center gap-2 text-clip">
              <div className="flex items-center gap-1">
                <div className={`rounded-sm p-0.5 ${priorityInfo?.bgColor}`}>
                  <IconRenderer type={issue.priority} className="h-3 w-3" />
                </div>
                <span className="truncate text-sm font-thin text-gray-800">{issue.summary}</span>
              </div>
            </div>
          </div>
          {/* IssueCardRight */}
          <div className="grid w-[35%] max-w-[45%] min-w-[400px] grid-cols-12 gap-1">
            {/* status dropdown */}
            <div className="col-span-3 flex items-center">
              <div className={`rounded-sm px-1.5 py-0.5 text-center ${status?.bgColor}`}>
                <div className={`text-xs font-semibold ${status?.textColor}`}>
                  {columns.find((c) => c.id === issue.columnId)?.name}
                </div>
              </div>
            </div>
            {/* type dropdown */}
            <div className="col-span-3 flex items-center hover:cursor-pointer">
              <div className="flex items-center gap-1">
                <IconRenderer type={issue.type} className="h-3 w-3" />
                <span className={`text-xs font-medium ${typeInfo?.textColor}`}>{typeInfo?.name}</span>
              </div>
            </div>

            {/* due date to */}
            <div className="col-span-3 flex items-center">
              <div className="text-xs text-gray-600">
                {issue.dueDateTo ? new Date(issue.dueDateTo).toLocaleDateString() : "-"}
              </div>
            </div>

            {/* story point */}
            <div className="col-span-2 flex items-center">
              <div className="flex w-full items-center justify-center">
                <span className="text-xs font-medium text-gray-700">{issue.storyPoint || "-"} pts</span>
              </div>
            </div>

            {/* assignee */}
            <div className="col-span-1 flex items-center">
              <UserAvatar userId={issue.assigneeId || ""} size={20} isDisplayName={false} />
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export default IssueCard;
