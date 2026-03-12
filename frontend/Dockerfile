FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies first (for better Docker caching)
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the application
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# We disable it here for privacy.
ENV NEXT_TELEMETRY_DISABLED 1

# Start the development server
CMD ["npm", "run", "dev"]