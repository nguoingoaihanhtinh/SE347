import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useActivityStore } from "../../../stores/activityStore";
import ActivityItem from "./ActivityItem";
import { formatRelative } from "date-fns";
import { vi } from "date-fns/locale";

const ProjectActivityFeed = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { activities, error, lastUpdated, fetchProjectActivities, refetchImmediately } = useActivityStore();

  // Auto-fetch when component mounts
  useMemo(() => {
    if (projectId) {
      fetchProjectActivities(projectId);
    }
  }, [fetchProjectActivities, projectId]);

  // Manual refresh handler
  const handleRefresh = () => {
    if (projectId) {
      refetchImmediately(projectId);
    }
  };

  // Hiển thị error state
  if (error) {
    return (
      <div className="p-4 text-center text-red-500 bg-red-50 rounded-lg">
        <p>{error}</p>
        <button
          onClick={handleRefresh}
          className="mt-2 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="border rounded-lg bg-white p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <span>🚀</span>
          Hoạt động gần đây
        </h2>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition-colors"
          title="Làm mới"
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
            <span className="text-gray-500">{formatRelative(lastUpdated, new Date(), { locale: vi })}</span>
          )}
        </button>
      </div>

      <div className="max-h-[60vh] overflow-y-auto pr-2">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl mb-2">
              📋
            </div>
            <p className="font-medium">Chưa có hoạt động nào</p>
            <p className="text-sm mt-1">Bắt đầu làm việc trên dự án để xem các hoạt động tại đây</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} showProjectContext={true} />
            ))}
          </div>
        )}
      </div>

      {/* Nút xem thêm nếu có nhiều activities */}
      {activities.length >= 20 && (
        <div className="text-center mt-4 pt-2 border-t border-gray-100">
          <button className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
            Xem thêm hoạt động
          </button>
        </div>
      )}
    </div>
  );
};

export default ProjectActivityFeed;
