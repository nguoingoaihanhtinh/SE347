import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useProjectStore } from "../stores/projectStore";
import { useColumnStore } from "../stores/columnStore";
import { KanbanColumn } from "../components/projects/board/kanbanColumn";

export default function BoardPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { fetchProject, currentProject, isLoading: isProjectLoading } = useProjectStore();
  const { fetchColumns, columns, isLoading: isColumnsLoading } = useColumnStore();

  useEffect(() => {
    if (!projectId) return;
    fetchProject(projectId);
    fetchColumns(projectId);
  }, [projectId]);

  if (!projectId || isProjectLoading || isColumnsLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-slate-500">Loading board...</div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-auto">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-semibold text-slate-900">{currentProject?.name || "Project Board"}</h1>
        <span className="text-sm text-slate-600">{currentProject?.key}</span>
      </div>

      {/* Kanban Board */}
      <div className="flex min-h-full w-full gap-4 pb-4">
        {columns.map((column) => (
          <KanbanColumn key={column.id} column={column} columns={columns} projectId={projectId} setColumns={() => {}} />
        ))}
      </div>
    </div>
  );
}
