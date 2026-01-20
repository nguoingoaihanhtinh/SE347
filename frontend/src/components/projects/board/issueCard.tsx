import { useState, useEffect, useRef } from "react";
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

const IssueCard = ({
  issue,
  isDragging,
  isDraggingPreview = false,
}: {
  issue: IIssue;
  isDragging?: boolean;
  isDraggingPreview?: boolean;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { openIssueDetail } = useIssueStore();
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDragging && cardRef.current) {
      const clone = cardRef.current.cloneNode(true) as HTMLElement;
      clone.style.position = "fixed";
      clone.style.pointerEvents = "none";
      clone.style.zIndex = "1000";
      clone.style.width = `${cardRef.current.offsetWidth}px`;
      clone.style.opacity = "0.85";
      clone.style.transform = "scale(1.05)";
      clone.style.boxShadow = "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)";

      document.body.appendChild(clone);

      const onMouseMove = (e: MouseEvent) => {
        clone.style.left = `${e.clientX + 10}px`;
        clone.style.top = `${e.clientY + 10}px`;
      };

      document.addEventListener("mousemove", onMouseMove);

      return () => {
        document.removeEventListener("mousemove", onMouseMove);
        clone.remove();
      };
    }
  }, [isDragging]);

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
      ref={cardRef}
      className={`cursor-grab rounded-md border border-gray-200 bg-white p-3 shadow-sm transition-all duration-200 ${
        isDragging
          ? "shadow-lg scale-[1.02] border-blue-400"
          : isHovered
            ? "border-blue-300 shadow-md z-10"
            : "hover:border-blue-200 hover:shadow-md"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => openIssueDetail(issue.id)}
    >
      {/* Header */}
      <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
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
      <h3 className="mb-2 line-clamp-2 text-sm font-medium text-gray-800 hover:text-blue-600 transition-colors">
        {issue.summary}
      </h3>

      {/* Metadata */}
      <div className="mb-2 flex flex-wrap items-center gap-2">
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
        <span title={issue.createdAt} className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-gray-300"></span>
          Created {formatDate(issue.createdAt)}
        </span>
      </div>
    </div>
  );
};

export default IssueCard;
