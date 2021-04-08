FROM node:12-alpine3.10
COPY package.json .
RUN yarn
RUN yarn global add @vercel/ncc
COPY . .
RUN ncc build .github/actions/getRandomReviewer/index.js -o .github/actions/getRandomReviewer/dist/
CMD node /dist/index.js
