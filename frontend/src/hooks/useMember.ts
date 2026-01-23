// src/hooks/useMember.ts
import { useState, useEffect, useCallback } from "react";
import { memberApi, type ProjectMember, type ProjectInvitation, type ProjectMemberStats } from "../apis/member";
import type { TeamMemberRole } from "../types/projectMember";
import { extractErrorMessage } from "../types/api";

// Hook: Get project members
export const useProjectMembers = (projectId?: string) => {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    if (!projectId) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await memberApi.getProjectMembers(projectId);
      setMembers(response.data.data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return { members, isLoading, error, refetch: fetchMembers };
};

// Hook: Get project stats
export const useProjectStats = (projectId?: string) => {
  const [stats, setStats] = useState<ProjectMemberStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!projectId) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await memberApi.getProjectStats(projectId);
      setStats(response.data.data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, error, refetch: fetchStats };
};

// Hook: Get user invitations
export const useMyInvitations = () => {
  const [invitations, setInvitations] = useState<ProjectInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInvitations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await memberApi.getMyInvitations();
      setInvitations(response.data.data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  return { invitations, isLoading, error, refetch: fetchInvitations };
};

// Hook: Member actions
export const useMemberActions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inviteMember = async (projectId: string, email: string, role: TeamMemberRole) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await memberApi.inviteMember(projectId, { email, role });
      return response.data.data;
    } catch (err) {
      const message = extractErrorMessage(err);
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const acceptInvitation = async (token: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await memberApi.acceptInvitation(token);
      return response.data.data;
    } catch (err) {
      const message = extractErrorMessage(err);
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const declineInvitation = async (token: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await memberApi.declineInvitation(token);
      return response.data.data;
    } catch (err) {
      const message = extractErrorMessage(err);
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateMemberRole = async (projectId: string, memberId: string, newRole: TeamMemberRole) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await memberApi.updateMemberRole({ projectId, memberId, newRole });
      return response.data.data;
    } catch (err) {
      const message = extractErrorMessage(err);
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const removeMember = async (projectId: string, memberId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await memberApi.removeMember({ projectId, memberId });
      return response.data.data;
    } catch (err) {
      const message = extractErrorMessage(err);
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const leaveProject = async (projectId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await memberApi.leaveProject(projectId);
      return response.data.data;
    } catch (err) {
      const message = extractErrorMessage(err);
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelInvitation = async (projectId: string, invitationId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await memberApi.cancelInvitation({ projectId, invitationId });
      return response.data.data;
    } catch (err) {
      const message = extractErrorMessage(err);
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    inviteMember,
    acceptInvitation,
    declineInvitation,
    updateMemberRole,
    removeMember,
    leaveProject,
    cancelInvitation,
    isLoading,
    error,
  };
};
