FROM node:22.23.4-alpine@sha256:ce8d97f7cfc7c5386421eb932df20a29df99b1a7f469f6157d5c9956702ffadc

WORKDIR /app
COPY server.mjs /app/server.mjs

EXPOSE 8787

CMD ["node", "/app/server.mjs"]
