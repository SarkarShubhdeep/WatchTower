# Build and run the Next.js app with Bun.
# Optional: use with docker-compose to run the full stack (app + MongoDB).
FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
COPY app/package.json app/bun.lock ./
RUN bun install --frozen-lockfile

# Copy source and build
COPY app/ .
RUN bun run build

EXPOSE 3000
ENV NODE_ENV=production
CMD ["bun", "run", "start"]
