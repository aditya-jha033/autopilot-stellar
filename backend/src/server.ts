import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import cookie from "@fastify/cookie";
import rateLimit from "@fastify/rate-limit";
import dotenv from "dotenv";

import authRoutes from "./routes/auth";
import rulesRoutes from "./routes/rules";
import goalsRoutes from "./routes/goals";
import chatRoutes from "./routes/chat";
import transactionsRoutes from "./routes/transactions";
import accountRoutes from "./routes/account";
import autopilotRoutes from "./routes/autopilot";
import vaultRoutes from "./routes/vault";
import { startEngine } from "./engine/index";

dotenv.config();

const server = Fastify({
  logger: true,
  trustProxy: true,
});

// Build allowed origins: always allow localhost in dev + any FRONTEND_URL set in env
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
].filter(Boolean) as string[];

server.register(cors, {
  origin: (origin, cb) => {
    // Allow requests with no origin (e.g., curl, Render health checks)
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin '${origin}' not allowed`), false);
  },
  credentials: true,
});

server.register(jwt, {
  secret: process.env.JWT_SECRET || "super-secret-key-for-dev",
  cookie: {
    cookieName: "session",
    signed: false,
  },
});

server.register(cookie);

server.register(rateLimit, {
  max: 100,
  timeWindow: "1 minute",
});

// Decorate request with user (from JWT)
declare module "@fastify/jwt" {
  interface FastifyJWT {
    user: {
      id: string;
      publicKey: string;
    };
  }
}

// Register routes
server.register(authRoutes, { prefix: "/api/auth" });
server.register(rulesRoutes, { prefix: "/api/rules" });
server.register(goalsRoutes, { prefix: "/api/goals" });
server.register(chatRoutes, { prefix: "/api/chat" });
server.register(transactionsRoutes, { prefix: "/api/transactions" });
server.register(accountRoutes, { prefix: "/api/account" });
server.register(autopilotRoutes, { prefix: "/api/autopilot" });
server.register(vaultRoutes, { prefix: "/api/vault" });

// Root info route — helpful if you accidentally open port 3001 in a browser
server.get("/", async () => {
  return {
    name: "AutoPilot API",
    status: "running",
    version: "1.0.0",
    message: "This is the AutoPilot backend REST API. Open http://localhost:3000 to use the app.",
    endpoints: [
      "GET /health",
      "POST /api/auth/login",
      "POST /api/auth/logout",
      "GET /api/rules",
      "POST /api/rules",
      "PATCH /api/rules/:id",
      "DELETE /api/rules/:id",
      "GET /api/goals",
      "POST /api/goals",
      "GET /api/transactions",
      "GET /api/account",
      "PATCH /api/account",
      "POST /api/chat",
      "GET /api/autopilot/status",
      "POST /api/autopilot/monitor",
    ],
  };
});

// Suppress favicon.ico 404 noise
server.get("/favicon.ico", async (_, reply) => {
  reply.status(204).send();
});

// Health check
server.get("/health", async () => {
  return { status: "ok" };
});

const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;
    await server.listen({ port, host: "0.0.0.0" });
    console.log(`Server listening on http://localhost:${port}`);

    // Start the automation engine AFTER the HTTP server is up
    const stopEngine = await startEngine();

    // Graceful shutdown on SIGTERM (Render, Railway, Docker)
    const shutdown = async (signal: string) => {
      console.log(`\n[Server] ${signal} received — shutting down gracefully…`);
      await stopEngine();
      await server.close();
      process.exit(0);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT",  () => shutdown("SIGINT"));

  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
