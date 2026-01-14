// src/components/projects/modals/deleteColumnModal.tsx

import Modal from "../../ui/modal/Modal";

interface Props {
  onClose: () => void;
  onSubmit: () => void;
  hasIssues: boolean;
}

const DeleteColumnModal = ({ onClose, onSubmit, hasIssues }: Props) => {
  return (
    <Modal title="Delete Column" onClose={onClose} buttonContent="Delete" onSubmit={onSubmit} isLoadingButton={false}>
      <div className="text-center space-y-2">
        {hasIssues ? (
          <>
            <p className="text-red-600 font-medium">This column contains issues!</p>
            <p className="text-gray-600">You must move all issues out of this column before deleting it.</p>
          </>
        ) : (
          <>
            <p className="text-gray-600">Are you sure you want to delete this column? This action cannot be undone.</p>
            <p className="text-gray-500 text-sm mt-1">All data in this column will be permanently lost.</p>
          </>
        )}
      </div>
    </Modal>
  );
};

export default DeleteColumnModal;
