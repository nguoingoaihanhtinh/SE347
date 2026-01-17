import _ from "lodash";
import validate from "@/utils/validate";
import UserService from "@/services/users.service";
import { Request, Response } from "express-serve-static-core";
import { createUserSchema } from "@/dtos/user/CreateUser.dto";
import { BadRequestError, NotFoundError, UnauthorizedError, ForbiddenError } from "@/utils/errors";
import { updateUserSchema } from "@/dtos/user/UpdateUser.dto";
import { isValidObjectId } from "@/utils/mongodb";

export async function getUsers(req: Request, res: Response) {
  const { page, limit, search } = req.query;
  const { data: users, pagination } = await UserService.findAll({
    page: _.toInteger(page) || 1,
    limit: _.toInteger(limit) || 10,
    search: search as string | undefined, // Pass search term to service
  });

  res.status(200).json({
    success: true,
    data: users,
    pagination,
  });
}

export async function getUserById(req: Request, res: Response) {
  const id = req.params.id;

  if (!id) {
    throw new BadRequestError({ message: "Missing required param: id" });
  }

  const user = await UserService.findOne({ userId: id });
  if (!user) {
    throw new NotFoundError({ message: `User with ID ${id} not found` });
  }

  res.status(200).json({
    success: true,
    data: user,
  });
}

export async function createUser(request: Request, response: Response) {
  // Check if current user is admin
  if (!request.user || (request.user.role !== "admin" && request.user.role !== "super_admin")) {
    throw new ForbiddenError({ message: "Admin access required to create users" });
  }

  const userData = validate.schema_validate(createUserSchema, request.body);

  // Prevent regular admin from creating super_admin
  const currentUserRole = request.user.role;
  if (userData.role === "super_admin" && currentUserRole !== "super_admin") {
    throw new ForbiddenError({
      message: "Only Super Admins can create Super Admin accounts.",
    });
  }

  const newUser = await UserService.createUser({ userData });

  response.status(201).json({
    success: true,
    data: newUser,
  });
}

export async function updateUser(request: Request, response: Response) {
  const id = request.params.id;
  if (!id) {
    throw new BadRequestError({ message: "Missing required param: id" });
  }

  // Check if current user is admin
  if (!request.user || (request.user.role !== "admin" && request.user.role !== "super_admin")) {
    throw new ForbiddenError({ message: "Admin access required" });
  }

  // Get the target user to check their role
  const targetUser = await UserService.findOne({ userId: id });
  if (!targetUser) {
    throw new NotFoundError({ message: `User with ID ${id} not found` });
  }

  // Protect super_admin: Regular admin cannot modify super_admin
  const currentUserRole = request.user.role;
  const targetUserRole = targetUser.role;

  if (currentUserRole === "admin" && targetUserRole === "super_admin") {
    throw new ForbiddenError({
      message: "You do not have permission to modify Super Admin users. Contact a Super Admin.",
    });
  }

  // If updating role, ensure regular admin cannot set super_admin
  const userData = validate.schema_validate(updateUserSchema, request.body);
  if (userData.role === "super_admin" && currentUserRole !== "super_admin") {
    throw new ForbiddenError({
      message: "Only Super Admins can assign Super Admin role.",
    });
  }

  // CRITICAL: Prevent removing the last Super Admin from the system
  // Check if we're demoting a super_admin (changing their role away from super_admin)
  if (targetUserRole === "super_admin" && userData.role && userData.role !== "super_admin") {
    const totalSuperAdmins = await UserService.countSuperAdmins();
    if (totalSuperAdmins <= 1) {
      throw new BadRequestError({
        message: "Cannot remove the last Super Admin from the system. At least one Super Admin must remain.",
      });
    }
  }

  const updatedUser = await UserService.updateUser({ userId: id, userData: userData });

  response.status(200).json({
    success: true,
    data: updatedUser,
  });
}

export async function deleteUser(request: Request, response: Response) {
  const id = request.params.id;
  if (!id) {
    throw new BadRequestError({ message: "Missing required param: id" });
  }

  // Check if current user is admin
  if (!request.user || (request.user.role !== "admin" && request.user.role !== "super_admin")) {
    throw new ForbiddenError({ message: "Admin access required" });
  }

  // Get the target user to check their role
  const targetUser = await UserService.findOne({ userId: id });
  if (!targetUser) {
    throw new NotFoundError({ message: `User with ID ${id} not found` });
  }

  // Protect super_admin: Regular admin cannot delete super_admin
  const currentUserRole = request.user.role;
  const targetUserRole = targetUser.role;

  if (currentUserRole === "admin" && targetUserRole === "super_admin") {
    throw new ForbiddenError({
      message: "You do not have permission to delete Super Admin users. Contact a Super Admin.",
    });
  }

  // Prevent self-deletion (optional safety check)
  if (request.user.userId === id) {
    throw new BadRequestError({ message: "You cannot delete your own account. Use the profile deletion endpoint instead." });
  }

  // CRITICAL: Prevent removing the last Super Admin from the system
  if (targetUserRole === "super_admin") {
    const totalSuperAdmins = await UserService.countSuperAdmins();
    if (totalSuperAdmins <= 1) {
      throw new BadRequestError({
        message: "Cannot remove the last Super Admin from the system. At least one Super Admin must remain.",
      });
    }
  }

  await UserService.deleteUser(id);

  response.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
}

export async function getUserProfile(req: Request, res: Response) {
  if (!req.user || !req.user.userId) {
    throw new UnauthorizedError({ message: "Authentication required" });
  }

  const userId = req.user.userId;

  if (!isValidObjectId(userId)) {
    throw new UnauthorizedError({ message: "Invalid user ID format" });
  }

  const user = await UserService.findOne({ userId });

  if (!user) {
    throw new NotFoundError({ message: "User not found" });
  }

  const { passwordHash, ...userProfile } = user;
  res.status(200).json({
    success: true,
    data: userProfile,
  });
}
export async function updateUserProfile(req: Request, res: Response) {
  if (!req.user?.userId) {
    throw new UnauthorizedError({ message: "Authentication required" });
  }

  if (!isValidObjectId(req.user.userId)) {
    throw new UnauthorizedError({ message: "Invalid user ID format" });
  }

  const userData = validate.schema_validate(updateUserSchema, req.body);
  const updatedUser = await UserService.updateUser({
    userId: req.user.userId,
    userData,
  });

  const { passwordHash, ...userProfile } = updatedUser;
  res.status(200).json({
    success: true,
    data: userProfile,
  });
}

export async function deleteUserProfile(req: Request, res: Response) {
  if (!req.user?.userId) {
    throw new UnauthorizedError({ message: "Authentication required" });
  }

  if (!isValidObjectId(req.user.userId)) {
    throw new UnauthorizedError({ message: "Invalid user ID format" });
  }

  await UserService.deleteUser(req.user.userId);
  res.status(200).json({
    success: true,
    message: "Account deleted successfully",
  });
}
