import { ChevronDown, Equal, ChevronsUp, ChevronsDown } from "lucide-react";
import React from "react";
import type { IssuePriority } from "../../../types/issue";

// eslint-disable-next-line react-refresh/only-export-components
export const priorityOptions: {
  title: IssuePriority;
  icon: React.ReactNode;
  textColor: string;
  hoverBg: string;
}[] = [
  {
    title: "critical",
    icon: <ChevronsUp size={18} strokeWidth={3.5} className="text-red-600" />,
    textColor: "text-red-600",
    hoverBg: "hover:bg-red-50",
  },

  {
    title: "high",
    icon: <Equal size={18} strokeWidth={3.5} className="text-orange-500" />,
    textColor: "text-orange-500",
    hoverBg: "hover:bg-orange-50",
  },
  {
    title: "medium",
    icon: <ChevronDown size={18} strokeWidth={3.5} className="text-green-600" />,
    textColor: "text-green-600",
    hoverBg: "hover:bg-green-50",
  },
  {
    title: "low",
    icon: <ChevronsDown size={18} strokeWidth={3.5} className="text-blue-600" />,
    textColor: "text-blue-600",
    hoverBg: "hover:bg-blue-50",
  },
];
const PriorityBadge = ({
  priority,
  isShowLabel,
  className = "",
}: {
  priority: IssuePriority;
  isShowLabel?: boolean;
  className?: string;
}) => {
  const currentPriority = priorityOptions.find((option) => option.title === priority);
  return (
    <div
      className={`flex cursor-pointer items-center gap-2 rounded-full transition-colors duration-200 hover:bg-gray-100 ${className}`}
    >
      <div className="flex-shrink-0">{currentPriority?.icon}</div>

      {isShowLabel && <p className={`text-[13px] font-semibold text-gray-700`}>{priority || "-"}</p>}
    </div>
  );
};

export default PriorityBadge;
