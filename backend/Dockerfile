# Multi-stage build для оптимизации размера образа

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 3: Production
FROM node:20-alpine AS production
WORKDIR /app

# Создаем пользователя без root прав
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Копируем зависимости и build
COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

USER nodejs

EXPOSE 4000

ENV NODE_ENV=production

CMD ["node", "dist/server.js"]

# Stage 4: Development
FROM node:20-alpine AS development
WORKDIR /app

# Устанавливаем зависимости
COPY package*.json ./
RUN npm install

# Копируем конфигурационные файлы
COPY tsconfig.json ./
COPY nodemon.json ./

# Копируем исходный код
COPY . .

EXPOSE 4000

ENV NODE_ENV=development

# Используем nodemon с ts-node для hot reload
CMD ["npm", "run", "dev"]
