#
FROM node:14 AS BUILD_IMAGE

WORKDIR /app

COPY ./src/ /app

RUN npm install
RUN npm prune --production

#
FROM node:14-alpine

WORKDIR /app

# copy from build image
COPY --from=BUILD_IMAGE /app/index.js ./index.js
COPY --from=BUILD_IMAGE /app/node_modules ./node_modules

ENTRYPOINT ["node", "index.js"]