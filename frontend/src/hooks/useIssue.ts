import { toast } from "react-toastify";
import { issues } from "../apis/issue";
import { useIssueStore } from "../stores/issueStore";
import { UpdateIssueParams } from "../types/issue";

export const useUpdateIssue = () => {
  const { fetchIssuesByProject } = useIssueStore();
  const updateIssue = async ({
    issueId,
    projectId,
    data,
  }: {
    issueId: string;
    projectId: string;
    data: Partial<{
      sprintId: string | null;
      columnId: string;
      order: number;
    }>;
  }) => {
    try {
      const response = await issues.update(projectId, issueId, data);
      if (response.data.success) {
        toast.success("Issue updated successfully!");
        await fetchIssuesByProject(projectId);
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to update issue");
      }
    } catch (error) {
      console.error("Update issue error:", error);
      toast.error("Failed to update issue");
      throw error;
    }
  };
  return { updateIssue };
};

export const useUpdateIssueFull = () => {
  const { fetchIssuesByProject } = useIssueStore();
  const updateIssueFull = async ({
    issueId,
    projectId,
    data,
  }: {
    issueId: string;
    projectId: string;
    data: UpdateIssueParams;
  }) => {
    console.log("Data gửi update full issue:", data);

    try {
      const response = await issues.update(projectId, issueId, data);
      if (response.data.success) {
        toast.success("Issue updated successfully!");
        await fetchIssuesByProject(projectId);
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to update issue");
      }
    } catch (error) {
      console.error("Update issue full error:", error);
      toast.error("Failed to update issue");
      throw error;
    }
  };
  return { updateIssueFull };
};
