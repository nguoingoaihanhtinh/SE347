// src/pages/ProjectMembersPage.tsx
import { useParams } from "react-router-dom";

export default function ProjectMembersPage() {
  const { projectId } = useParams<{ projectId: string }>();
  return (
    <div className="h-full w-full overflow-y-auto px-6 py-6">
      <h1 className="text-xl font-semibold text-slate-900">Members</h1>
      <p className="mt-2 text-sm text-slate-600">
        Coming soon. Project ID: <span className="font-mono">{projectId}</span>
      </p>
    </div>
  );
}

