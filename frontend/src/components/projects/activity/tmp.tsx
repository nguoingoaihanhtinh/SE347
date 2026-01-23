import React from "react";
import { Clock, RefreshCw, Activity } from "lucide-react";

// Mock data structure
interface ActivityChange {
  field: string;
  old_value: string | null;
  new_value: string | null;
}

interface ActivityData {
  id: string;
  user_name: string;
  action_type: string;
  created_at: string;
  changes?: ActivityChange[];
  entity_name?: string;
}

// Activity Item Component với spacing cải thiện
const ActivityItem = ({ activity }: { activity: ActivityData }) => {
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
              {activity.changes.map((change, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-gray-700 min-w-[80px]">{change.field}:</span>
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
                        {change.new_value}
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

// Main Component
const ImprovedIssueActivitySection = () => {
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Mock activities với static dates
  const activities: ActivityData[] = [
    {
      id: "1",
      user_name: "John Doe",
      action_type: "update",
      created_at: "2026-01-23T10:48:00Z",
      changes: [{ field: "priority", old_value: "low", new_value: "critical" }],
    },
    {
      id: "2",
      user_name: "Anonymous",
      action_type: "update",
      created_at: "2026-01-23T10:45:00Z",
      changes: [{ field: "priority", old_value: "medium", new_value: "low" }],
    },
    {
      id: "3",
      user_name: "John Doe",
      action_type: "update",
      created_at: "2026-01-23T10:32:00Z",
      changes: [{ field: "status", old_value: "todo", new_value: "in_progress" }],
    },
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  if (activities.length === 0) {
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
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" />
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
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          Làm mới
        </button>
      </div>

      {/* Activity List */}
      <div className="max-h-[500px] overflow-y-auto px-1">
        <div className="space-y-0">
          {activities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImprovedIssueActivitySection;
