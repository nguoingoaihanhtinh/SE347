// src/components/ui/IconRenderer.tsx
import React from "react";

export interface IconRendererProps {
  type: string;
  className?: string;
}

const IconRenderer: React.FC<IconRendererProps> = ({ type, className = "h-4 w-4" }) => {
  const baseClass = `${className} flex-shrink-0`;

  switch (type) {
    case "bug":
      return <span className={`${baseClass} text-red-500`}>🐞</span>;
    case "task":
      return <span className={`${baseClass} text-blue-500`}>✓</span>;
    case "story":
      return <span className={`${baseClass} text-green-500`}>📖</span>;
    case "epic":
      return <span className={`${baseClass} text-purple-500`}>⭐</span>;
    case "high":
      return <span className={`${baseClass} text-red-500`}>▲</span>;
    case "medium":
      return <span className={`${baseClass} text-yellow-500`}>●</span>;
    case "low":
      return <span className={`${baseClass} text-green-500`}>▼</span>;
    case "lock":
      return <span className={`${baseClass} text-gray-500`}>🔒</span>;
    case "eye":
      return <span className={`${baseClass} text-gray-500`}>👁️</span>;
    case "share":
      return <span className={`${baseClass} text-gray-500`}>↗️</span>;
    case "dots":
      return <span className={`${baseClass} text-gray-500`}>⋮</span>;
    case "close":
      return <span className={`${baseClass} text-gray-500`}>×</span>;
    default:
      return <span className={`${baseClass} text-gray-400`}>□</span>;
  }
};

export default IconRenderer;
