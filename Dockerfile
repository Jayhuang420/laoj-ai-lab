FROM --platform=linux/amd64 node:20-slim

# Install build tools for native addons (better-sqlite3, @tailwindcss/oxide)
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files first for layer caching
COPY package.json package-lock.json ./

# Use npm install (not npm ci) to correctly resolve platform-specific
# optional dependencies for @tailwindcss/oxide native binary.
# The lockfile was generated on Windows; npm install re-resolves
# platform-specific packages (linux-x64-gnu) for the current OS.
RUN npm install --include=dev

# Copy source code
COPY . .

# Build Vite frontend (Tailwind CSS v4 uses @tailwindcss/oxide native binary)
RUN npm run build

# Create data directory (will be overridden by persistent volume mount)
RUN mkdir -p /data

# Default port (Zeabur will set PORT env var)
ENV PORT=8080
EXPOSE 8080

# Start Express server using tsx (TypeScript runner)
CMD ["npx", "tsx", "server/index.ts"]
