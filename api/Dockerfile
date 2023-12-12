# Base image
FROM node:20-alpine

# Create app directory
WORKDIR /app

COPY package*.json .

RUN npm ci

COPY . .

RUN npm run build

CMD ["npm", "run", "start:dev"]