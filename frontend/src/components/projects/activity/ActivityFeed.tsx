import { useEffect } from "react";
import { useActivityStore } from "../../../stores/activityStore";
import ActivityItem from "./ActivityItem";
import { useSmartActivityPolling } from "../../../hooks/useSmartActivityPolling";

interface ActivityFeedProps {
  projectId: string;
}

// eslint-disable-next-line no-empty-pattern
const ActivityFeed = ({}: ActivityFeedProps) => {
  const { activities, isLoading, error } = useActivityStore();
  const { lastUpdated, manuallyRefetch } = useSmartActivityPolling();

  // Refetch khi component mount
  useEffect(() => {
    manuallyRefetch();
  }, [manuallyRefetch]);

  // Hiển thị loading state
  if (isLoading && activities.length === 0) {
    return <div className="space-y-4">aaa</div>;
  }

  // Hiển thị error state
  if (error) {
    return (
      <div className="text-center py-8 text-red-500 bg-red-50 rounded-lg">
        <p>{error}</p>
        <button
          onClick={() => manuallyRefetch()}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Thử lại
        </button>
      </div>
    );
  }

  // Hiển thị empty state
  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
          <span className="text-2xl">📋</span>
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có hoạt động nào</h3>
        <p className="mt-1 text-sm text-gray-500">Bắt đầu làm việc trên dự án để xem các hoạt động tại đây</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Hoạt động gần đây</h2>
        <button
          onClick={manuallyRefetch}
          className="text-xs text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {lastUpdated && (
            <span className="text-gray-500">
              {new Date(lastUpdated).toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </button>
      </div>

      <div className="max-h-[60vh] overflow-y-auto pr-2">
        {activities.map((activity) => (
          <ActivityItem key={activity.id} activity={activity} />
        ))}
      </div>

      {/* Nút xem thêm nếu có nhiều activities */}
      {activities.length >= 20 && (
        <div className="text-center mt-4">
          <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">Xem thêm hoạt động</button>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
