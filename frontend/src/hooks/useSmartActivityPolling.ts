import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useActivityStore } from "../stores/activityStore";

export function useSmartActivityPolling() {
  const { projectId } = useParams<{ projectId: string }>();
  const { fetchProjectActivities, fetchNewActivities, lastActivityTime, lastUpdated } = useActivityStore();

  // Ref để tránh re-creating interval khi component re-render
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initial fetch khi component mount
  useEffect(() => {
    if (projectId) {
      fetchProjectActivities(projectId, true); // Force fetch lần đầu
    }
  }, [fetchProjectActivities, projectId]);

  // Setup và cleanup polling
  useEffect(() => {
    if (!projectId) return;

    // Clear interval cũ trước khi tạo mới
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Tính toán khoảng thời gian polling dựa trên hoạt động gần đây
    const hasRecentActivity = lastActivityTime && Date.now() - lastActivityTime.getTime() < 5 * 60 * 1000; // 5 phút

    const pollInterval = hasRecentActivity ? 10000 : 30000; // 10s hoặc 30s

    // Log để debug
    console.log(`Setting up polling with interval: ${pollInterval}ms. Has recent activity: ${hasRecentActivity}`);

    // Setup interval
    intervalRef.current = setInterval(() => {
      console.log("Polling for new activities...");
      fetchNewActivities(projectId);
    }, pollInterval);

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        console.log("Stopped activity polling");
      }
    };
  }, [projectId, lastActivityTime, lastUpdated, fetchNewActivities]);

  return {
    projectId,
    lastUpdated,
    lastActivityTime,
    manuallyRefetch: () => projectId && fetchNewActivities(projectId),
  };
}
