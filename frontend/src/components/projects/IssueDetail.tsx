import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import { useIssueStore } from "../../stores/issueStore";
import { useColumnStore } from "../../stores/columnStore";
import { useSprintStore } from "../../stores/sprintStore";
import { useProjectStore } from "../../stores/projectStore";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import { IoLockClosedOutline } from "react-icons/io5";
import { FaEye, FaEdit, FaCheck, FaTimes, FaRegCommentAlt } from "react-icons/fa";
import { CiShare2 } from "react-icons/ci";
import { BsThreeDots } from "react-icons/bs";
import { IoIosClose } from "react-icons/io";
import IconRenderer from "../ui/IconRenderer";
import UserAvatar from "../ui/user/userAvatar";

const ISSUE_TYPES = ["task", "story", "bug", "epic"] as const;
const ISSUE_PRIORITIES = ["low", "medium", "high", "critical"] as const;

interface IssueDetailProps {
  selectedIssueId: string;
  onClose: () => void;
  projectId?: string;
}

const EditableField = ({
  label,
  value,
  onSave,
  type = "text",
  options = null,
  renderDisplay = null,
  isUpdating = false,
}: {
  label: string;
  value: any;
  onSave: (newValue: any) => Promise<void>;
  type?: "text" | "textarea" | "date" | "number";
  options?: { value: string; label: string }[] | null;
  renderDisplay?: (val: any) => React.ReactNode;
  isUpdating?: boolean;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = async () => {
    if (editValue !== value) {
      await onSave(editValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{label}</span>
          <div className="flex gap-1">
            <button
              onClick={handleSave}
              disabled={isUpdating}
              className="p-1 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
              title="Lưu"
            >
              <FaCheck size={12} />
            </button>
            <button onClick={handleCancel} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Hủy">
              <FaTimes size={12} />
            </button>
          </div>
        </div>

        {options ? (
          <select
            value={editValue ?? ""}
            onChange={(e) => setEditValue(e.target.value)}
            disabled={isUpdating}
            className="w-full p-2 border border-blue-400 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
            autoFocus
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : type === "textarea" ? (
          <textarea
            value={editValue ?? ""}
            onChange={(e) => setEditValue(e.target.value)}
            disabled={isUpdating}
            className="w-full p-2 border border-blue-400 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
            rows={4}
            autoFocus
          />
        ) : type === "date" ? (
          <input
            type="date"
            value={editValue ?? ""}
            onChange={(e) => setEditValue(e.target.value)}
            disabled={isUpdating}
            className="w-full p-2 border border-blue-400 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
            autoFocus
          />
        ) : type === "number" ? (
          <input
            type="number"
            value={editValue ?? 0}
            onChange={(e) => setEditValue(Number(e.target.value))}
            disabled={isUpdating}
            className="w-full p-2 border border-blue-400 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
            autoFocus
          />
        ) : (
          <input
            type="text"
            value={editValue ?? ""}
            onChange={(e) => setEditValue(e.target.value)}
            disabled={isUpdating}
            className="w-full p-2 border border-blue-400 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
            autoFocus
          />
        )}

        {isUpdating && <p className="text-xs text-blue-600 mt-1 italic">Đang lưu...</p>}
      </div>
    );
  }

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1 text-xs text-gray-500">
        <span>{label}</span>
        <button
          onClick={() => setIsEditing(true)}
          className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          title={`Chỉnh sửa ${label}`}
        >
          <FaEdit size={12} />
        </button>
      </div>
      <div className="p-2 bg-gray-50 rounded-md min-h-[2.25rem] flex items-center">
        {renderDisplay ? (
          renderDisplay(value)
        ) : (
          <span className="text-sm font-medium text-gray-800">{value ?? "Chưa đặt"}</span>
        )}
      </div>
    </div>
  );
};

const DetailsSection = ({ selectedIssue, onUpdate, isUpdating }: any) => {
  const handleSave = async (field: string, value: any) => {
    await onUpdate({ [field]: value });
  };

  return (
    <div className="rounded-lg border border-gray-200 p-4 mb-4 group">
      <h2 className="text-lg font-semibold text-gray-700 mb-3">Mô tả</h2>
      <EditableField
        label="Mô tả chi tiết"
        value={selectedIssue.description || ""}
        onSave={(value) => handleSave("description", value)}
        type="textarea"
        isUpdating={isUpdating}
        renderDisplay={(value) => (
          <p className="text-sm text-gray-700 whitespace-pre-line">{value || "Chưa có mô tả"}</p>
        )}
      />
    </div>
  );
};

const ActivitySection = ({ issueId }: { issueId: string }) => (
  <div className="rounded-lg border border-gray-200 p-4">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-semibold text-gray-700">Hoạt động</h2>
      <button className="text-xs font-medium text-blue-600 hover:text-blue-800">Xem tất cả</button>
    </div>
    <div className="space-y-4 text-sm text-gray-600">Hiện chưa có hoạt động nào được ghi nhận.</div>
  </div>
);

const MetadataSection = ({ selectedIssue, columns, sprints, onUpdate, isUpdating }: any) => {
  const handleSave = async (field: string, value: any) => {
    await onUpdate({ [field]: value });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {/* Issue Details */}
      <div className="rounded-lg border border-gray-200 p-4 group bg-white shadow-sm">
        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
          <span className="mr-2">📋</span> Thông tin issue
        </h3>
        <div className="space-y-4">
          <EditableField
            label="Loại"
            value={selectedIssue.type}
            onSave={(value) => handleSave("type", value)}
            options={ISSUE_TYPES.map((t) => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) }))}
            isUpdating={isUpdating}
            renderDisplay={(value) => (
              <div className="flex items-center gap-2">
                <div
                  className={`rounded p-1 ${value === "bug" ? "bg-red-100" : value === "task" ? "bg-blue-100" : value === "story" ? "bg-green-100" : "bg-purple-100"}`}
                >
                  <IconRenderer type={value} className="h-4 w-4" />
                </div>
                <span className="font-medium capitalize">{value}</span>
              </div>
            )}
          />

          <EditableField
            label="Độ ưu tiên"
            value={selectedIssue.priority}
            onSave={(value) => handleSave("priority", value)}
            options={ISSUE_PRIORITIES.map((p) => ({ value: p, label: p.charAt(0).toUpperCase() + p.slice(1) }))}
            isUpdating={isUpdating}
            renderDisplay={(value) => (
              <span
                className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  value === "high"
                    ? "bg-red-100 text-red-800"
                    : value === "medium"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                }`}
              >
                {value}
              </span>
            )}
          />

          <EditableField
            label="Trạng thái"
            value={selectedIssue.columnId}
            onSave={(value) => handleSave("columnId", value)}
            options={columns.map((c: any) => ({ value: c.id, label: c.name }))}
            isUpdating={isUpdating}
            renderDisplay={(value) => {
              const col = columns.find((c: any) => c.id === value);
              return (
                <span
                  className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    col?.name === "DONE"
                      ? "bg-green-100 text-green-800"
                      : col?.name === "IN PROGRESS"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {col?.name || "To Do"}
                </span>
              );
            }}
          />

          <EditableField
            label="Story Points"
            value={selectedIssue.storyPoint ?? 0}
            onSave={(value) => handleSave("storyPoint", Number(value))}
            type="number"
            isUpdating={isUpdating}
            renderDisplay={(value) => <span className="font-medium">{value} pts</span>}
          />

          <EditableField
            label="Sprint"
            value={selectedIssue.sprintId ?? ""}
            onSave={(value) => handleSave("sprintId", value || null)}
            options={[{ value: "", label: "Backlog" }, ...sprints.map((s: any) => ({ value: s.id, label: s.name }))]}
            isUpdating={isUpdating}
            renderDisplay={(value) => {
              const sprint = sprints.find((s: any) => s.id === value);
              return <span className="font-medium">{sprint?.name || "Backlog"}</span>;
            }}
          />
        </div>
      </div>

      {/* Timeline */}
      <div className="rounded-lg border border-gray-200 p-4 group bg-white shadow-sm">
        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
          <span className="mr-2">📅</span> Thời gian
        </h3>
        <div className="space-y-3 text-sm">
          <div>
            <span className="text-gray-500">Tạo lúc</span>
            <p className="font-medium">{format(new Date(selectedIssue.createdAt), "dd/MM/yyyy HH:mm")}</p>
          </div>
          <div>
            <span className="text-gray-500">Cập nhật lúc</span>
            <p className="font-medium">{format(new Date(selectedIssue.updatedAt), "dd/MM/yyyy HH:mm")}</p>
          </div>

          <EditableField
            label="Due Date From"
            value={selectedIssue.dueDateFrom ? new Date(selectedIssue.dueDateFrom).toISOString().split("T")[0] : ""}
            onSave={(value) => handleSave("dueDateFrom", value ? new Date(value).toISOString() : null)}
            type="date"
            isUpdating={isUpdating}
            renderDisplay={(v) => (v ? format(new Date(v), "dd/MM/yyyy") : "Chưa đặt")}
          />

          <EditableField
            label="Due Date To"
            value={selectedIssue.dueDateTo ? new Date(selectedIssue.dueDateTo).toISOString().split("T")[0] : ""}
            onSave={(value) => handleSave("dueDateTo", value ? new Date(value).toISOString() : null)}
            type="date"
            isUpdating={isUpdating}
            renderDisplay={(v) => (v ? format(new Date(v), "dd/MM/yyyy") : "Chưa đặt")}
          />
        </div>
      </div>

      {/* People */}
      <div className="md:col-span-2 rounded-lg border border-gray-200 p-4 group bg-white shadow-sm">
        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
          <span className="mr-2">👥</span> Người liên quan
        </h3>
        <div className="space-y-4">
          <div>
            <span className="text-xs text-gray-500">Người tạo</span>
            <div className="mt-1 flex items-center gap-2">
              <UserAvatar userId={selectedIssue.reporterId} size={28} />
              <span className="font-medium">{selectedIssue.reporterId || "Unknown"}</span>
            </div>
          </div>

          <EditableField
            label="Người thực hiện"
            value={selectedIssue.assigneeId ?? ""}
            onSave={(value) => handleSave("assigneeId", value || null)}
            options={[
              { value: "", label: "Chưa phân công" },
              // Thêm user thật nếu có API user
              { value: "user1", label: "User 1" },
              { value: "user2", label: "User 2" },
            ]}
            isUpdating={isUpdating}
            renderDisplay={(value) =>
              value ? (
                <div className="flex items-center gap-2">
                  <UserAvatar userId={value} size={28} />
                  <span className="font-medium">{value}</span>
                </div>
              ) : (
                <span className="text-gray-500 italic">Chưa phân công</span>
              )
            }
          />
        </div>
      </div>
    </div>
  );
};

const CommentSection = () => (
  <div className="rounded-lg border border-gray-200 p-4">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
        <FaRegCommentAlt /> Bình luận
      </h3>
      <span className="text-sm text-gray-500">Chưa có bình luận</span>
    </div>
    <textarea
      placeholder="Viết bình luận..."
      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
    />
    <div className="mt-3 flex justify-end">
      <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">Gửi</button>
    </div>
  </div>
);

const IssueDetail = ({ selectedIssueId, onClose, projectId: propProjectId }: IssueDetailProps) => {
  const { projectId: paramProjectId } = useParams<{ projectId: string }>();
  const { currentProject } = useProjectStore();

  const effectiveProjectId = propProjectId || paramProjectId || currentProject?.id;

  const { columns } = useColumnStore();
  const { sprints } = useSprintStore();
  const { getIssueById, updateIssue, fetchIssuesByProject } = useIssueStore();

  const selectedIssue = getIssueById(selectedIssueId);

  const [localIssue, setLocalIssue] = useState(selectedIssue);
  const [isUpdating, setIsUpdating] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedIssue) {
      setLocalIssue(selectedIssue);
    }
  }, [selectedIssue]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleUpdate = useCallback(
    async (updates: Partial<any>) => {
      if (!effectiveProjectId || !selectedIssueId) {
        toast.error("Không thể cập nhật: thiếu project ID hoặc issue ID");
        console.error("Missing projectId or issueId", { effectiveProjectId, selectedIssueId });
        return;
      }

      const oldIssue = { ...localIssue };
      setLocalIssue((prev) => ({ ...prev, ...updates }));
      setIsUpdating(true);

      try {
        await updateIssue(effectiveProjectId, selectedIssueId, updates);
        toast.success("Cập nhật thành công!");
        await fetchIssuesByProject(effectiveProjectId);
      } catch (error: any) {
        console.error("Update failed:", error);
        toast.error(`Cập nhật thất bại: ${error.message || "Lỗi hệ thống"}`);
        setLocalIssue(oldIssue);
      } finally {
        setIsUpdating(false);
      }
    },
    [effectiveProjectId, selectedIssueId, localIssue, updateIssue, fetchIssuesByProject],
  );

  if (!localIssue) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">Đang tải thông tin issue...</div>;
  }

  return (
    <div ref={ref} className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition">
              <IoIosClose size={28} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 truncate max-w-[300px]">{localIssue.title}</h1>
              <p className="text-sm text-gray-500 font-mono">{localIssue.key}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button className="p-2 rounded hover:bg-gray-100" title="Watch">
              <FaEye size={18} />
            </button>
            <button className="p-2 rounded hover:bg-gray-100" title="More actions">
              <BsThreeDots size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <MetadataSection
          selectedIssue={localIssue}
          columns={columns}
          sprints={sprints}
          onUpdate={handleUpdate}
          isUpdating={isUpdating}
        />
        <DetailsSection selectedIssue={localIssue} onUpdate={handleUpdate} isUpdating={isUpdating} />
        <ActivitySection issueId={localIssue.id} />
        <CommentSection />
      </div>
    </div>
  );
};

export default IssueDetail;
