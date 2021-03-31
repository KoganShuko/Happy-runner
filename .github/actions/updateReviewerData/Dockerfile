FROM node:15
COPY package.json .
RUN yarn
COPY . .
CMD node ./dist/index.js
