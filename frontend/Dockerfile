FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# ✅ DEVOPS FIX: Install dependencies in a separate layer for better Docker cache
# This layer is only invalidated when package.json/package-lock.json change,
# not on every code change.
COPY package.json package-lock.json* ./
RUN npm ci --prefer-offline

# Copy application source
COPY . .

# Disable telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# ✅ DEVOPS FIX: Build Next.js at image build time, NOT at container startup.
# This eliminates the 2-minute "build before start" delay on every container restart.
# The built .next/ output is baked into the image layer.
RUN npm run build

# ── Production runner ─────────────────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Copy only what we need to run the server (not dev dependencies or source)
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

# Start the production server
CMD ["npm", "start"]