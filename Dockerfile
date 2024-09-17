FROM node:18-alpine as build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build --production

FROM joseluisq/static-web-server:2
COPY --from=build /app/dist /public

ENTRYPOINT ["/static-web-server", "--page404", "index.html", "--page50x", "index.html"]
