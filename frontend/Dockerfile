# Use official Node runtime
FROM node:20-alpine

WORKDIR /app

# 1. Copy package files FIRST (for better caching)
COPY package.json package-lock.json* ./

# 2. Install dependencies (Crucial for Deployment)
RUN npm install

# 3. Copy the rest of the app code
COPY . .

# Expose port
EXPOSE 3000

# Start command
CMD ["npm", "run", "dev"]