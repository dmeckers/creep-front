# FROM oven/bun:1 AS base <--- BUN DOES NOT WORK WITH VUE CLI DEV SERVER @TODO TRY ON PROD WITH BUILDED ASSETS
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install
RUN npm i -G @vue/cli
RUN npm i -G @vue/cli-init@5.0.8

COPY . .

EXPOSE 5173

CMD ["npm" , "run", "dev"]
