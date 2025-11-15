import { describe, expect, it } from "@jest/globals";
import request from "supertest";
import { createApp } from "../createApp";

const app = createApp();

describe("App Tests", () => {
  it("should return 404 for non-existent routes", async () => {
    const response = await request(app).get("/non-existent-route");
    expect(response.status).toBe(404);
  });

  it("should handle CORS preflight requests", async () => {
    const response = await request(app).options("/");
    expect(response.headers["access-control-allow-origin"]).toBeTruthy();
  });
});
