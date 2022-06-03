FROM node:16.15

WORKDIR /usr/src/app

RUN curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm

COPY ./package.json ./pnpm-lock.yaml ./

ENV HUSKY_SKIP_INSTALL=1
RUN npx pnpm install --frozen-lockfile

COPY . .

EXPOSE ${PORT}