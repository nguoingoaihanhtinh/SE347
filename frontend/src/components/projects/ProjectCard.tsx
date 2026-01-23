import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProjectStore } from "../../stores/projectStore";
import { toast } from "react-toastify";
import { extractErrorMessage } from "../../types/api";
import type { IProject } from "../../types/project";
import { Pencil } from "lucide-react";

interface ProjectCardProps {
  project: IProject;
  userRole: "Owner" | "Member" | "Public";
  onUpdate?: () => void;
}

export default function ProjectCard({ project, userRole, onUpdate }: ProjectCardProps) {
  const navigate = useNavigate();
  const { updateProject } = useProjectStore();
  const [isEditing, setIsEditing] = useState(false);
  const [projectName, setProjectName] = useState(project.name);
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number }>({
    visible: false,
    x: 0,
    y: 0,
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Reset project name when project changes
  useEffect(() => {
    setProjectName(project.name);
  }, [project.name]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Handle click outside to close context menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setContextMenu({ visible: false, x: 0, y: 0 });
      }
    };

    if (contextMenu.visible) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [contextMenu.visible]);

  const handleContextMenu = (e: React.MouseEvent) => {
    // Only show context menu for owners
    if (userRole !== "Owner") return;

    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      visible: true,
      x: e.pageX,
      y: e.pageY,
    });
  };

  const handleRenameClick = () => {
    setContextMenu({ visible: false, x: 0, y: 0 });
    setIsEditing(true);
  };

  const handleSave = async () => {
    const trimmedName = projectName.trim();
    if (!trimmedName) {
      toast.error("Project name cannot be empty");
      setProjectName(project.name);
      setIsEditing(false);
      return;
    }

    if (trimmedName === project.name) {
      setIsEditing(false);
      return;
    }

    try {
      await updateProject(project.id, { name: trimmedName });
      toast.success("Project renamed successfully");
      setIsEditing(false);
      onUpdate?.();
    } catch (error) {
      const msg = extractErrorMessage(error);
      toast.error(msg || "Failed to rename project");
      setProjectName(project.name);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setProjectName(project.name);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleCardClick = () => {
    if (!isEditing) {
      navigate(`/project/${project.id}/board`);
    }
  };

  return (
    <div key={project.id} className="block group" ref={cardRef}>
      <div
        onContextMenu={handleContextMenu}
        onClick={handleCardClick}
        className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-200 h-full flex flex-col cursor-pointer"
      >
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {isEditing ? (
                  <input
                    ref={inputRef}
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    onBlur={handleSave}
                    onKeyDown={handleKeyDown}
                    onClick={(e) => e.stopPropagation()}
                    className="font-semibold text-slate-900 flex-1 min-w-0 bg-transparent border-b border-blue-500 focus:outline-none focus:border-blue-600"
                    style={{ fontSize: "inherit", fontWeight: "inherit" }}
                  />
                ) : (
                  <h3 className="font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                    {project.name}
                  </h3>
                )}
                {userRole === "Owner" && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 flex-shrink-0">
                    Owner
                  </span>
                )}
                {userRole === "Member" && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 flex-shrink-0">
                    Member
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 font-mono">{project.key}</p>
            </div>
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 ml-2 flex-shrink-0">
              {project.type === "scrum" ? "Scrum" : "Kanban"}
            </span>
          </div>
          {project.description && (
            <p className="text-sm text-slate-600 mt-3 line-clamp-3 mb-4">{project.description}</p>
          )}
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
            <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
            <span
              className={`px-2 py-0.5 rounded-full ${
                project.access === "public" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700"
              }`}
            >
              {project.access === "public" ? "Public" : "Private"}
            </span>
          </div>
          {/* Quick Actions */}
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/project/${project.id}/board`);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                />
              </svg>
              Board
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/project/${project.id}/backlog`);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              Backlog
            </button>
          </div>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu.visible && userRole === "Owner" && (
        <div
          ref={menuRef}
          className="absolute z-50 bg-white shadow-md rounded border border-gray-200 text-sm py-1 min-w-[120px]"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
            position: "fixed",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleRenameClick}
            className="w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
          >
            <Pencil className="w-4 h-4" />
            <span>Rename</span>
          </button>
        </div>
      )}
    </div>
  );
}
