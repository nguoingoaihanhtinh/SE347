import { useState, useMemo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { FaChevronDown, FaChevronRight, FaEdit, FaPlus } from "react-icons/fa";
import { BsThreeDots } from "react-icons/bs";
import { Dropdown, type MenuProps } from "antd";
import type { ISprint } from "../../../types/sprint";
import type { IIssue } from "../../../types/issue";
import type { IColumn } from "../../../types/project";
import IssueCard from "./IssueCard";
import QuickCreateIssue from "./QuickCreateIssue";
import { useIssueStore } from "../../../stores/issueStore";
// import { useDeleteSprint } from "../../../hooks/useSprint";
import { formatSprintDate } from "../../../modules/utils/date";
import { statusOptions } from "../../../constants/list";
import CreateIssueModal from "../../modals/CreateIssueModal";
import DeleteSprintModal from "../modals/DeleteSprintModal";
import CreateSprintModal from "../../modals/CreateSprintModal";

interface BacklogSprintProps {
  sprint: ISprint & { issues: IIssue[] };
  projectId: string;
  columns: IColumn[];
  isDragging: boolean;
  overItemId: string | null;
}

const BacklogSprint = ({ sprint, projectId, columns, isDragging, overItemId }: BacklogSprintProps) => {
  const { setNodeRef, isDragging: isSprintDragging } = useSortable({
    id: sprint.id,
    data: { type: "Sprint", sprint },
  });
  const { selectedIssues, setSelectedIssues, clearSelectedIssues } = useIssueStore();
  // const { deleteSprint } = useDeleteSprint();
  const [isOpenButtonMenu, setIsOpenButtonMenu] = useState(false);
  const [isCreateIssueModalOpen, setIsCreateIssueModalOpen] = useState(false);
  const [isEditSprintModalOpen, setIsEditSprintModalOpen] = useState(false);
  const [isDeleteSprintModalOpen, setIsDeleteSprintModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  // Tính toán checkedState dựa trên selectedIssues thực tế
  const sprintSelectedIssues = selectedIssues[sprint.id] || [];
  const checkedState = sprintSelectedIssues.length > 0 && sprintSelectedIssues.length === sprint.issues.length;

  const estimate = useMemo(() => {
    return sprint.issues.reduce((total, issue) => total + (issue.storyPoint || 0), 0);
  }, [sprint.issues]);

  const buttonItems: MenuProps["items"] = [
    {
      label: "Edit Sprint",
      key: "edit-sprint",
      icon: <FaEdit className="text-gray-500" />,
      onClick: () => setIsEditSprintModalOpen(true),
    },
    {
      label: "Delete Sprint",
      key: "delete-sprint",
      danger: true,
      icon: <BsThreeDots className="text-red-500" />,
      onClick: () => setIsDeleteSprintModalOpen(true),
    },
  ];

  const handleToggleSprintIssuesChecked = () => {
    const newState = !checkedState;
    if (newState) {
      // Chọn tất cả issues trong sprint
      setSelectedIssues(sprint.id, [...sprint.issues]);
    } else {
      // Bỏ chọn tất cả
      clearSelectedIssues(sprint.id);
    }
  };

  // Xác định trạng thái của sprint
  const isCompleted = new Date(sprint.dateEnded) < new Date();
  const sprintStatus = isCompleted ? "Completed" : "Active";

  return (
    <div
      ref={setNodeRef}
      className={`flex w-full flex-col border rounded-lg shadow-sm transition-all duration-200 ${
        isSprintDragging ? "border-blue-500 shadow-lg scale-[1.01] z-10" : "border-gray-200"
      } ${isDragging ? "opacity-70" : ""}`}
    >
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-gray-50 to-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <input
              type="checkbox"
              checked={checkedState}
              onChange={handleToggleSprintIssuesChecked}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              aria-label={`Select all issues in ${sprint.name}`}
            />
            <button
              title="Expand/Collapse Sprint"
              className="text-gray-500 hover:text-gray-900 transition-colors p-1 rounded hover:bg-gray-100"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-expanded={isExpanded}
              aria-controls={`sprint-content-${sprint.id}`}
            >
              {isExpanded ? <FaChevronDown size={14} /> : <FaChevronRight size={14} />}
            </button>
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold text-gray-700 truncate">{sprint.name}</h2>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span>
                  {formatSprintDate(sprint.dateStarted)} - {formatSprintDate(sprint.dateEnded)}
                </span>
                <span>
                  {sprint.issues.length} issues • Est: {estimate} pts
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Column Count */}
            <div className="flex space-x-1">
              {columns.map((column) => {
                const count = sprint.issues.filter((issue) => issue.columnId === column.id).length;
                const status = statusOptions.find((option) => option.key === column.name);
                return (
                  <div
                    key={column.id}
                    className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                      status?.bgColor || "bg-gray-100"
                    } ${status?.textColor || "text-gray-900"}`}
                    title={`${column.name}: ${count} issues`}
                  >
                    {count}
                  </div>
                );
              })}
            </div>
            {/* Actions */}
            <div className="flex items-center space-x-2">
              <div
                className={`px-3 py-1 rounded-md text-xs font-medium border transition-all ${
                  isCompleted
                    ? "border-gray-300 bg-gray-100 text-gray-700"
                    : "border-green-300 bg-green-50 text-green-700"
                }`}
              >
                {sprintStatus}
              </div>
              {sprint.id !== "backlog" && (
                <Dropdown
                  menu={{ items: buttonItems }}
                  trigger={["click"]}
                  open={isOpenButtonMenu}
                  onOpenChange={setIsOpenButtonMenu}
                >
                  <button
                    className="p-1.5 rounded border-2 border-transparent hover:border-gray-300 hover:bg-gray-100 transition-all"
                    aria-label="Sprint actions"
                  >
                    <BsThreeDots size={16} />
                  </button>
                </Dropdown>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div id={`sprint-content-${sprint.id}`} className={`${isExpanded ? "block" : "hidden"}`}>
        <div className="p-4 space-y-3 bg-gray-50">
          {/* Issues List */}
          <div className="space-y-2 min-h-[100px]">
            {sprint.issues.length > 0 ? (
              sprint.issues.map((issue) => (
                <div key={issue.id} className="group relative">
                  <IssueCard
                    issue={issue}
                    projectId={projectId}
                    columns={columns}
                    isDragging={isDragging}
                    overItemId={overItemId}
                  />
                  {isDragging && issue.id === overItemId && (
                    <div className="absolute -bottom-2 left-0 right-0 h-1 bg-emerald-500 rounded-full z-10" />
                  )}
                </div>
              ))
            ) : (
              <div
                className={`flex items-center justify-center h-24 rounded-lg border-2 p-4 text-sm transition-all ${
                  isDragging
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-dashed border-gray-300 text-gray-500"
                }`}
              >
                {isDragging ? "Drop issues here" : "No issues yet. Create one below!"}
              </div>
            )}
          </div>

          {/* Quick Create */}
          <div className="pt-4 border-t border-gray-200">
            <QuickCreateIssue projectId={projectId} sprintId={sprint.id} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t bg-white flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {sprint.issues.length} items • {estimate} pts
        </div>
        <div className="flex items-center space-x-2">
          {sprint.id !== "backlog" && (
            <button
              onClick={() => setIsEditSprintModalOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              aria-label={`Edit ${sprint.name}`}
            >
              <FaEdit size={12} />
              Edit
            </button>
          )}

          {/* Nút Add Issue - đã sửa để mở modal */}
          <button
            onClick={() => {
              if (!isExpanded) setIsExpanded(true);
              setIsCreateIssueModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all border border-blue-100 shadow-sm"
            aria-label="Add new issue"
          >
            <FaPlus size={14} />
            Add Issue
          </button>
        </div>
      </div>

      {/* Modals */}
      <CreateIssueModal
        isOpen={isCreateIssueModalOpen}
        onClose={() => setIsCreateIssueModalOpen(false)}
        projectId={projectId}
        defaultSprintId={sprint.id !== "backlog" ? sprint.id : undefined}
      />

      {sprint.id !== "backlog" && (
        <>
          <CreateSprintModal
            isOpen={isEditSprintModalOpen}
            onClose={() => setIsEditSprintModalOpen(false)}
            projectId={projectId}
            isEditing={true}
            initialSprint={{
              id: sprint.id,
              name: sprint.name,
              dateStarted: sprint.dateStarted,
              dateEnded: sprint.dateEnded,
              goal: sprint.goal,
            }}
          />
          <DeleteSprintModal
            isOpen={isDeleteSprintModalOpen}
            onClose={() => setIsDeleteSprintModalOpen(false)}
            sprintId={sprint.id}
            sprintName={sprint.name}
            projectId={projectId}
          />
        </>
      )}
    </div>
  );
};

export default BacklogSprint;
