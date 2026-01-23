import { useCallback, useEffect, useMemo, useState, createContext } from "react";
import { Navigate, Outlet, useParams } from "react-router-dom";
import IssueDetail from "../components/projects/IssueDetail";
import { useProjectStore } from "../stores/projectStore";
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

  const isCorrectProjectLoaded = useMemo(() => {
    return !!projectId && !!currentProject && currentProject.id === projectId;
  }, [currentProject, projectId]);

  const [issueDetailOpen, setIssueDetailOpen] = useState(false);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  const openIssueDetail = useCallback((issueId: string) => {
    setSelectedIssueId(issueId);
    setIssueDetailOpen(true);
  }, []);

  const closeIssueDetail = useCallback(() => {
    setIssueDetailOpen(false);
    setSelectedIssueId(null);
  }, []);

  useEffect(() => {
    if (!projectId) return;

    // Fetch only when currentProject is missing or mismatched
    if (!currentProject || currentProject.id !== projectId) {
      fetchProject(projectId).catch(() => {
        // If fetching fails (404/403), isLoading will be set to false
        // and we'll redirect to /projects below
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
    <LayoutContext.Provider value={{ openIssueDetail, closeIssueDetail }}>
      <div className="flex flex-col h-[calc(100vh-64px)]">
        <ProjectHeader project={currentProject} />

        <div className="flex-1 min-w-0 relative">
          <div className="h-full">
            <Outlet />
          </div>

          {/* Issue detail panel (keeps existing behavior used by backlog/board components) */}
          {issueDetailOpen && (
            <div className="hidden md:block absolute top-0 right-0 h-full w-[420px] bg-white border-l border-slate-200 shadow-lg">
              <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-900">Issue Details</div>
                <button
                  type="button"
                  onClick={closeIssueDetail}
                  className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="h-[calc(100%-52px)] overflow-auto">
                {selectedIssueId && (
                  <IssueDetail selectedIssueId={selectedIssueId} onClose={closeIssueDetail} projectId={projectId} />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </LayoutContext.Provider>
  );
}
