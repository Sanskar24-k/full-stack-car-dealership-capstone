FROM node:20-alpine

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY src ./src

ENV NODE_ENV=production PORT=3000
EXPOSE 3000
CMD ["sh", "-c", "if [ -n \"$MONGODB_HOSTPORT\" ] && [ -z \"$MONGODB_URI\" ]; then export MONGODB_URI=\"mongodb://$MONGODB_HOSTPORT/car_dealership\"; fi; seeded=0; for attempt in 1 2 3 4 5 6 7 8 9 10; do if npm run seed; then seeded=1; break; fi; echo 'Waiting for MongoDB...'; sleep 3; done; [ \"$seeded\" = 1 ] || exit 1; npm start"]
