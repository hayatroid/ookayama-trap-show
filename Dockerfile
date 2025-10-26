FROM node:20 AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package.json frontend/yarn.lock ./
RUN yarn install --frozen-lockfile

COPY frontend ./
RUN yarn run build

FROM node:20

WORKDIR /app/hono

COPY hono/package.json hono/yarn.lock ./
RUN yarn install --frozen-lockfile

COPY hono ./

COPY --from=frontend-builder /app/hono/dist ./dist

EXPOSE 3000
CMD ["yarn", "start"]
