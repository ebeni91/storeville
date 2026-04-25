FROM node:22-bookworm-slim AS builder

# Set working directory
WORKDIR /app

# ✅ DEVOPS FIX: Install dependencies in a separate layer for better Docker cache
# This layer is only invalidated when package.json/package-lock.json change,
# not on every code change.
COPY package.json package-lock.json* ./
# Copy node_modules pre-installed on host (avoids npm network calls inside Docker)
COPY node_modules ./node_modules

# Copy application source
COPY . .

# Disable telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# ✅ DEVOPS FIX: Build Next.js at image build time, NOT at container startup.
# This eliminates the 2-minute "build before start" delay on every container restart.
# The built .next/ output is baked into the image layer.
RUN npm run build

# ── Production runner ─────────────────────────────────────────────────────────
FROM node:22-bookworm-slim@sha256:d415caac2f1f77b98caaf9415c5f807e14bc8d7bdea62561ea2fef4fbd08a73c AS runner

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