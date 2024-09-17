FROM node:18-alpine as build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY astro.config.mjs astro.config.mjs
COPY data data
COPY public public
COPY src src
COPY tsconfig.json tsconfig.json

RUN npm run build --production >> /dev/null

FROM joseluisq/static-web-server:2
COPY --from=build /app/dist /public

ENTRYPOINT ["/static-web-server", "--page404", "index.html", "--page50x", "index.html"]
