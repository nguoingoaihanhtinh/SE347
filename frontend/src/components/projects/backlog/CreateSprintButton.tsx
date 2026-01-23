// src/components/projects/backlog/CreateSprintButton.tsx
import { useState } from "react";
import CreateSprintModal from "../../modals/CreateSprintModal";

interface CreateSprintButtonProps {
  projectId: string;
}

const CreateSprintButton = ({ projectId }: CreateSprintButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="group flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors focus:outline-none focus-visible:outline-none"
      >
        <svg className="w-5 h-5 text-indigo-600 group-hover:text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        <span className="text-indigo-600 font-semibold whitespace-nowrap group-hover:text-indigo-700 text-sm">
          Create Sprint
        </span>
      </button>

      <CreateSprintModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} projectId={projectId} />
    </>
  );
};

export default CreateSprintButton;
