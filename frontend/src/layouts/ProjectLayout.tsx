import { useCallback, useEffect, useMemo, createContext } from "react";
import { Navigate, Outlet, useParams } from "react-router-dom";
import IssueDetailDrawer from "../components/projects/IssueDetailDrawer";
import { useProjectStore } from "../stores/projectStore";
import { useIssueStore } from "../stores/issueStore";
import ProjectHeader from "../components/layout/ProjectHeader";

/* ================= CONTEXT ================= */
interface LayoutContextType {
  openIssueDetail: (issueId: string) => void;
  closeIssueDetail: () => void;
}

const LayoutContext = createContext<LayoutContextType>({
  openIssueDetail: () => {},
  closeIssueDetail: () => {},
});

export { LayoutContext };

export default function ProjectLayout() {
  const { projectId } = useParams<{ projectId: string }>();
  const { currentProject, isLoading, fetchProject } = useProjectStore();
  const { selectedIssueId, openIssueDetail, closeIssueDetail } = useIssueStore();

  const isCorrectProjectLoaded = useMemo(() => {
    return !!projectId && !!currentProject && currentProject.id === projectId;
  }, [currentProject, projectId]);

  // Wrap store functions for LayoutContext compatibility
  const handleOpenIssueDetail = useCallback(
    (issueId: string) => {
      openIssueDetail(issueId);
    },
    [openIssueDetail],
  );

  const handleCloseIssueDetail = useCallback(() => {
    closeIssueDetail();
  }, [closeIssueDetail]);

  useEffect(() => {
    if (!projectId) return;

    // Fetch only when currentProject is missing or mismatched
    if (!currentProject || currentProject.id !== projectId) {
      fetchProject(projectId).catch((error) => {
        // If fetching fails, log but don't throw
        // Component will handle the error state gracefully
        console.error("Failed to fetch project in ProjectLayout:", error);
      });
    }
  }, [projectId, currentProject, fetchProject]);

  // If no projectId, redirect to projects
  if (!projectId) {
    return <Navigate to="/projects" replace />;
  }

  // If we have the correct project, render it
  if (isCorrectProjectLoaded) {
    // Continue to render below
  } else {
    // We don't have the correct project yet
    // Show spinner while loading OR if we're waiting for the fetch to complete
    // (isLoading might be false initially, but we're about to fetch)
    if (isLoading || !currentProject || currentProject.id !== projectId) {
      return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      );
    }
    // This shouldn't happen, but defensive redirect
    return <Navigate to="/projects" replace />;
  }

  // At this point, we know currentProject is not null (guarded by isCorrectProjectLoaded)
  if (!currentProject) {
    return <Navigate to="/projects" replace />;
  }

  return (
    <LayoutContext.Provider value={{ openIssueDetail: handleOpenIssueDetail, closeIssueDetail: handleCloseIssueDetail }}>
      <div className="flex flex-col h-[calc(100vh-64px)]">
        <ProjectHeader project={currentProject} />

        <div className="flex-1 min-w-0 relative">
          <div className="h-full">
            <Outlet />
          </div>
        </div>

        {/* Issue Detail Drawer */}
        {selectedIssueId && (
          <IssueDetailDrawer issueId={selectedIssueId} onClose={handleCloseIssueDetail} projectId={projectId} />
        )}
      </div>
    </LayoutContext.Provider>
  );
}
