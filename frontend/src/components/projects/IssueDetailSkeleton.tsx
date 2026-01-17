// src/components/projects/IssueDetailSkeleton.tsx
import { Skeleton } from "antd";

const IssueDetailSkeleton: React.FC = () => {
  return (
    <div className="h-full w-full flex-1 overflow-y-auto bg-white p-4">
      {/* Tiêu đề sprint */}
      <div className="mb-4 flex flex-row items-center justify-between">
        <Skeleton.Input active style={{ inlineSize: 200, blockSize: 30 }} />
        <div className="flex flex-row items-center gap-2">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Skeleton.Button key={idx} active size="small" style={{ blockSize: 30 }} />
          ))}
        </div>
      </div>

      {/* Danh sách issue */}
      <div className="flex flex-col gap-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="rounded-md border border-none bg-white p-3 shadow-sm">
            {/* Dòng đầu: issue key + summary */}
            <div className="mb-2 flex items-center justify-between">
              <Skeleton.Input active size="small" style={{ inlineSize: 100 }} />
              <Skeleton.Avatar active size="small" shape="circle" />
            </div>

            {/* Dòng mô tả */}
            <Skeleton.Input active size="small" style={{ inlineSize: "80%" }} />

            {/* Tag + footer */}
            <div className="mt-3 flex items-center gap-2">
              <Skeleton.Button active size="small" shape="round" />
              <Skeleton.Button active size="small" shape="round" />
              <Skeleton.Input active size="small" style={{ inlineSize: 60 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IssueDetailSkeleton;
