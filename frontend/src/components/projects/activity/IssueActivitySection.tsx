import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useActivityStore } from "../../../stores/activityStore";
import { Clock, RefreshCw, Activity } from "lucide-react";
import { formatRelative } from "date-fns";
import { vi } from "date-fns/locale";

interface IssueActivitySectionProps {
  issueId: string;
}

// ── ActivityItem (copy UI đẹp từ tmp, nhưng dùng props activity từ store) ──
const ActivityItem = ({ activity }: { activity: any }) => {
  // tạm dùng any để không đụng type, sau này bạn có thể thay bằng type thật
  const getActionText = () => {
    switch (activity.action_type) {
      case "update":
        return "đã cập nhật issue";
      case "create":
        return "đã tạo issue";
      case "move":
        return "đã di chuyển issue";
      default:
        return activity.action_type;
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      critical: "text-red-600 bg-red-50",
      high: "text-orange-600 bg-orange-50",
      medium: "text-yellow-600 bg-yellow-50",
      low: "text-blue-600 bg-blue-50",
    };
    return colors[priority] || "text-gray-600 bg-gray-50";
  };

  const formatTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return "vừa xong";
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    return `${Math.floor(diff / 86400)} ngày trước`;
  };

  return (
    <div className="group relative">
      {/* Timeline line */}
      <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-gray-200 group-last:hidden" />
      <div className="flex gap-4 pb-6">
        {/* Avatar */}
        <div className="flex-shrink-0 relative z-10">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white font-semibold shadow-sm">
            {activity.user_name?.charAt(0).toUpperCase() || "A"}
          </div>
        </div>
        {/* Content */}
        <div className="flex-1 min-w-0 pt-1">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="font-semibold text-gray-900">{activity.user_name || "Anonymous"}</span>
                <span className="text-gray-600 text-sm">{getActionText()}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 flex-shrink-0">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTime(activity.created_at)}</span>
            </div>
          </div>
          {/* Changes */}
          {activity.changes && activity.changes.length > 0 && (
            <div className="mt-3 space-y-2">
              {activity.changes.map((change: any, idx: number) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-gray-700 min-w-[80px]">{change.field || "—"}:</span>
                    <div className="flex items-center gap-2 flex-1">
                      {change.old_value && (
                        <>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium line-through ${
                              change.field === "priority"
                                ? getPriorityColor(change.old_value)
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {change.old_value}
                          </span>
                          <span className="text-gray-400">→</span>
                        </>
                      )}
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          change.field === "priority"
                            ? getPriorityColor(change.new_value || "")
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {change.new_value || "trống"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main Component ──
const IssueActivitySection = ({ issueId }: IssueActivitySectionProps) => {
  const { projectId } = useParams<{ projectId: string }>();
  const { activities, lastUpdated, fetchProjectActivities, refetchImmediately } = useActivityStore();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const issueActivities = useMemo(() => {
    return activities
      .filter((activity) => {
        const matchesIssue = activity.issue_id && activity.issue_id === issueId;
        return matchesIssue;
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [activities, issueId]);

  // Auto-fetch (giữ nguyên useMemo như file cũ)
  useMemo(() => {
    if (projectId) {
      fetchProjectActivities(projectId);
    }
  }, [fetchProjectActivities, projectId]);

  const handleRefresh = () => {
    if (projectId) {
      setIsRefreshing(true);
      refetchImmediately(projectId);
      // Giả lập delay để thấy spin (có thể bỏ nếu không cần)
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  if (issueActivities.length === 0) {
    return (
      <div className="border-t border-gray-200 pt-6">
        <div className="text-center py-12 px-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Activity className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có hoạt động nào</h3>
          <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
            Các thao tác như cập nhật, di chuyển issue sẽ được ghi lại tại đây
          </p>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Làm mới
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-200 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 px-1">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Activity className="w-5 h-5 text-gray-600" />
          Hoạt động của issue
        </h3>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <span className="text-xs text-gray-500">{formatRelative(lastUpdated, new Date(), { locale: vi })}</span>
          )}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Làm mới
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-[500px] overflow-y-auto px-1">
        <div className="space-y-0">
          {issueActivities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default IssueActivitySection;
