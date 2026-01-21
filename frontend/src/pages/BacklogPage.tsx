// src/pages/BacklogPage.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useProjectStore } from "../stores/projectStore";
import { useSprintStore } from "../stores/sprintStore";
import { useIssueStore } from "../stores/issueStore";
import { useColumnStore } from "../stores/columnStore";
import BacklogBoard from "../components/projects/backlog/BacklogBoard";

export default function BacklogPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { fetchProject } = useProjectStore();
  const { fetchSprintsByProject } = useSprintStore();
  const { fetchIssuesByProject } = useIssueStore();
  const { fetchColumns } = useColumnStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;

    const loadData = async () => {
      try {
        setIsLoading(true);
        await Promise.all([
          fetchProject(projectId),
          fetchSprintsByProject(projectId),
          fetchIssuesByProject(projectId),
          fetchColumns(projectId),
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  if (!projectId || isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-slate-500">Loading backlog...</div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4 p-4 pb-28">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Backlog</h1>
          <p className="text-sm text-slate-600">Manage your project backlog and sprints</p>
        </div>
      </div>

      <BacklogBoard projectId={projectId} />
    </div>
  );
}
