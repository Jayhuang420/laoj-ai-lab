FROM node:18-slim

# Install build tools for better-sqlite3 native addon (fallback if prebuilds miss)
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files and install ALL dependencies
# --include=dev ensures tsx (runtime) and tailwindcss (build) are always installed
COPY package.json package-lock.json ./
RUN npm ci --include=dev

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
