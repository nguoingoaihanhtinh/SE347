import { create } from "zustand";
import { activityService } from "../apis/activity";
import type { IActivity } from "../types/activity";

interface ActivityState {
  activities: IActivity[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  lastActivityTime: Date | null;

  fetchProjectActivities: (projectId: string, force?: boolean) => Promise<void>;
  fetchNewActivities: (projectId: string) => Promise<void>;
  refetchImmediately: (projectId: string) => Promise<void>;
  clearActivities: () => void;
}

export const useActivityStore = create<ActivityState>((set, get) => ({
  activities: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
  lastActivityTime: null,

  fetchProjectActivities: async (projectId, force = false) => {
    const { lastUpdated } = get();
    const now = new Date();

    if (!force && lastUpdated && now.getTime() - lastUpdated.getTime() < 30000) {
      console.debug("Skipping fetch - recent data available");
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await activityService.getProjectActivities(projectId);

      if (response.success) {
        // ✅ DEBUG LOG ĐỂ KIỂM TRA DATA
        console.debug("Fetched activities:", response.data);

        const mostRecentActivity = response.data[0]?.created_at;
        set({
          activities: response.data,
          lastUpdated: now,
          lastActivityTime: mostRecentActivity ? new Date(mostRecentActivity) : null,
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error("Failed to fetch activities");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch activities";
      console.error("Fetch activities failed:", errorMessage);
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchNewActivities: async (projectId) => {
    const { lastActivityTime, activities } = get();
    const since = lastActivityTime || new Date(Date.now() - 60000);

    try {
      console.debug("Fetching new activities since:", since.toISOString());

      const response = await activityService.getNewActivities(projectId, since);

      if (response.success && response.data.length > 0) {
        console.debug("New activities found:", response.data.length);

        const newActivities = response.data.filter(
          (newActivity) => !activities.some((existing) => existing.id === newActivity.id),
        );

        if (newActivities.length > 0) {
          const mostRecentActivity = newActivities[0].created_at;
          set((state) => ({
            activities: [...newActivities, ...state.activities].slice(0, 100),
            lastActivityTime: mostRecentActivity ? new Date(mostRecentActivity) : state.lastActivityTime,
            lastUpdated: new Date(),
          }));
        }
      } else {
        console.debug("No new activities found");
      }
    } catch (error) {
      console.error("Failed to fetch new activities:", error);
    }
  },

  refetchImmediately: async (projectId) => {
    console.debug("Forcing immediate refetch for project:", projectId);
    await get().fetchProjectActivities(projectId, true);
  },

  clearActivities: () => set({ activities: [] }),
}));
