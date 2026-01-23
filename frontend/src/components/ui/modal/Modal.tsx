import { type ReactNode } from "react";
import { createPortal } from "react-dom";
import { LuX } from "react-icons/lu";

interface BaseModalProps {
  title: string;
  buttonContent?: string;
  isLoadingButton?: boolean;
  isSubmitDisabled?: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit?: any;
  children: ReactNode;
  className?: string;
  formId?: string; // HTML form ID to link the submit button to
  hideFooter?: boolean; // Hide the default footer (use when buttons are inside form)
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
  formId,
  hideFooter = false,
  style,
}: BaseModalProps) {
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <div
      id="modal"
      onMouseDown={handleBackdropClick}
      className="fixed inset-0 bg-black/40 flex items-center justify-center"
      style={{ zIndex: 9999 }}
    >
      <div className={`bg-white rounded-xl shadow-xl max-w-[500px] w-full max-h-[90vh] animate-fade-in flex flex-col ${className}`}>
        {/* Header */}
        <div className="flex justify-between items-center px-6 pt-6 pb-4 border-b border-gray-200 flex-shrink-0">
          <h2 className={`text-lg font-bold text-gray-800 ${style?.textColor || ""}`}>{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 focus:outline-none">
            <LuX className="w-5 h-5 cursor-pointer" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {children}
        </div>

        {/* Footer */}
        {!hideFooter && (
        <div className="flex justify-end px-6 pt-4 pb-6 border-t border-gray-200 space-x-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 cursor-pointer text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all"
          >
            Cancel
          </button>
          <button
            type={formId ? "submit" : "button"}
            form={formId}
            {...(formId
              ? {}
              : {
                  onClick: (e) => {
                    e.preventDefault();
                    if (onSubmit) {
                      // If onSubmit is a function that expects an event, pass it
                      // Otherwise call it directly
                      if (typeof onSubmit === 'function') {
                        onSubmit(e);
                      }
                    }
                  },
                })}
            disabled={isSubmitDisabled || isLoadingButton}
            className={`px-4 py-2 cursor-pointer text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center ${style?.confirmButtonColor || ""}`}
          >
            {isLoadingButton && (
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            {buttonContent}
          </button>
        </div>
        )}
      </div>
    </div>
  );

  // Render modal using React Portal to ensure it's at the root level
  return createPortal(modalContent, document.body);
}
