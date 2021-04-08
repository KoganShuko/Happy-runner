FROM node:12-alpine3.10
COPY package.json .
RUN yarn
RUN yarn global add @vercel/ncc
RUN ncc build .github/actions/{название экшена}/index.js -o .github/actions/{название экшена}/dist/
COPY . .
CMD node /dist/index.js
