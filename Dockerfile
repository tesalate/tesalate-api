# STAGE 1
FROM node:16-alpine as ts-compiler
RUN mkdir -p /home/node/app/node_modules
WORKDIR /home/node/app
COPY package.json yarn.lock ./
RUN chown -R node:node /home/node/app
RUN yarn global add typescript ts-node rimraf

# RUN yarn global add copyfiles
USER node
RUN yarn install
COPY --chown=node:node . .
RUN rimraf dist/
RUN tsc
COPY src/templates dist/src/templates

# STAGE 2
FROM node:16-alpine as ts-remover
WORKDIR /home/node/app
COPY --from=ts-compiler /home/node/app/package.json ./
COPY --from=ts-compiler /home/node/app/yarn.lock ./
COPY --from=ts-compiler /home/node/app/dist ./dist/
RUN yarn install --production


# STAGE 3
FROM node:16-alpine
RUN apk add --no-cache --upgrade bash
WORKDIR /home/node/app
COPY ecosystem.config.json wait-for-it.sh ./
COPY --from=ts-remover /home/node/app/ ./

EXPOSE 4400

CMD yarn start