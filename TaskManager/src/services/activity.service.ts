// src/services/activity.service.ts

import ActivityRepository from "@/repositories/activity.repository";
import UserRepository from "@/repositories/user.repository";
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
    let finalUserName = userName;

    if (userId && !userName) {
      try {
        const user = await UserRepository.findById(userId);
        if (user) {
          finalUserName = user.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Anonymous";
        } else {
          finalUserName = "Anonymous";
        }
      } catch (error) {
        console.warn(`[ActivityService] Failed to fetch user ${userId}:`, error);
        finalUserName = "Anonymous";
      }
    }

    return ActivityRepository.create({
      projectId,
      issueId,
      userId: userId || undefined,
      userName: finalUserName || undefined,
      actionType,
      changes,
    });
  }

  async getProjectActivities(projectId: string, page: number, limit: number) {
    return ActivityRepository.findByProject(projectId, page, limit);
  }

  async getNewActivities(projectId: string, since: Date) {
    return ActivityRepository.findNewSince(projectId, since);
  }
}

export default new ActivityService();
