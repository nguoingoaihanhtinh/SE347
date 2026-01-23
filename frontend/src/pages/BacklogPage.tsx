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
        // Fetch project, sprints, issues, and columns in parallel
        // If any fail, catch and log but don't throw
        await Promise.allSettled([
          fetchProject(projectId).catch((err) => {
            console.error("Failed to fetch project:", err);
          }),
          fetchSprintsByProject(projectId).catch((err) => {
            console.error("Failed to fetch sprints:", err);
          }),
          fetchIssuesByProject(projectId).catch((err) => {
            console.error("Failed to fetch issues:", err);
          }),
          fetchColumns(projectId).catch((err) => {
            console.error("Failed to fetch columns:", err);
          }),
        ]);
      } catch (error) {
        console.error("Failed to load backlog data:", error);
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
    <div className="h-full w-full overflow-y-auto px-4 pb-10">
      <BacklogBoard projectId={projectId} />
    </div>
  );
}
