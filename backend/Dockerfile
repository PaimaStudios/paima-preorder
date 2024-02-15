FROM node:18-bookworm-slim AS x-builder
ARG APP=/app
WORKDIR ${APP}
COPY package*.json ./
COPY tsconfig*.json ./
RUN npm i --ignore-scripts
COPY ./.swcrc ./.swcrc
COPY ./src ./src
ENV NODE_ENV=production
RUN npm run build --ignore-scripts \
    && npm i --omit=dev --ignore-scripts

########################################################

FROM gcr.io/distroless/nodejs:18 AS tarochi-sale-backend
ENV TZ=Etc/UTC \
    NODE_ENV=production
ARG APP=/app
WORKDIR ${APP}
COPY --from=x-builder ${APP}/build ./build
COPY --from=x-builder ${APP}/node_modules ./node_modules
USER nonroot
CMD ["build/index.js"]
