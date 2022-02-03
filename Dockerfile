# STAGE 1
FROM node:16-alpine as builder
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY package.json yarn.lock ./
RUN yarn global add typescript
RUN yarn global add ts-node
RUN yarn global add rimraf
# RUN yarn global add copyfiles
USER node
RUN yarn install
COPY --chown=node:node . .
RUN rimraf dist/
RUN tsc
COPY src/templates dist/src/templates


# STAGE 2
FROM node:16-alpine
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
RUN apk add --no-cache --upgrade bash curl
WORKDIR /home/node/app
COPY ecosystem.config.json ./
COPY package.json yarn.lock ./
USER node
RUN yarn install --pure-lockfile
COPY --from=builder /home/node/app/dist ./dist


# COPY --chown=node:node .env ./dist/
COPY wait-for-it.sh .

EXPOSE 4400
# CMD [ "node", "dist/src.index.js" ]