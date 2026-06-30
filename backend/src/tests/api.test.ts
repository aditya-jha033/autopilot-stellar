import { describe, it, expect, beforeAll, afterAll } from "vitest";
import Fastify, { FastifyInstance } from "fastify";
import vaultRoutes from "../routes/vault";
import authRoutes from "../routes/auth";

describe("AutoPilot Backend E2E API Tests", () => {
  let server: FastifyInstance;

  beforeAll(async () => {
    server = Fastify();

    // Register basic plugins needed by routes
    await server.register(import("@fastify/jwt"), { 
      secret: "test-secret",
      cookie: {
        cookieName: "session",
        signed: false,
      }
    });
    await server.register(import("@fastify/cookie"));

    // Register routes to test
    server.register(authRoutes, { prefix: "/api/auth" });
    server.register(vaultRoutes, { prefix: "/api/vault" });

    // Dummy health route to test server is up
    server.get("/health", async () => {
      return { status: "ok" };
    });

    await server.ready();
  });

  afterAll(async () => {
    await server.close();
  });

  it("Test 1: Healthcheck should return 200 OK", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/health",
    });
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.payload)).toEqual({ status: "ok" });
  });

  it("Test 2: Protected /api/vault should return 401 when unauthenticated", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/api/vault",
    });
    // The verifyAuth hook should catch the missing JWT and block access
    expect(response.statusCode).toBe(401);
    expect(JSON.parse(response.payload)).toHaveProperty("error");
  });

  it("Test 3: Creating an invalid vault type should fail validation (400)", async () => {
    // We will bypass the auth hook for this specific test by injecting a valid signed token
    const token = server.jwt.sign({ id: "123", publicKey: "G123" });
    
    const response = await server.inject({
      method: "POST",
      url: "/api/vault/invalid_type",
      cookies: { session: token }
    });

    // Our route explicitly blocks vault types that aren't "savings" or "investment"
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.payload).error).toMatch(/Invalid vault type/);
  });

  it("Test 4: Login requires a public key", async () => {
    const response = await server.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: {}
    });
    
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.payload).error).toBe("publicKey is required");
  });
});
