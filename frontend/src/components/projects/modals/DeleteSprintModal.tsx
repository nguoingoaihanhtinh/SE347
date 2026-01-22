import { useState } from "react";
import Modal from "../../ui/modal/Modal";
import { useSprintStore } from "../../../stores/sprintStore";
import { useIssueStore } from "../../../stores/issueStore";
import { toast } from "react-toastify";

interface DeleteSprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  sprintId: string;
  sprintName: string;
  projectId: string;
}

const DeleteSprintModal = ({ isOpen, onClose, sprintId, sprintName, projectId }: DeleteSprintModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { deleteSprint } = useSprintStore();
  const { issues, fetchIssuesByProject } = useIssueStore();

  const handleDeleteSprint = async () => {
    try {
      setIsLoading(true);

      const sprintIssues = issues.filter((issue) => issue.sprintId === sprintId);

      for (const issue of sprintIssues) {
        await useIssueStore.getState().updateIssue(projectId, issue.id, {
          sprintId: null,
        });
      }

      await deleteSprint(projectId, sprintId);

      await fetchIssuesByProject(projectId);

      toast.success(`Sprint "${sprintName}" has been deleted successfully!`);
      onClose();
    } catch (error) {
      console.error("Failed to delete sprint:", error);
      toast.error("Failed to delete sprint. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      title={`Delete Sprint "${sprintName}"`}
      onClose={onClose}
      buttonContent={isLoading ? "Deleting..." : "Delete Sprint"}
      onSubmit={handleDeleteSprint}
      isLoadingButton={isLoading}
    >
      <div className="space-y-4 p-4">
        <p className="text-gray-600">
          Are you sure you want to delete this sprint? All issues in this sprint will be moved back to the backlog.
        </p>
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-sm text-red-700">
            <strong>Warning:</strong> This action cannot be undone.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteSprintModal;
