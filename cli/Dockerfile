FROM node:20-bookworm-slim

WORKDIR /former2

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY cli/ cli/
COPY js/ js/

ENTRYPOINT ["node", "cli/main.js"]
