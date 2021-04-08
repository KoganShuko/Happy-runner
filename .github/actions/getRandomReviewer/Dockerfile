FROM node:12-alpine3.10
COPY package.json .
RUN yarn
COPY . .
RUN yarn global add @vercel/ncc
RUN ncc build ./.github/actions/getRandomReviewer/index.js -o ./.github/actions/getRandomReviewer/dist/
CMD node /dist/index.js
