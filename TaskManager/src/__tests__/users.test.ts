import { describe, expect, it } from "@jest/globals";
import request from "supertest";
import { createApp } from "../createApp";

const app = createApp();

describe("Users API Endpoints", () => {
  describe("GET /api/users", () => {
    it("should return all users", async () => {
      const response = await request(app).get("/api/users");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("data");
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe("POST /api/users", () => {
    it("should create a new user", async () => {
      const newUser = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
        role: "student",
      };

      const response = await request(app).post("/api/users").send(newUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("data");
      expect(response.body.data).toHaveProperty("name", newUser.username);
      expect(response.body.data).toHaveProperty("email", newUser.email);
    });

    it("should return 400 if required fields are missing", async () => {
      const invalidUser = {
        email: "test@example.com",
      };

      const response = await request(app).post("/api/users").send(invalidUser);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("success", false);
    });
  });

  describe("GET /api/users/:id", () => {
    const userId = "1";

    it("should return a user by ID", async () => {
      const response = await request(app).get(`/api/users/${userId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("data");
      expect(response.body.data).toHaveProperty("id", userId);
    });

    it("should return 404 if user not found", async () => {
      const response = await request(app).get("/api/users/999999");

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("success", false);
    });
  });

  describe("PUT /api/users/:id", () => {
    const userId = "1";

    it("should update a user", async () => {
      const updateData = {
        username: "updateduser",
      };

      const response = await request(app).put(`/api/users/${userId}`).send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.data).toHaveProperty("name", updateData.username);
    });

    it("should return 404 if user not found", async () => {
      const response = await request(app).put("/api/users/999999").send({
        username: "nonexistent",
      });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("success", false);
    });
  });

  describe("DELETE /api/users/:id", () => {
    const userId = "1";

    it("should delete a user", async () => {
      const response = await request(app).delete(`/api/users/${userId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
    });

    it("should return 404 if user to delete is not found", async () => {
      const response = await request(app).delete("/api/users/999999");

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("success", false);
    });
  });
});
