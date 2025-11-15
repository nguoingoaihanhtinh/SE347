// User model for MongoDB
export interface User {
  _id?: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  avatar?: string | null;
  role: "student" | "company" | "admin" | "user";
  is_verified?: boolean;
  created_at?: Date;
  updated_at?: Date;
}
