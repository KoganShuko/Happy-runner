FROM node:14.15.4-alpine3.10 as node-server
COPY package.json yarn.lock ./
RUN yarn
COPY . .
RUN echo ls -l
CMD node ./dist/index.js
