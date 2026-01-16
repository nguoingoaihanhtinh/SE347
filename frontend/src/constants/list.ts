// src/constants/list.ts
export const typeOptions = [
  {
    id: "bug",
    name: "Bug",
    icon: "bug",
    bgColor: "bg-red-100",
    textColor: "text-red-700",
  },
  {
    id: "task",
    name: "Task",
    icon: "task",
    bgColor: "bg-blue-100",
    textColor: "text-blue-700",
  },
  {
    id: "story",
    name: "Story",
    icon: "story",
    bgColor: "bg-green-100",
    textColor: "text-green-700",
  },
  {
    id: "epic",
    name: "Epic",
    icon: "epic",
    bgColor: "bg-purple-100",
    textColor: "text-purple-700",
  },
];

export const priorityOptions = [
  {
    name: "high",
    label: "High",
    icon: "high",
    bgColor: "bg-red-100",
    textColor: "text-red-700",
  },
  {
    name: "medium",
    label: "Medium",
    icon: "medium",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-700",
  },
  {
    name: "low",
    label: "Low",
    icon: "low",
    bgColor: "bg-green-100",
    textColor: "text-green-700",
  },
];

export const statusOptions = [
  {
    label: "TO DO",
    key: "TO DO",
    order: 1,
    textColor: "text-gray-600",
    dotColor: "bg-gray-400",
    bgColor: "bg-gray-100",
  },
  {
    label: "IN PROGRESS",
    key: "IN PROGRESS",
    order: 2,
    textColor: "text-blue-600",
    dotColor: "bg-blue-400",
    bgColor: "bg-blue-100",
  },
  {
    label: "DONE",
    key: "DONE",
    order: 3,
    textColor: "text-green-600",
    dotColor: "bg-green-400",
    bgColor: "bg-green-100",
  },
];

// Export các icon dưới dạng strings hoặc functions không sử dụng JSX
export const getIconContent = (type: string): string => {
  switch (type) {
    case "bug":
      return "🐞";
    case "task":
      return "✓";
    case "story":
      return "📖";
    case "epic":
      return "⭐";
    case "high":
      return "▲";
    case "medium":
      return "●";
    case "low":
      return "▼";
    case "lock":
      return "🔒";
    case "eye":
      return "👁️";
    case "share":
      return "↗️";
    case "dots":
      return "⋮";
    case "close":
      return "×";
    default:
      return "□";
  }
};
