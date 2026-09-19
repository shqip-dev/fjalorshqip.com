FROM node:24-alpine AS build

# `prebuild` only emits dictionary entries when NODE_ENV=production (see src/lib/env.ts).
# npm used to set this implicitly for `npm run build --production`; pnpm does not, so it
# has to be explicit or the build silently produces an empty src/data/gen.
ENV NODE_ENV=production
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

WORKDIR /app

RUN corepack enable

# .npmrc carries enable-pre-post-scripts=true, without which `pnpm build` skips `prebuild`.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
# --prod=false because NODE_ENV=production would otherwise drop ts-node, which `prebuild` needs.
RUN pnpm install --frozen-lockfile --prod=false

COPY astro.config.mjs astro.config.mjs
COPY data data
COPY public public
COPY src src
COPY tsconfig.json tsconfig.json

RUN pnpm build

FROM joseluisq/static-web-server:2
COPY --from=build /app/dist /public

ENTRYPOINT ["/static-web-server", "--page404", "index.html", "--page50x", "index.html"]
