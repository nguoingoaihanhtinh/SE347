import _ from "lodash";
import * as bcrypt from "bcrypt";
import { BadRequestError, NotFoundError } from "@/utils/errors";
import userRepository from "@/repositories/user.repository";
import { CreateUserDto } from "@/dtos/user/CreateUser.dto";
import { UpdateUserDto } from "@/dtos/user/UpdateUser.dto";
import { LoginDto } from "@/dtos/user/Login.dto";
import { UserQueryParams } from "@/types/user.query-params";
import { RegisterDto } from "@/dtos/user/Register.dto";
import { generateToken } from "@/utils/jwt.util";

export class UserService {
  async login(input: { loginData: LoginDto }) {
    const { loginData } = input;

    const curUser = await userRepository.findOne({
      email: loginData.email,
    });

    if (!curUser) {
      throw new BadRequestError({ message: `Invalid email or password` });
    }

    const isValidPassword = await bcrypt.compare(loginData.password, curUser.password);

    if (!isValidPassword) {
      throw new BadRequestError({ message: `Invalid email or password` });
    }

    const { password, ...user } = curUser;

    const token = generateToken({
      userId: user._id?.toString() ?? "",
      email: user.email,
      role: user.role,
    });

    return {
      user,
      token,
    };
  }

  async register(input: { registerData: RegisterDto }) {
    const { registerData } = input;

    if (registerData.password !== registerData.confirm_password) {
      throw new BadRequestError({ message: `Confirm password is not correct` });
    }

    const hashedPassword = await bcrypt.hash(registerData.password, 10);
    const { confirm_password, ...userData } = registerData;

    const newUser = await userRepository.create({
      userData: {
        email: userData.email,
        password: hashedPassword,
        firstName: userData.first_name,
        lastName: userData.last_name,
        role: "user",
      },
    });

    return newUser;
  }

  async findAll(input: UserQueryParams) {
    const data = await userRepository.findAll(input);
    return data;
  }

  async findOne(input: { userId: string }) {
    const { userId } = input;

    const user = await userRepository.findOne({ user_id: userId });
    if (!user) {
      throw new NotFoundError({ message: `User with ID ${userId} not found` });
    }
    return user;
  }

  async createUser(input: { userData: CreateUserDto }) {
    const { userData } = input;
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const newUser = await userRepository.create({
      userData: {
        email: userData.email,
        password: hashedPassword,
        firstName: userData.first_name,
        lastName: userData.last_name,
        role: userData.role,
        avatar: _.get(userData, "avatar", null),
      },
    });

    return newUser;
  }

  async updateUser(input: { userId: string; userData: UpdateUserDto }) {
    const { userId, userData } = input;

    const existingUser = await this.findOne({ userId });
    if (!existingUser) {
      throw new NotFoundError({ message: `User with ID ${input.userId} not found` });
    }

    // Check email uniqueness if email is being updated
    if (userData.email) {
      const userWithEmail = await userRepository.findOne({ email: userData.email });
      if (userWithEmail && userWithEmail._id?.toString() !== userId) {
        throw new BadRequestError({ message: "Email already exists" });
      }
    }

    // Check optimistic concurrency if updated_at is provided
    if (
      userData.updated_at &&
      existingUser.updated_at &&
      userData.updated_at !== new Date(existingUser.updated_at).toISOString()
    ) {
      throw new BadRequestError({
        message: "Record was modified by another user. Please refresh and try again.",
      });
    }

    // Prepare update data
    const updateData = _.pickBy(
      {
        avatar: userData.avatar ?? null,
        email: userData.email,
        firstName: userData.first_name,
        lastName: userData.last_name,
        role: userData.role,
        updated_at: new Date(),
      },
      (value) => value !== undefined
    );

    const updatedUser = await userRepository.update({
      userId,
      userData: updateData,
    });

    return updatedUser;
  }

  async deleteUser(userId: string) {
    const deletedUser = await userRepository.delete(userId);

    if (!deletedUser) {
      throw new NotFoundError({ message: `User with ID ${userId} not found` });
    }

    return deletedUser;
  }
}

export default new UserService();
