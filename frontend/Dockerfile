# Multi-stage build для Next.js

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Устанавливаем переменные окружения для build time
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN npm run build

# Stage 3: Production
FROM node:20-alpine AS production
WORKDIR /app

# Создаем пользователя без root прав
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Копируем необходимые файлы
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

# Stage 4: Development
FROM node:20-alpine AS development
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

ENV NODE_ENV=development

CMD ["npm", "run", "dev"]
