// src/components/projects/modals/renameColumnModal.tsx

import { useState } from "react";
import Modal from "../../ui/modal/Modal";

interface Props {
  currentName: string;
  onClose: () => void;
  onSubmit: (newName: string) => void;
}

const RenameColumnModal = ({ currentName, onClose, onSubmit }: Props) => {
  const [newName, setNewName] = useState(currentName);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    const trimmed = newName.trim();
    if (!trimmed) {
      setError("Column name cannot be empty");
      return;
    }
    if (trimmed === currentName) {
      onClose();
      return;
    }
    onSubmit(trimmed);
  };

  return (
    <Modal title="Rename Column" onClose={onClose} buttonContent="Save" onSubmit={handleSubmit} isLoadingButton={false}>
      <div>
        <input
          autoFocus
          type="text"
          value={newName}
          onChange={(e) => {
            setNewName(e.target.value);
            setError("");
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter new column name"
        />
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </div>
    </Modal>
  );
};

export default RenameColumnModal;
