# Use official Node runtime
FROM node:20-alpine

WORKDIR /app

# Install dependencies based on package.json (created later)
# COPY package.json package-lock.json* ./

# Check if package.json exists, if so install, else do nothing (for first run)
# RUN if [ -f package.json ]; then npm install; fi

COPY . .

# Expose port
EXPOSE 3000

# Start command (Dev mode)
CMD ["npm", "run", "dev"]