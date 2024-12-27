FROM node:22-alpine

ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV
WORKDIR /opt
COPY apps/server/package.tgz /opt/package.tgz
RUN tar -xzf package.tgz && rm package.tgz && mv package aoi-server
WORKDIR /opt/aoi-server
RUN npm install --omit=dev --omit=optional && npm cache clean --force

USER node

CMD [ "node", "lib/cli/index.js" ]
