# STAGE 1
FROM node:16-alpine as builder
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY package.json yarn.lock ./
RUN yarn global add typescript ts-node rimraf

# RUN yarn global add copyfiles
USER node
RUN yarn install --production --frozen-lockfile --pure-lockfile
COPY --chown=node:node . .
RUN rimraf dist/
RUN tsc
COPY src/templates dist/src/templates


# STAGE 2
FROM node:16-alpine
RUN apk add --no-cache --upgrade bash
WORKDIR /home/node/app
COPY ecosystem.config.json wait-for-it.sh ./
COPY --from=builder /home/node/app/dist ./dist

EXPOSE 4400