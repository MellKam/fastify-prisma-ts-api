FROM node:16.15

WORKDIR /usr/src/app

RUN npm i -g pnpm

COPY ./package.json ./pnpm-lock.yaml ./

RUN npx pnpm install --frozen-lockfile --ignore-scripts --prod 

COPY . .

EXPOSE ${PORT}