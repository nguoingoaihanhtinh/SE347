import { NavLink } from "react-router-dom";
import type { IProject } from "../../types/project";
import { useAuthStore } from "../../stores/authStore";

interface ProjectHeaderProps {
  project: IProject;
}

export default function ProjectHeader({ project }: ProjectHeaderProps) {
  const { user } = useAuthStore();

  const showBacklog = project.type === "scrum";

  const tabs = [
    {
      key: "board",
      label: "Board",
      to: "board",
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h7v14H4V6zm9 0h7v10h-7V6z"
          />
        </svg>
      ),
      visible: true,
    },
    {
      key: "backlog",
      label: "Backlog",
      to: "backlog",
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"
          />
        </svg>
      ),
      visible: showBacklog,
    },
    {
      key: "members",
      label: "Members",
      to: "members",
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a4 4 0 00-5-4M9 20H4v-2a4 4 0 015-4m8-4a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
      visible: true,
    },
    {
      key: "settings",
      label: "Settings",
      to: "settings",
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      visible: true,
    },
  ].filter((tab) => tab.visible);

  return (
    <div>
      {/* Top row: breadcrumbs */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-1.5">
        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-500">
          <NavLink
            to="/projects"
            className="hover:text-slate-900 font-medium transition-colors"
          >
            Projects
          </NavLink>
          <span>/</span>
          <span className="text-slate-900 font-semibold truncate max-w-[200px] sm:max-w-xs">
            {project.name}
          </span>
        </div>
      </div>

      {/* Bottom row: tabs */}
      <div className="px-3 sm:px-4 pb-0.5">
        <div className="flex gap-3 sm:gap-4 border-b border-slate-200">
          {tabs.map((tab) => (
            <NavLink
              key={tab.key}
              to={tab.to}
              end={tab.key === "board"}
              className={({ isActive }) =>
                [
                  "inline-flex items-center gap-1.5 border-b-2 px-0 pb-1.5 pt-0.5 text-[11px] sm:text-xs font-medium transition-colors",
                  isActive
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-200",
                ].join(" ")
              }
            >
              {tab.icon}
              <span>{tab.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}

