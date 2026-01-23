// src/pages/ManagerDashboard.tsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useProjectStore } from "../stores/projectStore";
import { issues } from "../apis/issue";
import type { IIssue } from "../types/issue";

type TopContributor = {
  name: string;
  tasksAssigned: number;
  tasksCompleted: number;
};

export default function ManagerDashboard() {
  const { projects, fetchProjects } = useProjectStore();
  const [myTasksCount, setMyTasksCount] = useState<number | null>(null);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    // Real data if it's easy: count of my tasks via backend endpoint
    // If endpoint fails, fall back to mock
    (async () => {
      try {
        const res = await issues.myTasks({ page: 1, limit: 1 });
        // Backend returns { success, data: Issue[], pagination }
        const total = res.data?.pagination?.total;
        setMyTasksCount(typeof total === "number" ? total : null);
      } catch {
        setMyTasksCount(null);
      }
    })();
  }, []);

  const totalProjects = projects.length || 12; // real if available; fallback to mock

  // MOCK DATA (visual impact first)
  const kpis = useMemo(
    () => ({
      totalProjects,
      activeSprints: 3,
      totalMembers: 8,
      completion: 68,
    }),
    [totalProjects],
  );

  const projectHealth = [
    { name: "E-commerce", value: 80, color: "bg-emerald-500" },
    { name: "Landing Page", value: 45, color: "bg-amber-500" },
    { name: "Mobile App", value: 62, color: "bg-blue-500" },
    { name: "CRM", value: 30, color: "bg-rose-500" },
  ];

  const taskDistribution = [
    { label: "Done", value: 40, color: "bg-emerald-500" },
    { label: "In Progress", value: 35, color: "bg-blue-500" },
    { label: "To Do", value: 25, color: "bg-slate-400" },
  ];

  const topContributors: TopContributor[] = [
    { name: "Alice", tasksAssigned: 12, tasksCompleted: 10 },
    { name: "Bob", tasksAssigned: 8, tasksCompleted: 6 },
    { name: "Charlie", tasksAssigned: 7, tasksCompleted: 5 },
    { name: "Daisy", tasksAssigned: 6, tasksCompleted: 6 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Overview</h1>
          <p className="text-sm text-slate-600 mt-1">Manager overview & project health</p>
        </div>
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
        >
          View Projects
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Total Projects</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{kpis.totalProjects}</p>
          <p className="mt-2 text-xs text-slate-500">Accessible to you</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-500">My Tasks</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{myTasksCount ?? 12}</p>
          <p className="mt-2 text-xs text-slate-500">Assigned issues</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Active Sprints</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{kpis.activeSprints}</p>
          <p className="mt-2 text-xs text-slate-500">Mock</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Overall Completion</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{kpis.completion}%</p>
          <div className="mt-3 h-2 w-full rounded-full bg-slate-100">
            <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${kpis.completion}%` }} />
          </div>
          <p className="mt-2 text-xs text-slate-500">Mock</p>
        </div>
      </div>

      {/* Charts / Visuals */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Project Health</h2>
            <span className="text-xs text-slate-500">Mock</span>
          </div>
          <div className="mt-4 space-y-4">
            {projectHealth.map((p) => (
              <div key={p.name}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">{p.name}</span>
                  <span className="text-slate-500">{p.value}%</span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
                  <div className={`h-2 rounded-full ${p.color}`} style={{ width: `${p.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Task Distribution</h2>
            <span className="text-xs text-slate-500">Mock</span>
          </div>

          <div className="mt-5 space-y-3">
            {taskDistribution.map((t) => (
              <div key={t.label} className="flex items-center gap-3">
                <span className={`h-3 w-3 rounded ${t.color}`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{t.label}</span>
                    <span className="text-slate-500">{t.value}%</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100">
                    <div className={`h-1.5 rounded-full ${t.color}`} style={{ width: `${t.value}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
            Tip: Use this as a high-level snapshot before diving into a project board.
          </div>
        </div>
      </div>

      {/* Team Performance */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Top Contributors</h2>
          <span className="text-xs text-slate-500">Mock</span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-500">
                <th className="py-2 pr-4 font-medium">Member</th>
                <th className="py-2 pr-4 font-medium">Tasks Assigned</th>
                <th className="py-2 pr-4 font-medium">Tasks Completed</th>
                <th className="py-2 font-medium">Efficiency</th>
              </tr>
            </thead>
            <tbody>
              {topContributors.map((m) => {
                const efficiency = Math.round((m.tasksCompleted / Math.max(m.tasksAssigned, 1)) * 100);
                return (
                  <tr key={m.name} className="border-b border-slate-50">
                    <td className="py-3 pr-4 font-medium text-slate-800">{m.name}</td>
                    <td className="py-3 pr-4 text-slate-700">{m.tasksAssigned}</td>
                    <td className="py-3 pr-4 text-slate-700">{m.tasksCompleted}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-28 rounded-full bg-slate-100">
                          <div
                            className="h-2 rounded-full bg-emerald-500"
                            style={{ width: `${efficiency}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-slate-700">{efficiency}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

