# Headless game server. It simulates the scene without rendering (null renderer), so it
# needs no native GL/canvas libraries — a plain Node image is enough.
FROM node:20-bookworm-slim

WORKDIR /app/server

# Install server deps first for layer caching.
COPY server/package*.json ./
RUN npm install

# The server bundles shared client game code and reads model assets from ../client at
# build and run time, plus ../common at runtime. node_modules/dist are excluded via
# .dockerignore.
COPY common /app/common
COPY client /app/client
COPY server /app/server

# Bundle src/Scene.js -> dist/server-scene.js
RUN npm run build

EXPOSE 1337
CMD ["node", "server.js"]
