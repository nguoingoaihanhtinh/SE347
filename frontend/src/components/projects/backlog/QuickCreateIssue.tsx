import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import { useIssueStore } from "../../../stores/issueStore";
import { useColumnStore } from "../../../stores/columnStore";
import { useProjectStore } from "../../../stores/projectStore";

interface QuickCreateIssueProps {
  projectId: string;
  sprintId: string;
}

const QuickCreateIssue = ({ projectId, sprintId }: QuickCreateIssueProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { createIssue, fetchIssuesByProject } = useIssueStore();
  const { columns } = useColumnStore();
  const { currentProject } = useProjectStore();

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error("Please enter an issue title");
      return;
    }
    const defaultColumn = columns[0];
    if (!defaultColumn) {
      toast.error("No columns available");
      return;
    }
    setIsLoading(true);
    try {
      await createIssue({
        title: title.trim(),
        summary: title.trim(),
        description: "",
        columnId: defaultColumn.id,
        priority: "medium",
        type: "task",
        projectId,
        reporterId: currentProject?.ownerId || "",
        sprintId: sprintId === "backlog" ? null : sprintId,
        storyPoint: 0,
      });
      toast.success("Issue created successfully!");
      setTitle("");
      setIsCreating(false);
      await fetchIssuesByProject(projectId);
    } catch (error) {
      console.error("Failed to create issue:", error);
      toast.error("Failed to create issue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleCreate();
    } else if (e.key === "Escape") {
      setIsCreating(false);
      setTitle("");
    }
  };

  if (!isCreating) {
    return (
      <button
        onClick={() => setIsCreating(true)}
        className="flex w-full items-center gap-2 rounded-sm bg-transparent px-2 py-2 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
      >
        <FaPlus size={14} />
        <span>Create issue</span>
      </button>
    );
  }

  return (
    <div className="rounded-sm border-2 border-blue-500 bg-white p-2 shadow-sm">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="What needs to be done?"
        className="w-full border-none text-sm focus:outline-none focus:ring-0 mb-2 px-1"
        autoFocus
        disabled={isLoading}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">Press Enter to create, Esc to cancel</span>
        <div className="flex gap-1">
          <button
            onClick={handleCreate}
            disabled={isLoading || !title.trim()}
            className="px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating..." : "Create"}
          </button>
          <button
            onClick={() => {
              setIsCreating(false);
              setTitle("");
            }}
            disabled={isLoading}
            className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickCreateIssue;
