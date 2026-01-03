import ActivityRepository from "@/repositories/activity.repository";
import { ActivityAction } from "@/enums";

export class ActivityService {
  async log({
    projectId,
    issueId,
    userId,
    userName,
    actionType,
    changes = [],
  }: {
    projectId: string;
    issueId: string;
    userId?: string | null;
    userName?: string | null;
    actionType: ActivityAction;
    changes?: any[];
  }) {
    return ActivityRepository.create({
      projectId,
      issueId,
      userId: userId || undefined,
      userName: userName || undefined,
      actionType,
      changes,
    });
  }

  async getProjectActivities(projectId: string, page: number, limit: number) {
    return ActivityRepository.findByProject(projectId, page, limit);
  }
}

export default new ActivityService();
