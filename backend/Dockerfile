# Development Dockerfile
FROM node:20-slim

# Install OpenSSL for Prisma
RUN apt-get update -y && \
    apt-get install -y openssl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy all files
COPY . .

# Install dependencies
RUN npm install

# Expose ports
EXPOSE 4000 5555

# Generate Prisma and start server
CMD ["sh", "-c", "npx prisma generate && npm run dev"]
