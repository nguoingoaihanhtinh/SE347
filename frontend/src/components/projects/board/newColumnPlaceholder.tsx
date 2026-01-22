import { useState, useRef, useEffect } from "react";
import { FaCheck, FaTimes } from "react-icons/fa";

interface NewColumnPlaceholderProps {
  onCancel: () => void;
  onSubmit: (name: string, description?: string) => Promise<void>;
}

const NewColumnPlaceholder = ({ onCancel, onSubmit }: NewColumnPlaceholderProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit(name, description);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <div className="mx-2 w-80 flex-shrink-0 rounded-lg bg-white border-2 border-blue-500 shadow-md">
      <div className="p-3">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800">New Column</h2>
          <div className="flex gap-1">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !name.trim()}
              className={`p-1 rounded ${
                isSubmitting || !name.trim() ? "text-gray-400 cursor-not-allowed" : "text-green-600 hover:bg-green-100"
              }`}
              title="Save"
            >
              <FaCheck className="h-4 w-4" />
            </button>
            <button onClick={onCancel} className="p-1 text-red-600 rounded hover:bg-red-100" title="Cancel">
              <FaTimes className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label htmlFor="columnName" className="block text-xs font-medium text-gray-700 mb-1">
              Column Name <span className="text-red-500">*</span>
            </label>
            <input
              id="columnName"
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter column name..."
            />
            {!name.trim() && <p className="mt-1 text-xs text-red-500">Column name is required</p>}
          </div>

          <div>
            <label htmlFor="columnDescription" className="block text-xs font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              id="columnDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter column description..."
            />
          </div>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-gray-200 text-sm font-medium text-gray-500 text-center">
        Creating new column...
      </div>
    </div>
  );
};

export default NewColumnPlaceholder;
