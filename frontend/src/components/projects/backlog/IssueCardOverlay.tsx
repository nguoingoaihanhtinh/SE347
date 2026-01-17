// src/components/projects/backlog/IssueCardOverlay.tsx
import { memo } from "react";

import type { IIssue } from "../../../types/issue";
import TypeBadge from "../../ui/badge/typeBadge";
import PriorityBadge from "../../ui/badge/priorityBadge";

interface IssueCardOverlayProps {
  issue: IIssue;
}

const IssueCardOverlay = memo(({ issue }: IssueCardOverlayProps) => {
  return (
    <div className="min-w-[280px] max-w-[320px] rounded-lg border-2 border-emerald-500 bg-white shadow-lg p-3">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-2">
          <TypeBadge type={issue.type} isShowLabel={false} />
          <div>
            <div className="font-medium text-gray-800">{issue.key}</div>
            <div className="mt-1 text-sm text-gray-700">{issue.summary}</div>
          </div>
        </div>

        <PriorityBadge priority={issue.priority} isShowLabel={false} />
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
        {issue.description && <div className="line-clamp-2 text-gray-600">{issue.description}</div>}
      </div>
    </div>
  );
});

export default IssueCardOverlay;
