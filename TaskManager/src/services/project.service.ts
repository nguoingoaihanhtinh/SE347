import { NotFoundError, BadRequestError, ForbiddenError } from "@/utils/errors";
import projectRepository from "@/repositories/project.repository";
import projectColumnService from "@/services/project-column.service";
import { Project } from "@/models/project.model";
import ActivityService from "@/services/activity.service";
import { ActivityAction } from "@/enums";
import projectMemberRepository from "@/repositories/project-member.repository";
import userRepository from "@/repositories/user.repository";
import validationService from "@/services/validation.service";
import { connectMongo } from "@/config/mongodb";
import { ObjectId } from "mongodb";

export class ProjectService {
  async findAll(page: number = 1, limit: number = 10, currentUserId?: string, currentUserRole?: string) {
    // If user is super_admin, return all projects (for admin dashboard)
    if (currentUserRole === "super_admin") {
      return projectRepository.findAll({}, page, limit);
    }

    // For regular users, return projects where they are:
    // 1. A member or owner, OR
    // 2. Public projects (accessible to all users)
    if (currentUserId) {
      // Get all project IDs where user is a member
      const userMemberships = await projectMemberRepository.findByUser(currentUserId);
      const memberProjectIds = userMemberships.map((member) => member.projectId);
      
      // Also include projects where user is the owner
      const ownedProjectsResult = await projectRepository.findAll({ ownerId: currentUserId }, 1, 1000);
      const ownedProjectIds = ownedProjectsResult.data.map((p) => p.id);
      
      // Get all public projects
      const publicProjectsResult = await projectRepository.findAll({ access: "public" }, 1, 1000);
      const publicProjectIds = publicProjectsResult.data.map((p) => p.id);
      
      // Combine and deduplicate: member projects + owned projects + public projects
      const allAccessibleProjectIds = [...new Set([...memberProjectIds, ...ownedProjectIds, ...publicProjectIds])];
      
      if (allAccessibleProjectIds.length === 0) {
        // User has no accessible projects
        return {
          data: [],
          pagination: {
            page,
            limit,
            total: 0,
            total_pages: 0,
          },
        };
      }
      
      // Query projects by IDs using MongoDB $in operator
      const db = await connectMongo();
      const skip = (page - 1) * limit;
      const projectObjectIds = allAccessibleProjectIds.map((id) => new ObjectId(id));
      
      const projects = await db.collection("projects")
        .find({ _id: { $in: projectObjectIds } })
        .skip(skip)
        .limit(limit)
        .toArray();
      
      const total = await db.collection("projects").countDocuments({ _id: { $in: projectObjectIds } });
      
      const mappedData = projects.map((doc) => ({
        id: doc._id.toString(),
        name: doc.name,
        key: doc.key,
        description: doc.description ?? null,
        access: doc.access,
        type: doc.type,
        ownerId: doc.ownerId.toString(),
        relationship:
          doc.ownerId?.toString?.() === currentUserId
            ? "owner"
            : memberProjectIds.includes(doc._id.toString())
              ? "member"
              : "public",
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      }));
      
      return {
        data: mappedData,
        pagination: {
          page,
          limit,
          total,
          total_pages: Math.ceil(total / limit),
        },
      };
    }

    // If no user ID provided, return empty (should not happen in protected route)
    return {
      data: [],
      pagination: {
        page,
        limit,
        total: 0,
        total_pages: 0,
      },
    };
  }

  async findOneById(id: string, currentUserId?: string, currentUserRole?: string) {
    const project = await projectRepository.findOne({ id });
    if (!project) throw new NotFoundError({ message: `Project with ID ${id} not found` });
    
    // Safe Admin Powers: Allow Super Admin to view project metadata for audit purposes
    // even if they are not a project member
    if (currentUserId && currentUserRole) {
      const isSuperAdmin = currentUserRole === "super_admin";
      const isOwner = project.ownerId.toString() === currentUserId.toString();
      const isMember = await projectMemberRepository.findByProjectAndUser(id, currentUserId);
      const isPublicProject = project.access === "public";
      
      // Allow access if:
      // - user is the project owner, OR
      // - project is public (any authenticated user can view), OR
      // - user is a project member, OR
      // - user is super_admin (for audit)
      if (!isOwner && !isPublicProject && !isMember && !isSuperAdmin) {
        throw new ForbiddenError({
          message: "You do not have permission to view this project. You must be a project member or a Super Admin.",
        });
      }
    }
    
    return project;
  }

  async findOneByKey(key: string) {
    const project = await projectRepository.findOne({ key });
    if (!project) throw new NotFoundError({ message: `Project with key ${key} not found` });
    return project;
  }

  async searchByKey(key: string, currentUserId?: string): Promise<{ name: string; ownerName: string; key: string; access: string } | null> {
    const project = await projectRepository.findOne({ key });
    if (!project) return null;

    // Only return private projects (public projects are visible in list)
    if (project.access !== "private") return null;

    // Get owner info
    const owner = await userRepository.findOne({ userId: project.ownerId.toString() });
    const ownerName = owner ? `${owner.firstName || ""} ${owner.lastName || ""}`.trim() || owner.email : "Unknown";

    return {
      name: project.name,
      ownerName,
      key: project.key,
      access: project.access,
    };
  }

  async create(projectData: Omit<Project, "id" | "createdAt" | "updatedAt">) {
    const existing = await projectRepository.findOne({ key: projectData.key });
    if (existing) throw new BadRequestError({ message: `Project key "${projectData.key}" already exists` });

    // Create project first
    const project = await projectRepository.create(projectData);

    try {
      // console.log("Adding owner as project member...");
      // console.log("Project ID:", project.id);
      // console.log("Owner ID:", project.ownerId);

      const member = await projectMemberRepository.create({
        projectId: project.id!,
        userId: project.ownerId,
        teamIds: [],
        role: "owner",
        isPending: false,
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await projectColumnService.initializeDefaultColumns(project.id!, project.ownerId);
    } catch (error) {
      console.error("Failed to complete project setup:", error);

      try {
        await projectRepository.delete(project.id!);
      } catch (rollbackError) {
        console.error("Failed to rollback project creation:", rollbackError);
      }

      throw new BadRequestError({
        message: "Failed to complete project setup. Please try again.",
      });
    }

    await ActivityService.log({
      projectId: project.id,
      issueId: project.id,
      userId: project.ownerId,
      actionType: ActivityAction.PROJECT_CREATED,
    });

    return project;
  }

  async update(id: string, updateData: Partial<Project>, currentUserId: string, currentUserRole?: string) {
    const existing = await this.findOneById(id);
    if (!existing) throw new NotFoundError({ message: `Project with ID ${id} not found` });

    // Safe Admin Powers: Super Admin CANNOT edit projects unless they are project members
    // Only project members (owner/admin) can update project details
    // This ensures Super Admin acts as "Janitor" (can delete) but not "Dictator" (cannot edit)
    await validationService.validateProjectMemberPermission(id, currentUserId, ["owner", "admin"]);

    if (updateData.key && updateData.key !== existing.key) {
      const dup = await projectRepository.findOne({ key: updateData.key });
      if (dup) throw new BadRequestError({ message: `Project key "${updateData.key}" already exists` });
    }

    const updated = await projectRepository.update(id, updateData);
    if (!updated) throw new BadRequestError({ message: `Failed to update project ${id}` });

    try {
      await ActivityService.log({
        projectId: id,
        issueId: id,
        userId: currentUserId,
        actionType: ActivityAction.PROJECT_UPDATED,
      });
    } catch (error) {
      console.error("Failed to log project update activity:", error);
    }

    return updated;
  }

  async delete(id: string, currentUserId: string, currentUserRole: string) {
    const project = await projectRepository.findOne({ id });
    if (!project) throw new NotFoundError({ message: `Project with ID ${id} not found` });
    
    // Allow deletion if user is the project owner OR user is a super_admin
    const isOwner = project.ownerId === currentUserId;
    const isSuperAdmin = currentUserRole === "super_admin";
    
    if (!isOwner && !isSuperAdmin) {
      throw new ForbiddenError({
        message: "Only the project owner or a Super Admin can delete this project.",
      });
    }
    
    const deleted = await projectRepository.delete(id);
    if (!deleted) throw new BadRequestError({ message: `Failed to delete project ${id}` });
    return true;
  }
}

export default new ProjectService();
