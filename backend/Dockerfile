# ─────────────────────────────────────────────────────────────
# AutoPilot Backend — Dockerfile
# Multi-stage build: compile TypeScript → minimal production image
# ─────────────────────────────────────────────────────────────

# ── Stage 1: Builder ──────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency manifests first (layer caching)
COPY package.json package-lock.json ./

# Install ALL deps (including devDeps needed for tsc)
RUN npm ci

# Copy source
COPY . .

# Compile TypeScript → dist/
RUN npm run build

# ── Stage 2: Production ───────────────────────────────────────
FROM node:22-alpine AS production

WORKDIR /app

# Copy only production dependency manifest
COPY package.json package-lock.json ./

# Install production deps only
RUN npm ci --omit=dev

# Copy compiled JS from builder stage
COPY --from=builder /app/dist ./dist

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Expose the Fastify port
EXPOSE 3001

# Healthcheck (used by Render, Railway, Docker Compose)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q -O- http://localhost:3001/health || exit 1

# Start the compiled server
CMD ["node", "dist/server.js"]
