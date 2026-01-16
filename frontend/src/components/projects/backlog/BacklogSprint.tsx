// src/components/projects/backlog/BacklogSprint.tsx
import { useState, useMemo, useRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FaChevronDown, FaChevronRight, FaPlus } from "react-icons/fa";
import { BsThreeDots } from "react-icons/bs";
import { Dropdown, type MenuProps } from "antd";
import type { ISprint } from "../../../types/sprint";
import type { IIssue } from "../../../types/issue";
import type { IColumn } from "../../../types/project";
import IssueCard from "./IssueCard";

import { useIssueStore } from "../../../stores/issueStore";
import { formatSprintDate } from "../../../modules/utils/date";
import { statusOptions } from "../../../constants/list";
import CreateIssueModal from "../../modals/CreateIssueModal";
import DeleteSprintModal from "../modals/DeleteSprintModal";

interface BacklogSprintProps {
  sprint: ISprint & { issues: IIssue[] };
  projectId: string;
  columns: IColumn[];
  isDragging: boolean;
  overItemId: string | null;
}

const BacklogSprint = ({ sprint, projectId, columns, isDragging, overItemId }: BacklogSprintProps) => {
  const { setNodeRef } = useSortable({
    id: sprint.id,
    data: {
      type: "Sprint",
      sprint,
    },
  });

  const { selectedIssues = {}, setSelectedIssues } = useIssueStore();
  const [isOpenButtonMenu, setIsOpenButtonMenu] = useState(false);
  const [isCreateIssueModalOpen, setIsCreateIssueModalOpen] = useState(false);
  const [isDeleteSprintModalOpen, setIsDeleteSprintModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  // ✅ SỬA LỖI: Sử dụng optional chaining và giá trị mặc định
  const isSprintIssuesChecked = !!selectedIssues?.[sprint.id]?.length;
  const [checkedState, setCheckedState] = useState(isSprintIssuesChecked);

  const estimate = useMemo(() => {
    return sprint.issues.reduce((total, issue) => total + (issue.storyPoint || 0), 0);
  }, [sprint.issues]);

  const buttonItems: MenuProps["items"] = [
    {
      label: "Edit Sprint",
      key: "edit-sprint",
      onClick: () => setIsCreateIssueModalOpen(true),
    },
    {
      label: "Delete Sprint",
      key: "delete-sprint",
      danger: true,
      onClick: () => setIsDeleteSprintModalOpen(true),
    },
  ];

  const handleDeleteSprint = async () => {
    console.log("Delete sprint:", sprint.id);
    // TODO: Implement actual delete logic
  };

  // ✅ SỬA LỖI: Cập nhật state và store chính xác
  const handleToggleSprintIssuesChecked = () => {
    const newState = !checkedState;
    setCheckedState(newState);

    if (newState) {
      // Tạo bản sao của selectedIssues hiện tại
      const newSelectedIssues = { ...selectedIssues };
      // Thêm tất cả issues của sprint vào mảng
      newSelectedIssues[sprint.id] = [...sprint.issues];
      setSelectedIssues(newSelectedIssues);
    } else {
      // Xóa sprint khỏi selectedIssues
      const newSelectedIssues = { ...selectedIssues };
      delete newSelectedIssues[sprint.id];
      setSelectedIssues(newSelectedIssues);
    }
  };

  // Cập nhật local state khi selectedIssues thay đổi
  useState(() => {
    setCheckedState(!!selectedIssues?.[sprint.id]?.length);
  }, [selectedIssues, sprint.id]);

  return (
    <div className="flex w-full flex-col gap-2">
      <div ref={setNodeRef} className="overflow-hidden rounded-sm border border-gray-200 bg-white shadow-sm">
        {/* Header */}
        <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-2 py-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <input
                type="checkbox"
                checked={checkedState}
                onChange={handleToggleSprintIssuesChecked}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <button
                title="Expand/Collapse Sprint"
                className="scale-110 text-gray-500 transition-colors hover:cursor-pointer hover:text-gray-900"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
              </button>
              <div className="flex flex-row items-center space-x-4">
                <h2 className="text-md font-semibold text-gray-700">{sprint.name}</h2>
                <div className="flex items-center space-x-3 text-sm">
                  <span className="text-sm text-gray-600">
                    {formatSprintDate(sprint.dateStarted)} - {formatSprintDate(sprint.dateEnded)}
                  </span>
                  <span className="text-xs font-medium text-gray-700">{sprint.issues.length} issues</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              {/* Column Count */}
              <div className="flex flex-row items-center space-x-3">
                {columns.map((column) => {
                  const count = sprint.issues.filter((issue) => issue.columnId === column.id).length;
                  const status = statusOptions.find((option) => option.key === column.name);
                  return (
                    <div
                      key={column.id}
                      className={`rounded-sm px-1.5 py-0.5 text-center ${status?.bgColor || "bg-gray-100"}`}
                    >
                      <div className={`text-xs font-semibold ${status?.textColor || "text-gray-900"}`}>{count}</div>
                    </div>
                  );
                })}
              </div>

              {/* Add Issue Button */}
              <div className="flex items-center space-x-3">
                <div
                  className={`rounded-lg border ${
                    isDragging ? "border-emerald-500 bg-emerald-50" : "border-gray-300"
                  } px-1 py-1 text-sm shadow-sm transition-colors`}
                >
                  <span className="text-sm font-semibold text-gray-900">
                    {new Date(sprint.dateStarted).getTime() < new Date().getTime() ? "Complete Sprint" : "Start Sprint"}
                  </span>
                </div>

                <Dropdown
                  menu={{ items: buttonItems }}
                  trigger={["click"]}
                  onOpenChange={setIsOpenButtonMenu}
                  open={isOpenButtonMenu}
                >
                  <div
                    className={`rounded-sm border-2 p-1 text-gray-500 transition-colors hover:cursor-pointer hover:bg-gray-100 hover:text-gray-900 ${
                      isOpenButtonMenu ? "border-emerald-500" : "border-transparent"
                    }`}
                  >
                    <BsThreeDots size={16} />
                  </div>
                </Dropdown>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        {isExpanded && (
          <div className="flex flex-col gap-2 divide-y divide-gray-100 bg-[#f8f8f8] p-2">
            <div>
              {sprint.issues.length > 0 ? (
                sprint.issues.map((issue) => (
                  <div key={issue.id} className="group relative my-1">
                    <IssueCard
                      issue={issue}
                      projectId={projectId}
                      columns={columns}
                      isDragging={isDragging}
                      overItemId={overItemId}
                      setIsSprintIssuesChecked={() => {}} // Không cần dùng nữa
                    />
                    {/* Line DragOverlay */}
                    <div
                      style={{
                        opacity: isDragging && issue.id === overItemId ? 1 : 0,
                      }}
                      className="absolute bottom-[-6px] left-0 z-50 flex w-full flex-row items-center"
                    >
                      <div className="z-50 rounded-[100%] border-1 border-emerald-500 p-1" />
                      <div className="h-[2px] w-full bg-emerald-500" />
                    </div>
                  </div>
                ))
              ) : (
                <div
                  className={`border-3 py-3 text-center text-sm ${
                    isDragging
                      ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                      : "border-dashed border-gray-400 text-gray-500"
                  }`}
                >
                  {isDragging ? "Drop issues here" : "No issues in this sprint"}
                </div>
              )}
            </div>

            <div
              onClick={() => setIsCreateIssueModalOpen(true)}
              className="flex items-center space-x-2 rounded-sm bg-transparent p-2 text-gray-700 hover:cursor-pointer hover:bg-gray-200"
            >
              <FaPlus size={16} />
              <span className="text-sm font-semibold">Create Issue</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex h-full flex-row items-center">
        <div className="flex flex-1 flex-row items-center justify-end gap-1">
          <div className="flex h-full gap-2">
            <span className="text-sm font-medium text-gray-600">{sprint.issues.length} work items</span>
            <span className="text-sm font-semibold text-gray-600">|</span>
            <span className="text-sm font-medium text-gray-600">
              Estimate: <span className="text-sm font-bold text-gray-800">{estimate}</span>
            </span>
          </div>
        </div>
      </div>

      <CreateIssueModal
        isOpen={isCreateIssueModalOpen}
        onClose={() => setIsCreateIssueModalOpen(false)}
        projectId={projectId}
        defaultSprintId={sprint.id !== "backlog" ? sprint.id : undefined}
      />

      {sprint.id !== "backlog" && (
        <DeleteSprintModal
          isOpen={isDeleteSprintModalOpen}
          onClose={() => setIsDeleteSprintModalOpen(false)}
          onConfirm={handleDeleteSprint}
          sprintName={sprint.name}
        />
      )}
    </div>
  );
};

export default BacklogSprint;
