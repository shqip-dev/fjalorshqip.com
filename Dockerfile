# The build stage runs on the *builder's* architecture, never the target's.
# What it produces is `dist` — static HTML, CSS, JS and JSON with nothing
# architecture-specific in it — so one build serves any target image; only the
# runtime stage below is worth building per architecture.
#
# The workflow publishes linux/amd64 only, so today this pin changes nothing.
# It is here for the day someone adds a second platform back: building this
# stage under QEMU for linux/arm64 killed node with a SIGILL (`uncaught target
# signal 4`, exit 132) part-way through prerendering the word pages. Keep the
# pin and that leg never gets emulated in the first place.
#
# BuildKit sets BUILDPLATFORM itself; the default is for the legacy builder,
# which leaves it empty and would otherwise fail to parse the platform.
ARG BUILDPLATFORM=linux/amd64
FROM --platform=$BUILDPLATFORM node:24-alpine AS build

# `prebuild` only emits dictionary entries when NODE_ENV=production (see src/lib/env.ts).
# npm used to set this implicitly for `npm run build --production`; pnpm does not, so it
# has to be explicit or the build silently produces an empty src/data/gen.
ENV NODE_ENV=production
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

WORKDIR /app

RUN corepack enable

# The `postbuild` step draws the social cards with sharp, whose text rendering goes
# through pango and fontconfig. It works without this package — the cards come out
# with the same glyphs and the same metrics — but fontconfig then prints
# "Cannot load default config file" twice per card, which is ~75k lines of build log.
RUN apk add --no-cache fontconfig

# .npmrc carries enable-pre-post-scripts=true, without which `pnpm build` skips `prebuild`.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
# --prod=false because NODE_ENV=production would otherwise drop the devDependencies that
# `astro check` needs (@astrojs/check, typescript, the @types packages).
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
