FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build && ls /app/dist/
EXPOSE 3000
CMD ["sh", "-c", "npm run db:migrate && node /app/dist/main.js"]
