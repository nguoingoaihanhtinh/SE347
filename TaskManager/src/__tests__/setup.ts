import { config } from "dotenv";
import path from "path";

// Load environment variables from .env file
config({ path: path.resolve(__dirname, "../../.env") });

// Mock test data
const mockUser = {
  id: "1",
  name: "testuser",
  email: "test@example.com",
  password: "hashedpassword123",
  role: "student",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockUsers = [mockUser];

// Mock Supabase client
const mockSupabase = {
  from: () => ({
    select: () => ({
      single: () => Promise.resolve({ data: mockUser, error: null }),
      eq: (field: string, value: string) => ({
        single: () => {
          if (value === "999999") {
            return Promise.resolve({ data: null, error: { message: "not found" } });
          }
          return Promise.resolve({ data: mockUser, error: null });
        },
      }),
      // For GET all users (no eq condition)
      then: (resolve: any) => resolve({ data: mockUsers, error: null }),
    }),
    insert: (data: any) => ({
      select: () => ({
        single: () => Promise.resolve({ data: { ...mockUser, ...data }, error: null }),
      }),
    }),
    update: (data: any) => ({
      eq: (field: string, value: string) => ({
        select: () => ({
          single: () => {
            if (value === "999999") {
              return Promise.resolve({ data: null, error: { message: "not found" } });
            }
            return Promise.resolve({ data: { ...mockUser, ...data }, error: null });
          },
        }),
      }),
    }),
    delete: () => ({
      eq: (field: string, value: string) => ({
        select: () => ({
          single: () => {
            if (value === "999999") {
              return Promise.resolve({ data: null, error: { message: "not found" } });
            }
            return Promise.resolve({ data: mockUser, error: null });
          },
        }),
      }),
    }),
  }),
};

// Mock the Supabase client
jest.mock("@supabase/supabase-js", () => ({
  createClient: () => mockSupabase,
}));

// Mock the local Supabase configuration
jest.mock("../config/supabase", () => ({
  supabase: mockSupabase,
}));

// Global test setup
global.beforeAll(() => {
  jest.clearAllMocks();
});

// Global test teardown
global.afterAll(() => {
  jest.restoreAllMocks();
});
