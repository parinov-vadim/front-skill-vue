# ── Stage 1: Build ────────────────────────────────────
FROM node:22-alpine AS builder

# Bun для установки зависимостей + python/make/g++ для нативных модулей
RUN apk add --no-cache python3 make g++ \
    && npm i -g bun

WORKDIR /app

# Кэшируем зависимости отдельным слоем
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN npx nuxi build

# ── Stage 2: Runtime ─────────────────────────────────
FROM node:22-alpine

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

ENTRYPOINT ["node", ".output/server/index.mjs"]
