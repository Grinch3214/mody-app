FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN ls /app/src/ && ./node_modules/.bin/tsc -p tsconfig.build.json && ls /app/dist/
EXPOSE 3000
CMD ["sh", "-c", "npm run db:migrate && node /app/dist/main.js"]
