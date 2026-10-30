# MITT website - production image
# Multi-stage so the runtime layer carries no toolchain and no dev dependencies.
#
# Build:  docker build -t mitt-website -f deploy/Dockerfile .
# Run:    docker run -p 3000:3000 --env-file .env.production -v mitt-leads:/app/var mitt-website

# ---------- deps ----------
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# ---------- build ----------
FROM node:22-alpine AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# NEXT_PUBLIC_* are inlined at build time, so the public origin must be known now.
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
RUN npm run build

# ---------- runtime ----------
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    MITT_LEAD_DIR=/app/var/enquiries

# Run unprivileged. The lead store lives on a mounted volume owned by this user.
RUN addgroup -S -g 1001 mitt && adduser -S -u 1001 -G mitt mitt \
 && mkdir -p /app/var/enquiries && chown -R mitt:mitt /app/var

COPY --from=build --chown=mitt:mitt /app/.next ./.next
COPY --from=build --chown=mitt:mitt /app/public ./public
COPY --from=build --chown=mitt:mitt /app/package.json ./package.json
COPY --from=build --chown=mitt:mitt /app/next.config.ts ./next.config.ts
COPY --from=deps  --chown=mitt:mitt /app/node_modules ./node_modules
COPY --from=build --chown=mitt:mitt /app/src ./src

USER mitt
EXPOSE 3000

# Container health uses the app's own probe, which reports lead-store writability.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["npm", "start", "--", "-p", "3000"]
