FROM node:20-bookworm-slim

WORKDIR /former2

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY cli/ cli/
COPY shared/ shared/
COPY js/ js/

ENTRYPOINT ["node", "/former2/cli/main.js"]
