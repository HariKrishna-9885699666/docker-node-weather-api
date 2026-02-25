FROM node:20-alpine

WORKDIR /app

RUN corepack enable && corepack prepare yarn@4.12.0 --activate

ENV YARN_NODE_LINKER=node-modules

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "src/server.js"]