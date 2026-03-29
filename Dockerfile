# ── Stage 1: Build ────────────────────────────────────
FROM oven/bun:1.3.11-alpine AS builder

# Зависимости для компиляции нативных модулей (better-sqlite3)
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Кэшируем зависимости отдельным слоем
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

# ── Stage 2: Runtime ─────────────────────────────────
FROM oven/bun:1.3.11-alpine

RUN apk add --no-cache curl \
    && addgroup -S app && adduser -S app -G app

WORKDIR /app

# Nuxt output — Nitro сервер + public assets
COPY --from=builder /app/.output ./.output

# Non-root
USER app

EXPOSE 3000

ENV HOST=0.0.0.0
ENV PORT=3000
ENV NODE_ENV=production

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

ENTRYPOINT ["bun", ".output/server/index.mjs"]
