FROM node:20-alpine

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY src ./src

ENV NODE_ENV=production PORT=3000
EXPOSE 3000
CMD ["sh", "-c", "npm run seed && npm start"]
