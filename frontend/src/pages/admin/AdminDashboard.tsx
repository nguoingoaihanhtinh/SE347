import { useEffect, useMemo, useState } from "react";
import { AxiosError } from "axios";
import { ArrowDown, ArrowUp, Clock, Loader2 } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Sector, Tooltip, XAxis, YAxis, type TooltipProps } from "recharts";
import { adminApi, type SystemStats, type AdminStatsResponse } from "../../lib/api";

type EnhancedTooltipProps = TooltipProps<number, string> & {
  payload?: {
    value?: number;
    name?: string | number;
    payload?: Record<string, unknown>;
    color?: string;
  }[];
  label?: string | number;
  coordinate?: { x?: number; y?: number };
};

const CHART_COLORS = {
  blue: "#4F46E5",
  cyan: "#A7A3F2",
  open: "#2563eb",
  closed: "#9ca3af",
};

const formatProjectTypeLabel = (name?: string) => {
  if (!name) return "";
  return String(name)
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ActivePie: any = Pie;

const CustomAreaTooltip = (props: EnhancedTooltipProps) => {
  const { active, payload } = props;
  if (!active || !payload || payload.length === 0) return null;
  const payloadLabel = payload[0].payload as { label?: string; monthLabel?: string; month?: string; name?: string };
  const rawLabel = payloadLabel?.label ?? payloadLabel?.monthLabel ?? payloadLabel?.month ?? payload[0].name;
  const label = typeof rawLabel === "string" || typeof rawLabel === "number" ? rawLabel : undefined;
  if (label === undefined) return null;
  return (
    <div className="rounded-xl border border-gray-100 bg-white px-3 py-2 shadow-lg">
      <p className="text-sm font-semibold text-gray-900">{label}</p>
      <p className="text-xs text-gray-600">
        count: <span className="font-semibold text-gray-900">{payload[0].value}</span>
      </p>
    </div>
  );
};

const CustomBarTooltip = (props: EnhancedTooltipProps) => {
  const { active, payload, label, coordinate } = props;
  if (!active || !payload || payload.length === 0 || !coordinate) return null;

  const data = payload[0];
  const value = data?.value ?? 0;
  const name = data?.name === "openCount" ? "Open" : data?.name === "closedCount" ? "Closed" : String(data?.name ?? "");
  const color = data?.color ?? "#6b7280";

  const tooltipHeight = 50;
  const barWidth = 25;
  const tooltipX = (coordinate.x ?? 0) - barWidth;
  const tooltipY = (coordinate.y ?? 0) - tooltipHeight / 2 - 5;

  return (
    <div
      className="tooltip-appear rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg"
      style={{
        position: "absolute",
        left: `${tooltipX}px`,
        top: `${tooltipY}px`,
        pointerEvents: "none",
        zIndex: 1000,
      }}
    >
      <p className="text-sm font-semibold text-gray-900">{label}</p>
      <p className="text-xs font-medium" style={{ color }}>
        {name}: <span className="font-semibold text-gray-900">{value}</span>
      </p>
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderActiveProjectTypeShape = (props: any) => {
  const { cx, cy, startAngle, endAngle, fill } = props;
  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={60}
      outerRadius={82}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
      stroke={fill}
      strokeWidth={1}
      opacity={0.98}
    />
  );
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [activeChartTab, setActiveChartTab] = useState<"week" | "month" | "6m">("week");

  useEffect(() => {
    void loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApi.getStats();
      
      // Log raw response for debugging (remove in production)
      if (import.meta.env.DEV) {
        console.log("API Response:", response);
        console.log("Response data:", response.data);
      }
      
      // Backend returns: { success, counts, trends, analytics } directly (NOT wrapped in data)
      const responseData = response.data;
      
      // Validate response structure - Backend returns direct format
      if (responseData?.success && responseData.counts && responseData.trends && responseData.analytics) {
        setStats({
          counts: responseData.counts,
          trends: responseData.trends,
          analytics: responseData.analytics,
        });
      } else {
        // Fallback: try wrapped format for backward compatibility (if backend changes in future)
        const responseWithData = responseData as AdminStatsResponse & { data?: SystemStats };
        const wrappedData = responseWithData?.data;
        if (wrappedData?.counts && wrappedData.trends && wrappedData.analytics) {
          setStats({
            counts: wrappedData.counts,
            trends: wrappedData.trends,
            analytics: wrappedData.analytics,
          });
        } else {
          throw new Error("Invalid response format: missing success flag or required fields (counts, trends, analytics)");
        }
      }
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      if (axiosErr?.response?.status === 401) {
        console.warn("Unauthorized access - redirecting to login");
        setLoading(false);
        window.location.href = "/login";
        return;
      }
      const errorMessage = axiosErr?.response?.data?.message || axiosErr?.message || "Failed to load dashboard statistics";
      setError(errorMessage);
      console.error("Error loading dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatMonth = (monthStr: string) => {
    const [, month] = monthStr.split("-");
    const date = new Date(2000, Number(month) - 1);
    return date.toLocaleDateString("en-US", { month: "short" });
  };


  const safeCounts = stats?.counts ?? { totalUsers: 0, totalProjects: 0, totalIssues: 0, activeIssues: 0 };
  const safeTrends = stats?.trends ?? { usersTrend: 0, projectsTrend: 0, activeIssuesTrend: 0 };
  const analytics: SystemStats["analytics"] | undefined = stats?.analytics;
  const projectDistribution: SystemStats["analytics"]["projectDistribution"] = useMemo(
    () => analytics?.projectDistribution ?? [],
    [analytics?.projectDistribution]
  );
  const totalProjects = projectDistribution.reduce((sum, d) => sum + (d?.value ?? 0), 0);

  const userGrowth: SystemStats["analytics"]["userGrowth"] = useMemo(() => analytics?.userGrowth ?? [], [analytics?.userGrowth]);
  const weeklyGrowth = useMemo(() => analytics?.weeklyGrowth ?? [], [analytics?.weeklyGrowth]);

  type ChartPoint = { name: string; count: number };

  const monthlySeries: ChartPoint[] = useMemo(() => {
    if (!userGrowth || userGrowth.length === 0) return [];
    return userGrowth.map((item) => ({
      name: formatMonth(item.month),
      count: item.count ?? 0,
    }));
  }, [userGrowth]);

  const weeklySeries: ChartPoint[] = useMemo(() => {
    if (!weeklyGrowth || weeklyGrowth.length === 0) return [];
    return weeklyGrowth.map((item, idx) => ({
      name: item.name ?? `Week ${idx + 1}`,
      count: item.count ?? 0,
    }));
  }, [weeklyGrowth]);

  const sixMonthSeries: ChartPoint[] = useMemo(() => {
    if (!monthlySeries || monthlySeries.length === 0) return [];
    const last6 = monthlySeries.slice(-6);
    const prev6 = monthlySeries.slice(-12, -6);

    const sum = (arr: ChartPoint[]) => (arr.length === 0 ? 0 : arr.reduce((s, p) => s + (p.count ?? 0), 0));
    const avg = (arr: ChartPoint[]) => (arr.length === 0 ? 0 : sum(arr) / arr.length);

    return [
      { name: "Last 6M", count: Number(avg(last6).toFixed(1)) },
      { name: "Prev 6M", count: Number(avg(prev6).toFixed(1)) },
    ];
  }, [monthlySeries]);

  const chartData: ChartPoint[] = useMemo(() => {
    if (activeChartTab === "week") return weeklySeries;
    if (activeChartTab === "month") return monthlySeries;
    return sixMonthSeries;
  }, [activeChartTab, weeklySeries, monthlySeries, sixMonthSeries]);

  const sortedProjectDistribution: SystemStats["analytics"]["projectDistribution"] = useMemo(
    () =>
      [...projectDistribution].sort((a, b) => {
        const aValue = a?.value ?? 0;
        const bValue = b?.value ?? 0;
        if (bValue !== aValue) return bValue - aValue;
        const aName = (a?.name ?? "") as string;
        const bName = (b?.name ?? "") as string;
        return aName.localeCompare(bName);
      }),
    [projectDistribution]
  );

  const issueAgeBuckets = analytics?.issueAgeBuckets ?? [];

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 h-4 w-24 animate-pulse rounded bg-gray-200" />
                <div className="mb-2 h-8 w-16 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-32 animate-pulse rounded bg-gray-200" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="h-80 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="h-full animate-pulse rounded bg-gray-100" />
            </div>
            <div className="h-80 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="h-full animate-pulse rounded bg-gray-100" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
            <p className="text-lg font-medium">Error loading dashboard</p>
            <p className="mt-2 text-sm">{error}</p>
            <button onClick={loadDashboardStats} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white transition hover:bg-red-700">
              <Loader2 className="h-4 w-4 animate-spin" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Users" value={safeCounts.totalUsers} helper="Registered accounts" trendValue={safeTrends.usersTrend} iconColor="bg-blue-100" iconStroke="text-blue-600" iconPath="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          <StatCard title="Total Projects" value={safeCounts.totalProjects} helper="Active projects" trendValue={safeTrends.projectsTrend} iconColor="bg-green-100" iconStroke="text-green-600" iconPath="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          <StatCard title="Total Issues" value={safeCounts.totalIssues} helper="All issues" trendValue={0} iconColor="bg-purple-100" iconStroke="text-purple-600" iconPath="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          <StatCard title="Active Issues" value={safeCounts.activeIssues} helper="In progress" trendValue={safeTrends.activeIssuesTrend} iconColor="bg-orange-100" iconStroke="text-orange-600" iconPath="M13 10V3L4 14h7v7l9-11h-7z" />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-7 rounded-xl border border-gray-200 bg-white p-4 shadow-dashboard [&_*]:outline-none [&_*]:focus:outline-none">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">User Growth</h3>
              <div className="inline-flex rounded-full bg-gray-100 p-1 text-xs font-medium text-gray-600">
                {[
                  { key: "week", label: "Week" },
                  { key: "month", label: "Month" },
                  { key: "6m", label: "6 Months" },
                ].map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setActiveChartTab(option.key as typeof activeChartTab)}
                    className={`rounded-full px-3 py-1 transition ${
                      activeChartTab === option.key
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-[260px] [&_svg]:outline-none [&_svg]:focus:outline-none">
              {chartData.length === 0 ? (
                <EmptyState message="No user growth data yet" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 24, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS.blue} stopOpacity={0.35} />
                        <stop offset="95%" stopColor={CHART_COLORS.blue} stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="#e5e7eb" strokeDasharray="4 4" />
                    <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomAreaTooltip />} cursor={{ stroke: "#93c5fd", strokeWidth: 1 }} />
                    <Area type="monotone" dataKey="count" stroke={CHART_COLORS.blue} strokeWidth={3} fill="url(#colorUsers)" dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="relative rounded-xl border border-gray-200 bg-white p-4 shadow-dashboard [&_*]:outline-none [&_*]:focus:outline-none lg:col-span-5">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 text-left">Project Types</h3>
            <div className="h-[260px] [&_svg]:outline-none [&_svg]:focus:outline-none" onMouseLeave={() => setActiveIndex(-1)}>
              {projectDistribution.length === 0 ? (
                <EmptyState message="No project distribution data yet" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart style={{ outline: "none" }}>
                    <ActivePie
                      data={sortedProjectDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      startAngle={90}
                      endAngle={-270}
                      labelLine={false}
                      dataKey="value"
                      isAnimationActive
                      activeIndex={activeIndex}
                      activeShape={renderActiveProjectTypeShape}
                      onMouseEnter={(_: unknown, index: number) => setActiveIndex(index)}
                      onMouseLeave={() => setActiveIndex(-1)}
                    >
                      {sortedProjectDistribution.map((entry: SystemStats["analytics"]["projectDistribution"][number], index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.name === "scrum" ? CHART_COLORS.blue : CHART_COLORS.cyan} stroke="none" style={{ outline: "none" }} />
                      ))}
                    </ActivePie>
                  </PieChart>
                </ResponsiveContainer>
              )}
              {projectDistribution.length > 0 && (
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  {activeIndex >= 0 && activeIndex < sortedProjectDistribution.length ? (
                    <div className="text-center transform -translate-y-3">
                      <p className="text-xs font-medium text-gray-500">
                        {formatProjectTypeLabel(sortedProjectDistribution[activeIndex]?.name as string)}
                      </p>
                      <p className="text-3xl font-bold text-gray-800">
                        {sortedProjectDistribution[activeIndex]?.value ?? 0}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center transform -translate-y-3">
                      <p className="text-xs font-medium text-gray-500">Total Types</p>
                      <p className="text-3xl font-bold text-gray-800">{totalProjects}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            {sortedProjectDistribution.length > 0 && (
              <div className="mt-4">
                {sortedProjectDistribution.map((item) => {
                  const value = item?.value ?? 0;
                  const percent = totalProjects > 0 ? Math.round((value / totalProjects) * 100) : 0;
                  const color = item.name === "scrum" ? CHART_COLORS.blue : CHART_COLORS.cyan;
                  return (
                    <div key={item.name} className="flex items-center justify-between border-b border-gray-50 py-2 last:border-0">
                      <div className="flex items-center">
                        <span className="mr-2 h-3 w-3 rounded-sm" style={{ backgroundColor: color }} />
                        <span className="text-sm text-gray-700 capitalize">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{percent}%</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-dashboard lg:col-span-7 [&_*]:outline-none [&_*]:focus:outline-none">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 text-left">Issue Aging</h3>
              <span className="text-xs text-gray-500">Time to Resolve & Backlog</span>
            </div>
            <div className="issue-aging-chart h-[260px] [&_svg]:outline-none [&_svg]:focus:outline-none">
              {issueAgeBuckets.length === 0 ? (
                <EmptyState message="No issue data available" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={issueAgeBuckets} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="#e5e7eb" strokeDasharray="4 4" vertical={false} />
                    <XAxis dataKey="bucket" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip
                      content={<CustomBarTooltip />}
                      cursor={false}
                      shared={false}
                      animationDuration={0}
                      allowEscapeViewBox={{ x: true, y: true }}
                      wrapperStyle={{ position: "relative" }}
                    />
                    <Legend verticalAlign="top" height={36} iconType="square" />
                    <Bar dataKey="openCount" radius={[4, 4, 0, 0]} fill={CHART_COLORS.open} name="Open" />
                    <Bar dataKey="closedCount" radius={[4, 4, 0, 0]} fill={CHART_COLORS.closed} name="Closed" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-dashboard lg:col-span-5 [&_*]:outline-none [&_*]:focus:outline-none">
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Issue Resolution Efficiency</h3>
            <p className="mb-4 text-xs text-gray-500">Average time to close an issue</p>
            {analytics?.resolutionStats ? (
              <ResolutionEfficiencyCard resolutionStats={analytics.resolutionStats} />
            ) : (
              <EmptyState message="No resolution data available" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const StatCard = ({
  title,
  value,
  helper,
  trendValue,
  iconColor,
  iconStroke,
  iconPath,
}: {
  title: string;
  value: number;
  helper: string;
  trendValue: number;
  iconColor: string;
  iconStroke: string;
  iconPath: string;
}) => {
  const isUp = trendValue > 0;
  const isDown = trendValue < 0;
  const badgeColor = isUp ? "bg-green-50 text-green-700" : isDown ? "bg-red-50 text-red-700" : "bg-gray-100 text-gray-600";
  const Icon = isUp ? ArrowUp : isDown ? ArrowDown : Clock;
  const abs = Math.abs(trendValue);
  const formatted = `${isUp ? "+" : isDown ? "-" : ""}${abs.toFixed(1)}%`;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-dashboard">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <div className="mt-2 flex items-center gap-2">
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${badgeColor}`}>
              <Icon className="h-4 w-4" />
              {formatted}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500">{helper}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${iconColor} p-3`}>
          <svg className={`h-6 w-6 ${iconStroke}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
          </svg>
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ message }: { message: string }) => (
  <div className="flex h-full items-center justify-center rounded-md border border-dashed border-gray-200 bg-gray-50 text-sm text-gray-500">
    {message}
  </div>
);

const ResolutionTooltip = (props: EnhancedTooltipProps) => {
  const { active, payload, label } = props;
  if (!active || !payload || payload.length === 0) return null;
  const value = payload[0]?.value ?? 0;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-sm font-semibold text-gray-900">{label}</p>
      <p className="text-xs text-gray-600">
        <span className="font-semibold text-gray-900">{value.toFixed(1)}</span> days to resolve
      </p>
    </div>
  );
};

const ResolutionEfficiencyCard = ({
  resolutionStats,
}: {
  resolutionStats: SystemStats["analytics"]["resolutionStats"];
}) => {
  const { avgDays, trend, trendPercentage } = resolutionStats;
  const isFaster = trendPercentage !== null && trendPercentage < 0;
  const absTrend = trendPercentage !== null ? Math.abs(trendPercentage) : 0;

  const chartData = useMemo(() => {
    if (!trend || trend.length === 0) return [];
    return trend.map((item: { date: string; avgDays: number }) => ({
      name: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      days: item.avgDays,
    }));
  }, [trend]);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-4xl font-bold text-gray-900">
          {avgDays.toFixed(1)} <span className="text-sm font-normal text-gray-600">Days</span>
        </p>
      </div>

      {trendPercentage !== null && (
        <div
          className={`inline-flex w-full items-center justify-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium ${
            isFaster ? "bg-green-50 text-green-500" : "bg-red-50 text-red-500"
          }`}
        >
          {isFaster ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />}
          <span>
            Resolution time{" "}
            <strong>
              {isFaster ? "improved" : "increased"} by {absTrend.toFixed(1)}%
            </strong>{" "}
            vs last month
          </span>
        </div>
      )}

      {chartData.length > 0 && (
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 40 }}>
              <defs>
                <linearGradient id="colorResolution" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.cyan} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={CHART_COLORS.cyan} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#e5e7eb" strokeDasharray="4 4" />
              <XAxis
                dataKey="name"
                stroke="#6b7280"
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickCount={8}
                angle={-30}
                textAnchor="end"
                height={50}
              />
              <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip content={<ResolutionTooltip />} cursor={{ stroke: "#06b6d4", strokeWidth: 1 }} />
              <Area
                type="monotone"
                dataKey="days"
                stroke={CHART_COLORS.cyan}
                strokeWidth={2}
                fill="url(#colorResolution)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
