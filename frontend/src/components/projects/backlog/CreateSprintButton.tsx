// src/components/projects/backlog/CreateSprintButton.tsx
import { useState } from "react";
import { Button } from "../../ui/Button";
import CreateSprintModal from "../../modals/CreateSprintModal";

interface CreateSprintButtonProps {
  projectId: string;
}

const CreateSprintButton = ({ projectId }: CreateSprintButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
      >
        <span>+</span>
        Create Sprint
      </Button>

      <CreateSprintModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} projectId={projectId} />
    </>
  );
};

export default CreateSprintButton;
