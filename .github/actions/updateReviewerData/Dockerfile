FROM node:12-alpine3.10
COPY package.json .
RUN yarn
COPY . .
CMD node /dist/index.js
