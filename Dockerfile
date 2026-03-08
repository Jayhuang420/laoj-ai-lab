FROM node:18-alpine

# Install build dependencies for better-sqlite3 native addon
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files and install all dependencies (including devDeps for tsx)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Build Vite frontend
RUN npm run build

# Create data directory (will be overridden by persistent volume mount)
RUN mkdir -p /data

# Default port (Zeabur will set PORT env var)
ENV PORT=8080
EXPOSE 8080

# Start Express server using tsx (TypeScript runner)
CMD ["npx", "tsx", "server/index.ts"]
