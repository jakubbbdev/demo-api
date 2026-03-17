FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY src/ ./src/
EXPOSE 3000
ENV REDIS_HOST=172.17.0.1
ENV REDIS_PASSWORD=Ltx0H6pSuvd3kbIo
ENV MINIO_HOST=172.17.0.1
ENV MINIO_PORT=9001
ENV MINIO_ACCESS_KEY=admin
ENV MINIO_SECRET_KEY=Ltx0H6pSuvd3kbIo
CMD ["node", "src/index.js"]