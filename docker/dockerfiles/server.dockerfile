FROM node:18-alpine

RUN corepack enable
WORKDIR /opt
COPY apps/server/package.tgz /opt/package.tgz
RUN tar -xzf package.tgz && rm package.tgz && mv package aoi-server
WORKDIR /opt/aoi-server
RUN npm install --omit=dev --omit=optional

USER node

CMD [ "node", "lib/cli/index.js" ]
