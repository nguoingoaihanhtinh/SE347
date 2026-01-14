import { LuBookmark, LuBug, LuClipboardCheck, LuStar } from "react-icons/lu";
import React from "react";
import type { IssueType } from "../../../types";

export const typeOptions: {
  id: IssueType;
  name: string;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
  hoverBg: string;
}[] = [
  {
    id: "Bug",
    name: "Bug",
    icon: <LuBug className="h-4 w-4 text-red-500" />,
    bgColor: "bg-red-100",
    textColor: "text-red-700",
    hoverBg: "hover:bg-red-50",
  },
  {
    id: "Task",
    name: "Task",
    icon: <LuClipboardCheck className="h-4 w-4 text-blue-500" />,
    bgColor: "bg-blue-100",
    textColor: "text-blue-700",
    hoverBg: "hover:bg-blue-50",
  },
  {
    id: "Story",
    name: "Story",
    icon: <LuBookmark className="h-4 w-4 text-green-500" />,
    bgColor: "bg-green-100",
    textColor: "text-green-700",
    hoverBg: "hover:bg-green-50",
  },
  {
    id: "Epic",
    name: "Epic",
    icon: <LuStar className="h-4 w-4 text-purple-500" />,
    bgColor: "bg-purple-100",
    textColor: "text-purple-700",
    hoverBg: "hover:bg-purple-50",
  },
];

const TypeBadge = ({
  type,
  isShowLabel = true,
  className = "",
}: {
  type: IssueType;
  isShowLabel?: boolean;
  className?: string;
}) => {
  const currentType = typeOptions.find((option) => option.name === type);

  return (
    <div
      className={`flex cursor-pointer items-center gap-2 transition-colors duration-200 ${
        currentType?.hoverBg || "hover:bg-gray-50"
      } ${className}`}
    >
      <div className={`flex items-center justify-center gap-2 rounded-md px-2 py-1 `}>
        {currentType?.icon}

        {isShowLabel && (
          <p className={`text-[13px] font-bold ${currentType?.textColor || "text-gray-700"}`}>{type || "-"}</p>
        )}
      </div>
    </div>
  );
};

export default TypeBadge;
