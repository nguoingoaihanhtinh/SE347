import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useActivityStore } from "../../../stores/activityStore";
import ActivityItem from "./ActivityItem";
import { formatRelative } from "date-fns";
import { vi } from "date-fns/locale";

interface IssueActivitySectionProps {
  issueId: string;
}

const IssueActivitySection = ({ issueId }: IssueActivitySectionProps) => {
  const { projectId } = useParams<{ projectId: string }>();
  const { activities, lastUpdated, fetchProjectActivities, refetchImmediately } = useActivityStore();

  // ✅ TỐI ƯU FILTER: Xử lý cả trường hợp issueId trong entity_id và issue_id
  const issueActivities = useMemo(() => {
    return activities
      .filter((activity) => {
        // ✅ LỌC LINH HOẠT: hỗ trợ cả định dạng cũ và mới
        const matchesIssue = activity.issue_id && activity.issue_id === issueId;

        return matchesIssue;
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [activities, issueId]);

  // Auto-fetch khi component mount
  useMemo(() => {
    if (projectId) {
      fetchProjectActivities(projectId);
    }
  }, [fetchProjectActivities, projectId]);

  // ✅ THÊM NÚT REFRESH THỦ CÔNG CHO DEBUG
  const handleRefresh = () => {
    if (projectId) {
      refetchImmediately(projectId);
    }
  };

  // Hiển thị empty state với nút refresh
  if (issueActivities.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 border rounded-lg">
        <div className="mx-auto w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-2">
          <span className="text-xl">🔍</span>
        </div>
        <p className="font-medium">Chưa có hoạt động nào cho issue này</p>
        <p className="text-xs mt-1 mb-2">Các thao tác như cập nhật, di chuyển issue sẽ được ghi lại tại đây</p>
        <button
          onClick={handleRefresh}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 mx-auto"
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
          Làm mới
        </button>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-200 pt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <span>📋</span>
          Hoạt động của issue
        </h3>
        <span className="text-xs text-gray-400">
          {lastUpdated && formatRelative(lastUpdated, new Date(), { locale: vi })}
        </span>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {issueActivities.map((activity) => (
          <ActivityItem key={activity.id} activity={activity} showProjectContext={false} />
        ))}
      </div>
    </div>
  );
};

export default IssueActivitySection;
