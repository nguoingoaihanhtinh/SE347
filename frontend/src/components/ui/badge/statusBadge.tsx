import type { IColumn } from "../../../types/project";

export const statusColors = [
  {
    order: 1,
    textColor: "text-slate-700",
    dotColor: "bg-slate-500",
    bgColor: "bg-slate-100",
    hoverBg: "hover:bg-slate-50",
  },
  {
    order: 2,
    textColor: "text-sky-700",
    dotColor: "bg-sky-500",
    bgColor: "bg-sky-100",
    hoverBg: "hover:bg-sky-50",
  },
  {
    order: 3,
    textColor: "text-emerald-700",
    dotColor: "bg-emerald-500",
    bgColor: "bg-emerald-100",
    hoverBg: "hover:bg-emerald-50",
  },
  {
    order: 4,
    textColor: "text-amber-700",
    dotColor: "bg-amber-500",
    bgColor: "bg-amber-100",
    hoverBg: "hover:bg-amber-50",
  },
  {
    order: 5,
    textColor: "text-rose-700",
    dotColor: "bg-rose-500",
    bgColor: "bg-rose-100",
    hoverBg: "hover:bg-rose-50",
  },
  {
    order: 6,
    textColor: "text-violet-700",
    dotColor: "bg-violet-500",
    bgColor: "bg-violet-100",
    hoverBg: "hover:bg-violet-50",
  },
  {
    order: 7,
    textColor: "text-cyan-700",
    dotColor: "bg-cyan-500",
    bgColor: "bg-cyan-100",
    hoverBg: "hover:bg-cyan-50",
  },
  {
    order: 8,
    textColor: "text-indigo-700",
    dotColor: "bg-indigo-500",
    bgColor: "bg-indigo-100",
    hoverBg: "hover:bg-indigo-50",
  },
];

const sizeClasses = {
  small: {
    button: "px-2 py-0.5 text-xs",
    dot: "w-1.5 h-1.5",
  },
  medium: {
    button: "px-3 py-1 text-sm",
    dot: "w-2 h-2",
  },
  large: {
    button: "px-4 py-1.5 text-base",
    dot: "w-2.5 h-2.5",
  },
};

const StatusBadge = ({
  column,
  size = "small",
  className,
}: {
  column: IColumn;
  size?: "small" | "medium" | "large";
  className?: string;
}) => {
  if (!column) return <></>;

  return (
    <div
      className={`flex cursor-pointer items-center gap-2 rounded-2xl transition-colors duration-200 ${
        statusColors[column.order].hoverBg
      } ${className}`}
    >
      <div
        className={`rounded-2xl ${statusColors[column.order].bgColor} flex items-center gap-1 ${
          sizeClasses[size].button
        }`}
      >
        <p className={`font-semibold ${statusColors[column.order].textColor}`}>
          {column.name ? column.name.toUpperCase() : ""}
        </p>
      </div>
    </div>
  );
};

export default StatusBadge;
