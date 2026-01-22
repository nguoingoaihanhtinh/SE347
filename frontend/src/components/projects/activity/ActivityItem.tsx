import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import type { ActivityAction, IActivity } from "../../../types/activity";
import UserAvatar from "@/components/ui/user/userAvatar";

interface ActivityItemProps {
  activity: IActivity;
  showProjectContext?: boolean;
}

const ActivityItem = ({ activity, showProjectContext = true }: ActivityItemProps) => {
  // Xử lý hiển thị action type
  const getActionText = () => {
    const actionMap: Record<ActivityAction, string> = {
      PROJECT_CREATED: "đã tạo dự án",
      PROJECT_UPDATED: "đã cập nhật dự án",
      PROJECT_DELETED: "đã xóa dự án",
      SPRINT_CREATED: "đã tạo sprint",
      SPRINT_UPDATED: "đã cập nhật sprint",
      SPRINT_DELETED: "đã xóa sprint",
      ISSUE_CREATED: "đã tạo issue",
      ISSUE_UPDATED: "đã cập nhật issue",
      ISSUE_DELETED: "đã xóa issue",
      ISSUE_MOVED: "đã di chuyển issue",
      COLUMN_CREATED: "đã tạo cột",
      COLUMN_UPDATED: "đã cập nhật cột",
      COLUMN_DELETED: "đã xóa cột",
      COLUMN_REORDERED: "đã sắp xếp lại cột",
      MEMBER_INVITED: "đã mời thành viên",
      MEMBER_JOINED: "đã tham gia",
      MEMBER_LEFT: "đã rời khỏi",
      MEMBER_REMOVED: "đã xóa thành viên",
      MEMBER_ROLE_UPDATED: "đã cập nhật vai trò",
    };

    return actionMap[activity.action_type] || activity.action_type.replace(/_/g, " ").toLowerCase();
  };

  // Xử lý hiển thị entity
  const getEntityText = () => {
    if (!showProjectContext) return "";

    const entityTypeMap: Record<string, string> = {
      project: "Dự án",
      sprint: "Sprint",
      issue: "Issue",
      comment: "Bình luận",
      column: "Cột",
    };

    return `${entityTypeMap[activity.issue_id ? "issue" : "project"] || "Mục"} #${activity.issue_id || activity.project_id}`;
  };

  return (
    <div className="flex gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="flex-shrink-0 mt-1">
        <UserAvatar userId={activity.user_id || "unknown"} size={32} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between">
          <div className="flex items-center gap-1">
            <span className="font-medium text-gray-900">{activity.user_name || "Người dùng"}</span>
            <span className="text-gray-500">{getActionText()}</span>
            {showProjectContext && <span className="text-gray-500">{getEntityText()}</span>}
          </div>

          <span className="text-xs text-gray-400 whitespace-nowrap">
            {formatDistanceToNow(new Date(activity.created_at), {
              addSuffix: true,
              locale: vi,
            })}
          </span>
        </div>

        {/* Hiển thị thay đổi chi tiết nếu có */}
        {activity.changes && activity.changes.length > 0 && (
          <div className="mt-2 pl-8 border-l-2 border-gray-200">
            {activity.changes.map((change, index) => (
              <div key={index} className="text-sm text-gray-600">
                {change.field}: <span className="text-gray-500 line-through">{change.old_value}</span> →{" "}
                <span className="font-medium text-blue-600">{change.new_value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityItem;
