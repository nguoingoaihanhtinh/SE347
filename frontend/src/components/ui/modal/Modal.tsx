import { type ReactNode } from "react";
import { LuX } from "react-icons/lu";
import { Button } from "../Button";

interface BaseModalProps {
  title: string;
  buttonContent: string;
  isLoadingButton?: boolean;
  isSubmitDisabled?: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: any;
  children: ReactNode;
  className?: string;
  style?: {
    textColor: string;
    confirmButtonColor: string;
  };
}

export default function Modal({
  title,
  buttonContent = "Accept",
  onClose,
  isLoadingButton,
  isSubmitDisabled,
  onSubmit,
  children,
  className,
  style,
}: BaseModalProps) {
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      id="modal"
      onMouseDown={handleBackdropClick}
      className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50"
    >
      <div className={`bg-white rounded-lg shadow-xl min-w-[500px] p-6 animate-fade-in ${className}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-2xl font-semibold ${style?.textColor}`}>{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 focus:outline-none">
            <LuX className="w-7 h-7 cursor-pointer" />
          </button>
        </div>
        {children}

        <div className="flex justify-end mt-4 space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 cursor-pointer text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Cancel
          </button>
          <Button
            isLoading={isLoadingButton}
            onClick={() => {
              if (onSubmit) onSubmit();
            }}
            disabled={isSubmitDisabled}
            className={`px-4 py-2 cursor-pointer text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed ${style?.confirmButtonColor}`}
          >
            {buttonContent}
          </Button>
        </div>
      </div>
    </div>
  );
}
