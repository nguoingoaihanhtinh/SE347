import _ from "lodash";
import validate from "@/utils/validate";
import UserService from "@/services/users.service";
import { Request, Response } from "express-serve-static-core";
import { createUserSchema } from "@/dtos/user/CreateUser.dto";
import { BadRequestError, NotFoundError, UnauthorizedError } from "@/utils/errors";
import { updateUserSchema } from "@/dtos/user/UpdateUser.dto";
import { isValidObjectId } from "@/utils/mongodb";

export async function getUsers(req: Request, res: Response) {
  const { page, limit } = req.query;
  const { data: users, pagination } = await UserService.findAll({
    page: _.toInteger(page) || 1,
    limit: _.toInteger(limit) || 10,
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
  const userData = validate.schema_validate(createUserSchema, request.body);

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

  const userData = validate.schema_validate(updateUserSchema, request.body);

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

  await UserService.deleteUser(id);

  response.status(200).json({
    success: true,
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
