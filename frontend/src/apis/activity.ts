import api from "@/lib/api";
import type { IActivity } from "../types/activity";

export interface ActivityApiResponse {
  success: boolean;
  data: IActivity[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  lastUpdated?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapActivityResponse = (activity: any): IActivity => {
  return {
    id: activity.id || activity._id || "",
    project_id: activity.project_id || activity.projectId || "",
    issue_id: activity.issue_id || activity.issueId || "",
    user_id: activity.user_id || activity.userId || null,
    user_name: activity.user_name || activity.userName || "Anonymous",
    action_type: activity.action_type || activity.actionType || "ISSUE_UPDATED",
    changes: Array.isArray(activity.changes) ? activity.changes : [],
    created_at: activity.created_at || activity.createdAt || new Date().toISOString(),
    updated_at: activity.updated_at || activity.updatedAt || new Date().toISOString(),
  };
};

export const activityService = {
  getProjectActivities: async (
    projectId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<ActivityApiResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    try {
      const response = await api.get<any>(`/projects/${projectId}/activities?${params.toString()}`);

      if (response.data.success) {
        const mappedActivities = response.data.data.map(mapActivityResponse);

        return {
          success: true,
          data: mappedActivities,
          pagination: response.data.pagination,
          lastUpdated: new Date().toISOString(),
        };
      } else {
        throw new Error(response.data.message || "Failed to fetch activities");
      }
    } catch (error) {
      console.error("API Error:", error);
      throw new Error("Failed to fetch activities");
    }
  },

  getNewActivities: async (
    projectId: string,
    since: Date = new Date(Date.now() - 30000),
  ): Promise<ActivityApiResponse> => {
    const params = new URLSearchParams({
      since: since.toISOString(),
    });

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await api.get<any>(`/projects/${projectId}/activities/new?${params.toString()}`);

      if (response.data.success) {
        const mappedActivities = response.data.data.map(mapActivityResponse);

        return {
          success: true,
          data: mappedActivities,
          lastUpdated: response.data.lastUpdated || new Date().toISOString(),
        };
      } else {
        throw new Error(response.data.message || "Failed to fetch new activities");
      }
    } catch (error) {
      console.error("API Error:", error);
      throw new Error("Failed to fetch new activities");
    }
  },
};
