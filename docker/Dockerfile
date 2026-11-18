# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS deps
WORKDIR /work

RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM mcr.microsoft.com/playwright:v1.65.0-noble AS runtime
WORKDIR /work
RUN chown pwuser:pwuser /work

USER pwuser

COPY --from=deps --chown=pwuser:pwuser /work/node_modules ./node_modules
COPY --chown=pwuser:pwuser package.json pnpm-lock.yaml tsconfig.json playwright.config.ts ./
COPY --chown=pwuser:pwuser src ./src
COPY --chown=pwuser:pwuser tests ./tests

ENV CI=true \
    TEST_ENV=staging \
    LOG_LEVEL=INFO

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD ./node_modules/.bin/playwright --version || exit 1

ENTRYPOINT ["./node_modules/.bin/playwright", "test"]
CMD ["--project=chromium"]
