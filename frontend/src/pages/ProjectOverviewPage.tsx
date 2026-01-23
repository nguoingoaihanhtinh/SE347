// src/pages/ProjectOverviewPage.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { projects } from "../apis/project";
import { useProjectStore } from "../stores/projectStore";
import { useAuthStore } from "../stores/authStore";
import { extractErrorMessage } from "../types/api";
import { Loader2, Users, Calendar, CheckCircle, AlertCircle } from "lucide-react";

export default function ProjectOverviewPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { currentProject, fetchProject } = useProjectStore();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [stats, setStats] = useState<{
    totalMembers: number;
    totalIssues: number;
    completedIssues: number;
  } | null>(null);

  useEffect(() => {
    if (!projectId) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        await fetchProject(projectId);
        // Try to get stats (may fail if not member)
        try {
          const membersResponse = await projects.getMembers(projectId);
          if (membersResponse.data.success) {
            const members = Array.isArray(membersResponse.data.data) ? membersResponse.data.data : [];
            setStats({
              totalMembers: members.length,
              totalIssues: 0, // Would need separate API call
              completedIssues: 0,
            });
          }
        } catch (error) {
          // Not a member, stats unavailable
        }
      } catch (error: any) {
        if (error?.response?.status === 404) {
          toast.error("Project not found");
          navigate("/projects");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const handleJoinProject = async () => {
    if (!projectId || !currentProject) return;

    setIsJoining(true);
    try {
      // For public projects, request to join
      if (currentProject.access === "public") {
        await projects.requestToJoin(currentProject.key);
        toast.success("Join request sent! Waiting for approval.");
      } else {
        toast.error("This is a private project. Please contact the owner.");
      }
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      toast.error(errorMessage || "Failed to join project");
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading || !currentProject) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-y-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{currentProject.name}</h1>
          <p className="text-slate-600">{currentProject.description || "No description provided"}</p>
          <div className="flex items-center gap-4 mt-4">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                currentProject.access === "public"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {currentProject.access === "public" ? "Public" : "Private"}
            </span>
            <span className="text-sm text-gray-500">Key: {currentProject.key}</span>
            <span className="text-sm text-gray-500">
              Type: {currentProject.type === "scrum" ? "Scrum" : "Kanban"}
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Members</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalMembers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Issues</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalIssues}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Completed</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.completedIssues}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Join Project Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="max-w-md mx-auto">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Join This Project</h2>
            <p className="text-gray-600 mb-6">
              {currentProject.access === "public"
                ? "Request to join this project and start collaborating with the team."
                : "This is a private project. Please contact the project owner for access."}
            </p>
            {currentProject.access === "public" && (
              <button
                onClick={handleJoinProject}
                disabled={isJoining}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isJoining ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending Request...
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4" />
                    Request to Join
                  </>
                )}
              </button>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
