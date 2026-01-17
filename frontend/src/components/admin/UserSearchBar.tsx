import { useState, useEffect, useRef } from "react";
import { Button } from "../ui/Button";

interface UserSearchBarProps {
  onSearch: (term: string) => void;
  loading?: boolean;
}

export default function UserSearchBar({ onSearch, loading }: UserSearchBarProps) {
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced search effect
  useEffect(() => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      onSearch(localSearchTerm);
    }, 400);

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [localSearchTerm, onSearch]);

  const handleClear = () => {
    setLocalSearchTerm("");
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoComplete="off"
          />
          {loading && localSearchTerm && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
        {localSearchTerm && (
          <Button type="button" variant="secondary" size="md" onClick={handleClear}>
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
