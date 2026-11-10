# syntax=docker/dockerfile:1

# ---------- Stage 1: dependencies ----------
FROM node:22-bookworm-slim AS deps
WORKDIR /work

RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ---------- Stage 2: runnable test image ----------
# Official Playwright image: Node.js + browsers + all OS dependencies
FROM mcr.microsoft.com/playwright:v1.65.0-noble AS runtime
WORKDIR /work
RUN chown pwuser:pwuser /work

# Non-root user (the base image ships with pwuser:1000)
USER pwuser

COPY --from=deps --chown=pwuser:pwuser /work/node_modules ./node_modules
COPY --chown=pwuser:pwuser package.json pnpm-lock.yaml tsconfig.json playwright.config.ts ./
COPY --chown=pwuser:pwuser src ./src
COPY --chown=pwuser:pwuser tests ./tests
COPY --chown=pwuser:pwuser tests/visual/login.visual.spec.ts-snapshots ./tests/visual/login.visual.spec.ts-snapshots

ENV CI=true \
    TEST_ENV=staging \
    LOG_LEVEL=INFO

# Sanity check: the toolchain is functional
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD ./node_modules/.bin/playwright --version || exit 1

# Default: full chromium suite; override via `docker run <image> <args>`
ENTRYPOINT ["./node_modules/.bin/playwright", "test"]
CMD ["--project=chromium"]
