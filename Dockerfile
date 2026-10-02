FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build


FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY --from=build /app/dist/front ./dist/front

ENV NODE_ENV=production

ENV PORT=4000

EXPOSE 4000

CMD ["node", "dist/front/server/server.mjs"]
