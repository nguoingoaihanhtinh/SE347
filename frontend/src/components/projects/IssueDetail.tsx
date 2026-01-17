// src/components/projects/IssueDetail.tsx
import { useRef } from "react";
import { useUpdateIssue } from "../../hooks/useIssue";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";
import { useIssueStore } from "../../stores/issueStore";
import { useParams } from "react-router-dom";
import IssueDetailSkeleton from "./IssueDetailSkeleton";
import IconRenderer from "../../components/ui/IconRenderer"; // Import từ file component mới

import { IoLockClosedOutline } from "react-icons/io5";
import { FaEye } from "react-icons/fa";
import { CiShare2 } from "react-icons/ci";
import { BsThreeDots } from "react-icons/bs";
import { IoIosClose } from "react-icons/io";

// Component đơn giản
const DetailsSection = ({ selectedIssue }) => (
  <div className="rounded-lg border border-gray-200 p-4">
    <h2 className="text-lg font-semibold text-gray-700 mb-4">Details</h2>
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Summary</label>
        <p className="mt-1 text-sm text-gray-900">{selectedIssue.summary}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <p className="mt-1 text-sm text-gray-900">{selectedIssue.description || "No description"}</p>
      </div>
    </div>
  </div>
);

const ActivitySection = ({ issueId }) => (
  <div className="rounded-lg border border-gray-200 p-4">
    <h2 className="text-lg font-semibold text-gray-700 mb-4">Activity</h2>
    <div className="text-sm text-gray-500 py-8 text-center">No activity yet for this issue</div>
  </div>
);

const MetadataSection = ({ selectedIssue }) => (
  <div className="rounded-lg border border-gray-200 p-4">
    <h2 className="text-lg font-semibold text-gray-700 mb-4">Metadata</h2>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Type</label>
        <div className="mt-1 text-sm text-gray-900 capitalize">{selectedIssue.type}</div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Priority</label>
        <div className="mt-1 text-sm text-gray-900 capitalize">{selectedIssue.priority}</div>
      </div>
    </div>
  </div>
);

const IssueDetail = ({ selectedIssueId }: { selectedIssueId: string }) => {
  if (!selectedIssueId) return null;

  const ref = useRef<HTMLDivElement | null>(null);
  const { projectId } = useParams<{ projectId: string }>();
  const { closeIssueDetail, getIssueById } = useIssueStore();
  const selectedIssue = getIssueById(selectedIssueId);

  const [_, setSearchParams] = useSearchParams();

  // Header actions - sử dụng icon thực từ react-icons
  const IssueDetailHeader = [
    {
      key: "lock",
      icon: <IoLockClosedOutline className="h-4 w-4 text-gray-600" />,
      onClick: () => toast.info("Lock issue not implemented yet"),
    },
    {
      key: "watch",
      icon: <FaEye className="h-4 w-4 text-gray-600" />,
      onClick: () => toast.info("Watch issue not implemented yet"),
    },
    {
      key: "share",
      icon: <CiShare2 className="h-4 w-4 text-gray-600" />,
      onClick: () => toast.info("Share issue not implemented yet"),
    },
    {
      key: "actions",
      icon: <BsThreeDots className="h-4 w-4 text-gray-600" />,
      onClick: () => toast.info("Actions not implemented yet"),
    },
    {
      key: "close",
      icon: <IoIosClose className="h-4 w-4 text-gray-600" />,
      onClick: () => {
        closeIssueDetail();
        setSearchParams({});
      },
    },
  ];

  const { updateIssue } = useUpdateIssue();

  const handleUpdateIssue = async (key: string, value: string) => {
    try {
      if (!selectedIssue || !projectId) return;
      await updateIssue(projectId, selectedIssue.id, { [key]: value });
      toast.success("Issue updated successfully!");
    } catch {
      toast.error("Failed to update issue");
    }
  };

  if (!selectedIssue) {
    return <IssueDetailSkeleton />;
  }

  return (
    <div
      ref={ref}
      className="z-30 flex h-full w-full flex-1 flex-col gap-4 overflow-y-auto border-l border-gray-200 bg-white p-4 transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="text-xl font-semibold text-gray-600">
              {selectedIssue.title} <span className="text-sm text-gray-500 font-normal">({selectedIssue.key})</span>
            </span>
          </div>
        </div>
        <div className="flex flex-row gap-2">
          {IssueDetailHeader.map((item) => (
            <div
              key={item.key}
              onClick={item.onClick}
              className="cursor-pointer rounded-sm border border-gray-300 p-1.5 hover:bg-gray-100"
            >
              {item.icon}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-6">
        <MetadataSection selectedIssue={selectedIssue} />
        <DetailsSection selectedIssue={selectedIssue} />
        <ActivitySection issueId={selectedIssue.id} />
      </div>
    </div>
  );
};

export default IssueDetail;
