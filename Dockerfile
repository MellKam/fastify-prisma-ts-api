FROM node:16.15

WORKDIR /usr/src/app

RUN npm i -g pnpm

COPY ./package.json ./pnpm-lock.yaml ./

RUN if [ "$NODE_ENV" = "production" ]; \
    then npx pnpm install --frozen-lockfile --ignore-scripts --prod; \
    else npx pnpm install --frozen-lockfile --ignore-scripts; \
    fi 

COPY . .

EXPOSE ${PORT}